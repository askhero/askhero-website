import type { ParsedListingPrompt } from "@/lib/hero/parseListingPrompt";
import { errorResult, unavailableResult, type GeocodingData, type GoogleMapsData, type NearbyAmenity, type ProviderResult } from "@/lib/hero/providers/types";

const provider = "Google Maps Platform";
const placesSource = "Google Places";
const searchRadiusMeters = 8000;

const emptyData: GoogleMapsData = {
  geocoding: { verifiedAddress: null, formattedAddress: null, latitude: null, longitude: null, placeId: null, city: null, state: null, zip: null },
  nearby_schools: [],
  nearby_grocery: [],
  nearby_shopping: [],
  nearby_hospitals: [],
  nearby_roads: [],
  nearby_highways: [],
  nearby_parks: [],
};

export async function fetchGoogleMapsEnrichment(parsed: ParsedListingPrompt): Promise<ProviderResult<GoogleMapsData>> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return unavailableResult(provider, emptyData, "Map data unavailable - Google Maps API key not configured.");
  }

  const address = parsed.address || [parsed.address_line_1, parsed.city, parsed.state, parsed.zip].filter(Boolean).join(", ");
  if (!address) {
    return unavailableResult(provider, emptyData, "Map data unavailable - full address not provided.");
  }

  try {
    const geocoding = await geocodeAddress(address, key);
    if (!geocoding.latitude || !geocoding.longitude) {
      return errorResult(provider, { ...emptyData, geocoding }, "Map data unavailable - address could not be geocoded.");
    }

    const [schools, grocery, shopping, hospitals, roads, parks] = await Promise.all([
      nearbySearch(geocoding, key, { type: "school", category: "school" }),
      nearbySearch(geocoding, key, { type: "grocery_or_supermarket", category: "grocery" }),
      textSearch(geocoding, key, { query: "shopping center retail stores near", category: "shopping" }),
      nearbySearch(geocoding, key, { type: "hospital", category: "hospital" }),
      textSearch(geocoding, key, { query: "major roads highways near", category: "road" }),
      nearbySearch(geocoding, key, { type: "park", category: "park" }),
    ]);

    const unavailable = [
      schools.items.length ? null : schools.reason || "Nearby schools unavailable - no school data returned for this address.",
      grocery.items.length ? null : grocery.reason || "Nearby grocery unavailable - no grocery data returned for this address.",
      shopping.items.length ? null : shopping.reason || "Nearby shopping unavailable - no shopping data returned for this address.",
      hospitals.items.length ? null : hospitals.reason || "Nearby hospitals unavailable - no hospital data returned for this address.",
      roads.items.length ? null : roads.reason || "Nearby roads and highways unavailable - no road access data returned for this address.",
    ].filter((item): item is string => Boolean(item));

    return {
      provider,
      status: "available",
      data: {
        geocoding,
        nearby_schools: schools.items,
        nearby_grocery: grocery.items,
        nearby_shopping: shopping.items,
        nearby_hospitals: hospitals.items,
        nearby_roads: roads.items,
        nearby_highways: [],
        nearby_parks: parks.items,
      },
      unavailable,
      raw: {
        statuses: {
          schools: schools.status,
          grocery: grocery.status,
          shopping: shopping.status,
          hospitals: hospitals.status,
          roads: roads.status,
          parks: parks.status,
        },
      },
    };
  } catch (error) {
    return errorResult(provider, emptyData, "Map data unavailable - Google Maps request failed.", error);
  }
}

export async function geocodeAddress(address: string, key = process.env.GOOGLE_MAPS_API_KEY || ""): Promise<GeocodingData> {
  if (!key) {
    return { verifiedAddress: null, formattedAddress: null, latitude: null, longitude: null, placeId: null, city: null, state: null, zip: null };
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", key);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    return { verifiedAddress: null, formattedAddress: null, latitude: null, longitude: null, placeId: null, city: null, state: null, zip: null };
  }

  const payload = (await response.json()) as {
    results?: Array<{
      formatted_address?: string;
      place_id?: string;
      address_components?: Array<{ long_name?: string; short_name?: string; types?: string[] }>;
      geometry?: { location?: { lat?: number; lng?: number } };
    }>;
  };
  const first = payload.results?.[0];
  const formatted = first?.formatted_address ?? null;
  const components = first?.address_components ?? [];
  return {
    verifiedAddress: formatted,
    formattedAddress: formatted,
    latitude: first?.geometry?.location?.lat ?? null,
    longitude: first?.geometry?.location?.lng ?? null,
    placeId: first?.place_id ?? null,
    city: componentValue(components, ["locality", "postal_town"]) ?? componentValue(components, ["sublocality", "administrative_area_level_3"]),
    state: componentValue(components, ["administrative_area_level_1"], true),
    zip: componentValue(components, ["postal_code"]),
  };
}

