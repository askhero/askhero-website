import { normalizeCrimeRiskScore, toHeroCrimeSignal, type CrimeProviderInput } from "@/lib/hero/providers/crimeProvider";
import type { HeroCrimeData } from "@/lib/hero/providers/types";

export async function getCrimeometerCrimeData(input: CrimeProviderInput): Promise<HeroCrimeData> {
  const key = process.env.CRIMEOMETER_API_KEY;
  if (!key) {
    return unavailable("Crime data unavailable - Crimeometer API key not configured.");
  }

  if (!input.latitude || !input.longitude) {
    return unavailable("Crime data unavailable - geocoded latitude and longitude are required.");
  }

  try {
    const endpoint = process.env.CRIMEOMETER_API_URL || "https://api.crimeometer.com/v1/incidents/stats";
    const url = new URL(endpoint);
    url.searchParams.set("lat", String(input.latitude));
    url.searchParams.set("lon", String(input.longitude));
    url.searchParams.set("distance", "5mi");
    const response = await fetch(url, { headers: { "x-api-key": key, Accept: "application/json" } });
    console.info("Crimeometer request status", response.status);
    if (!response.ok) {
      return unavailable("Crime data unavailable - Crimeometer request failed.");
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const score = normalizeCrimeRiskScore(numberOrNull(payload.riskScore ?? payload.risk_score ?? payload.safetyIndex ?? payload.safety_index) ?? 50);
    return {
      provider: "crimeometer",
      unavailable: false,
      heroCrimeSignal: toHeroCrimeSignal(score),
      overallRiskScore: score,
      violentCrimeRate: numberOrNull(payload.violentCrimeRate ?? payload.violent_crime_rate),
      propertyCrimeRate: numberOrNull(payload.propertyCrimeRate ?? payload.property_crime_rate),
      confidence: 0.85,
      source: "Crimeometer",
      lastUpdated: stringOrNull(payload.lastUpdated ?? payload.last_updated) ?? new Date().toISOString().slice(0, 10),
      rawData: payload,
    };
  } catch (error) {
    console.warn("Crimeometer normalization failed", error instanceof Error ? error.message : "unknown error");
    return unavailable("Crime data unavailable - Crimeometer request failed.");
  }
}

function unavailable(reason: string): HeroCrimeData {
  return {
    provider: "crimeometer",
    unavailable: true,
    unavailableReason: reason,
    source: "Crimeometer",
    confidence: 0,
  };
}

function stringOrNull(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}