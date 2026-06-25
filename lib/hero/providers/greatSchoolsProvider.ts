import type { ParsedListingPrompt } from "@/lib/hero/parseListingPrompt";
import { errorResult, unavailableResult, type GeocodingData, type ProviderResult, type SchoolData } from "@/lib/hero/providers/types";

const provider = "GreatSchools";

export async function fetchGreatSchoolsData(parsed: ParsedListingPrompt, geocoding: GeocodingData): Promise<ProviderResult<SchoolData[]>> {
  const key = process.env.GREATSCHOOLS_API_KEY;
  if (!key) {
    return unavailableResult(provider, [], "School ratings unavailable - GreatSchools API key not configured.");
  }

  if (!geocoding.latitude || !geocoding.longitude) {
    return unavailableResult(provider, [], "School ratings unavailable - geocoded latitude and longitude are required.");
  }

  try {
    const endpoint = process.env.GREATSCHOOLS_API_URL || "https://api.greatschools.org/schools/nearby";
    const url = new URL(endpoint);
    url.searchParams.set("lat", String(geocoding.latitude));
    url.searchParams.set("lon", String(geocoding.longitude));
    url.searchParams.set("state", parsed.state ?? "");
    url.searchParams.set("key", key);
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      return errorResult(provider, [], "School ratings unavailable - GreatSchools request failed.");
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const schools = Array.isArray(payload.schools) ? payload.schools : Array.isArray(payload.school) ? payload.school : [];
    return {
      provider,
      status: "available",
      data: schools.slice(0, 6).map((school) => normalizeSchool(school)),
      unavailable: [],
      raw: payload,
    };
  } catch (error) {
    return errorResult(provider, [], "School ratings unavailable - GreatSchools request failed.", error);
  }
}

function normalizeSchool(value: unknown): SchoolData {
  const school = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
  return {
    name: String(school.name ?? school.schoolName ?? "Unnamed school"),
    rating: school.rating as string | number | null ?? null,
    ratingBand: typeof school.ratingBand === "string" ? school.ratingBand : null,
    distanceMiles: numberOrNull(school.distance ?? school.distanceMiles),
    level: typeof school.level === "string" ? school.level : typeof school.gradeRange === "string" ? school.gradeRange : null,
  };
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}