// Uses the legacy Places Nearby Search API (maps.googleapis.com) which is compatible
// with any standard Google Maps API key that has the Places API enabled.
async function nearbySearch(
  geocoding: GeocodingData,
  key: string,
  options: { type: string; category: string },
): Promise<{ items: NearbyAmenity[]; status: number; reason?: string }> {
  if (!geocoding.latitude || !geocoding.longitude) {
    return { items: [], status: 0, reason: "Map data unavailable - geocoding coordinates are missing." };
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${geocoding.latitude},${geocoding.longitude}`);
  url.searchParams.set("radius", String(searchRadiusMeters));
  url.searchParams.set("type", options.type);
  url.searchParams.set("key", key);

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    return { items: [], status: response.status, reason: `Map data unavailable - ${options.category} search failed with status ${response.status}.` };
  }

  const payload = (await response.json()) as { status?: string; results?: LegacyPlace[] };
  if (payload.status && payload.status !== "OK" && payload.status !== "ZERO_RESULTS") {
    return { items: [], status: response.status, reason: `Map data unavailable - ${options.category} search returned status ${payload.status}.` };
  }

  return { items: normalizeLegacyPlaces(payload.results ?? [], options.category, geocoding), status: response.status };
}

// Uses the legacy Places Text Search API for flexible keyword-based queries.
async function textSearch(
  geocoding: GeocodingData,
  key: string,
  options: { query: string; category: string },
): Promise<{ items: NearbyAmenity[]; status: number; reason?: string }> {
  if (!geocoding.latitude || !geocoding.longitude) {
    return { items: [], status: 0, reason: "Map data unavailable - geocoding coordinates are missing." };
  }

  const address = geocoding.formattedAddress || geocoding.verifiedAddress || "";
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", `${options.query} ${address}`.trim());
  url.searchParams.set("location", `${geocoding.latitude},${geocoding.longitude}`);
  url.searchParams.set("radius", String(searchRadiusMeters));
  url.searchParams.set("key", key);

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    return { items: [], status: response.status, reason: `Map data unavailable - ${options.category} search failed with status ${response.status}.` };
  }

  const payload = (await response.json()) as { status?: string; results?: LegacyPlace[] };
  if (payload.status && payload.status !== "OK" && payload.status !== "ZERO_RESULTS") {
    return { items: [], status: response.status, reason: `Map data unavailable - ${options.category} search returned status ${payload.status}.` };
  }

  return { items: normalizeLegacyPlaces(payload.results ?? [], options.category, geocoding), status: response.status };
}

type LegacyPlace = {
  name?: string;
  vicinity?: string;
  formatted_address?: string;
  types?: string[];
  rating?: number;
  place_id?: string;
  geometry?: { location?: { lat?: number; lng?: number } };
};

function normalizeLegacyPlaces(places: LegacyPlace[], category: string, origin: GeocodingData): NearbyAmenity[] {
  return places.slice(0, 6).map((place) => ({
    name: place.name || "Unnamed place",
    address: place.vicinity ?? place.formatted_address ?? null,
    type: place.types?.[0] ?? null,
    distanceMiles: distanceMiles(origin.latitude, origin.longitude, place.geometry?.location?.lat, place.geometry?.location?.lng),
    rating: typeof place.rating === "number" ? place.rating : null,
    placeId: place.place_id ?? null,
    category,
    source: placesSource,
  }));
}

function distanceMiles(lat1?: number | null, lon1?: number | null, lat2?: number | null, lon2?: number | null) {
  if (![lat1, lon1, lat2, lon2].every((value) => typeof value === "number" && Number.isFinite(value))) return null;
  const toRadians = (value: number) => value * Math.PI / 180;
  const radiusMiles = 3958.8;
  const dLat = toRadians(Number(lat2) - Number(lat1));
  const dLon = toRadians(Number(lon2) - Number(lon1));
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(Number(lat1))) * Math.cos(toRadians(Number(lat2))) * Math.sin(dLon / 2) ** 2;
  return Math.round(radiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function componentValue(components: Array<{ long_name?: string; short_name?: string; types?: string[] }>, types: string[], short = false) {
  const found = components.find((component) => component.types?.some((type) => types.includes(type)));
  return (short ? found?.short_name : found?.long_name) ?? null;
}
