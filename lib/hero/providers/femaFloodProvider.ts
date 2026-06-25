import { geocodeAddress } from "@/lib/hero/providers/googleMapsProvider";
import type { HeroFloodData, HeroFloodSignal } from "@/lib/hero/providers/types";

export type FloodProviderInput = {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

const source = "FEMA National Flood Hazard Layer";
const unavailableReason = "Flood data unavailable - FEMA did not return usable data.";

type FemaFeature = {
  attributes?: Record<string, unknown>;
};
type FemaAttempt = { layer: number; status: number; ok: boolean };

export async function getFemaFloodData(input: FloodProviderInput): Promise<HeroFloodData> {
  try {
    const coordinates = await resolveCoordinates(input);
    if (!coordinates) {
      return unavailable("Flood data unavailable - coordinates are required for FEMA lookup.");
    }

    const { feature, attempts } = await queryFemaFloodHazardLayer(coordinates.latitude, coordinates.longitude);
    if (!feature?.attributes) {
      return unavailable(unavailableReason, attempts);
    }

    return normalizeFemaFeature(feature.attributes, attempts);
  } catch (error) {
    console.warn("FEMA flood lookup unavailable", error instanceof Error ? error.message : "unknown error");
    return unavailable(unavailableReason);
  }
}

async function resolveCoordinates(input: FloodProviderInput) {
  if (isFiniteNumber(input.latitude) && isFiniteNumber(input.longitude)) {
    return { latitude: input.latitude, longitude: input.longitude };
  }

  const address = input.address || [input.address, input.city, input.state, input.zip].filter(Boolean).join(", ");
  if (!address || !process.env.GOOGLE_MAPS_API_KEY) {
    return null;
  }

  const geocoded = await geocodeAddress(address);
  if (isFiniteNumber(geocoded.latitude) && isFiniteNumber(geocoded.longitude)) {
    return { latitude: geocoded.latitude, longitude: geocoded.longitude };
  }

  return null;
}

async function queryFemaFloodHazardLayer(latitude: number, longitude: number): Promise<{ feature: FemaFeature | null; attempts: FemaAttempt[] }> {
  const attempts: FemaAttempt[] = [];
  const candidateLayers = [28, 16, 14, 8];

  for (const layer of candidateLayers) {
    const url = new URL(`${femaNfhlServiceUrl()}/${layer}/query`);
    url.searchParams.set("f", "json");
    url.searchParams.set("geometry", `${longitude},${latitude}`);
    url.searchParams.set("geometryType", "esriGeometryPoint");
    url.searchParams.set("inSR", "4326");
    url.searchParams.set("spatialRel", "esriSpatialRelIntersects");
    url.searchParams.set("outFields", "FLD_ZONE,ZONE_SUBTY,SFHA_TF,DFIRM_ID,VERSION_ID,FLD_AR_ID,SOURCE_CIT,LABEL");
    url.searchParams.set("returnGeometry", "false");

    const response = await fetch(url, { headers: { Accept: "application/json" } });
    attempts.push({ layer, status: response.status, ok: response.ok });
    if (!response.ok) continue;

    const payload = (await response.json()) as { features?: FemaFeature[] };
    const feature = payload.features?.[0] ?? null;
    if (feature?.attributes) return { feature, attempts };
  }

  return { feature: null, attempts };
}

function normalizeFemaFeature(attributes: Record<string, unknown>, attempts: FemaAttempt[]): HeroFloodData {
  const floodZone = stringOrNull(attributes.FLD_ZONE);
  const zoneSubtype = stringOrNull(attributes.ZONE_SUBTY);
  const label = stringOrNull(attributes.LABEL);
  const signal = mapFloodSignal(floodZone, zoneSubtype);
  const sfha = stringOrNull(attributes.SFHA_TF);

  return {
    provider: "fema_nfhl",
    unavailable: false,
    heroFloodSignal: signal,
    floodZone,
    floodZoneDescription: floodDescription(signal, floodZone, zoneSubtype, label),
    specialFloodHazardArea: sfha ? sfha.toUpperCase() === "T" : signal === "High" ? true : signal === "Minimal" || signal === "Moderate" ? false : null,
    firmPanel: stringOrNull(attributes.DFIRM_ID),
    effectiveDate: stringOrNull(attributes.VERSION_ID),
    confidence: 0.82,
    source,
    lastUpdated: new Date().toISOString().slice(0, 10),
    rawData: { attempts, attributes: sanitizeRawData(attributes) },
  };
}

export function mapFloodSignal(floodZone: string | null, zoneSubtype?: string | null): HeroFloodSignal {
  const zone = floodZone?.trim().toUpperCase() ?? "";
  const subtype = zoneSubtype?.trim().toUpperCase() ?? "";

  if (["V", "VE"].some((prefix) => zone.startsWith(prefix))) return "High";
  if (["A", "AE", "AH", "AO", "AR", "A99"].some((prefix) => zone.startsWith(prefix))) return "High";
  if (zone === "X" && /0\.2|SHADED|MODERATE/i.test(subtype)) return "Moderate";
  if (zone === "X") return "Minimal";
  if (!zone) return "Unknown";
  return "Unknown";
}

function floodDescription(signal: HeroFloodSignal, floodZone: string | null, zoneSubtype: string | null, label: string | null) {
  if (signal === "High" && floodZone?.toUpperCase().startsWith("V")) {
    return "Property may be within a coastal flood hazard area.";
  }

  if (signal === "High") {
    return "Property may be within a Special Flood Hazard Area.";
  }

  if (signal === "Moderate") {
    return "Property may be within a moderate flood hazard area.";
  }

  if (signal === "Minimal") {
    return "Property appears to be within a minimal flood hazard area.";
  }

  return label || zoneSubtype || "Flood hazard category is unknown for this location.";
}

function femaNfhlServiceUrl() {
  const base = (process.env.FEMA_NFHL_BASE_URL || "https://hazards.fema.gov").replace(/\/+$/, "");
  if (/\/MapServer$/i.test(base)) return base;
  if (/\/gis\/nfhl\/rest\/services\/public\/NFHL$/i.test(base)) return `${base}/MapServer`;
  return `${base}/gis/nfhl/rest/services/public/NFHL/MapServer`;
}

function unavailable(reason: string, attempts: FemaAttempt[] = []): HeroFloodData {
  return {
    provider: "none",
    unavailable: true,
    unavailableReason: reason,
    heroFloodSignal: "Unknown",
    floodZone: null,
    floodZoneDescription: null,
    specialFloodHazardArea: null,
    confidence: 0,
    source,
    lastUpdated: null,
    rawData: attempts.length ? { attempts } : undefined,
  };
}

function sanitizeRawData(attributes: Record<string, unknown>) {
  return { ...attributes };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function stringOrNull(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}
