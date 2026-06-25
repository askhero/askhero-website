import { normalizeCrimeRiskScore, toHeroCrimeSignal, type CrimeProviderInput } from "@/lib/hero/providers/crimeProvider";
import { fbiCrimeGet } from "@/lib/hero/providers/fbiCrimeClient";
import type { HeroCrimeData } from "@/lib/hero/providers/types";

const source = "FBI Crime Data Explorer";

type FbiEstimateRecord = Record<string, unknown>;
type FbiAttempt = { path: string; status: number; ok: boolean; error?: string };

export async function getFbiCrimeData(input: CrimeProviderInput): Promise<HeroCrimeData> {
  if (!process.env.FBI_CRIME_API_KEY) {
    return unavailable("Crime data unavailable - FBI Crime Data Explorer API key not configured.");
  }

  const state = input.state?.trim().toUpperCase();
  if (!state) {
    return unavailable("Crime data unavailable - FBI Crime Data Explorer requires a state value.");
  }

  const { records: estimates, attempts } = await fetchStateEstimates(state);
  if (!estimates.length) {
    return unavailable("Crime data unavailable - FBI Crime Data Explorer did not return usable data for this location.", attempts);
  }

  const latest = estimates
    .filter((record) => numberOrNull(record.violent_crime_rate ?? record.violentCrimeRate) !== null || numberOrNull(record.property_crime_rate ?? record.propertyCrimeRate) !== null)
    .sort((left, right) => (numberOrNull(right.year) ?? 0) - (numberOrNull(left.year) ?? 0))[0];

  if (!latest) {
    return unavailable("No FBI crime data available for this location", attempts);
  }

  const violentCrimeRate = numberOrNull(latest.violent_crime_rate ?? latest.violentCrimeRate ?? latest.violent_crime);
  const propertyCrimeRate = numberOrNull(latest.property_crime_rate ?? latest.propertyCrimeRate ?? latest.property_crime);
  if (violentCrimeRate === null && propertyCrimeRate === null) {
    return unavailable("No FBI crime data available for this location", attempts);
  }

  const score = calculateAskHeroFbiRiskScore(violentCrimeRate, propertyCrimeRate);
  console.info("FBI CDE normalization status", "available");
  return {
    provider: "fbi_cde",
    unavailable: false,
    heroCrimeSignal: toHeroCrimeSignal(score),
    overallRiskScore: score,
    violentCrimeRate,
    propertyCrimeRate,
    confidence: 0.75,
    source,
    lastUpdated: latest.year ? String(latest.year) : new Date().toISOString().slice(0, 10),
    rawData: { level: "state", state, attempts, latest: sanitizeRawData(latest) },
  };
}

async function fetchStateEstimates(state: string): Promise<{ records: FbiEstimateRecord[]; attempts: FbiAttempt[] }> {
  const encodedState = encodeURIComponent(state);
  const currentYear = new Date().getFullYear();
  const attempts: FbiAttempt[] = [];
  const paths = [
    `estimate/states/${encodedState}`,
    `estimates/states/${encodedState}`,
    `estimate/states/${encodedState}?from=${currentYear - 6}&to=${currentYear - 1}`,
  ];

  for (const path of paths) {
    const result = await fbiCrimeGet(path);
    attempts.push({ path, status: result.status, ok: result.ok, error: result.ok ? undefined : result.error });
    if (!result.ok) {
      console.info("FBI CDE normalization status", "unavailable");
      continue;
    }

    const records = extractRecords(result.data);
    if (records.length) return { records, attempts };
  }

  return { records: [], attempts };
}

function extractRecords(payload: unknown) {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (isRecord(payload) && Array.isArray(payload.results)) return payload.results.filter(isRecord);
  if (isRecord(payload) && Array.isArray(payload.data)) return payload.data.filter(isRecord);
  if (isRecord(payload) && Array.isArray(payload.estimates)) return payload.estimates.filter(isRecord);
  return [];
}

function calculateAskHeroFbiRiskScore(violentRate: number | null, propertyRate: number | null) {
  // FBI CDE returns crime rates, not an official risk score. AskHero normalizes
  // available violent/property crime rates into a 0-100 internal signal using
  // conservative caps of 900 violent crimes and 4500 property crimes per 100k.
  const violentComponent = violentRate === null ? 50 : Math.min(100, (violentRate / 900) * 100);
  const propertyComponent = propertyRate === null ? 50 : Math.min(100, (propertyRate / 4500) * 100);
  return normalizeCrimeRiskScore(violentComponent * 0.6 + propertyComponent * 0.4);
}

function unavailable(reason: string, attempts: FbiAttempt[] = []): HeroCrimeData {
  console.info("FBI CDE normalization status", "unavailable");
  return {
    provider: "fbi_cde",
    unavailable: true,
    unavailableReason: reason,
    source,
    confidence: 0,
    rawData: attempts.length ? { attempts } : undefined,
  };
}

function sanitizeRawData(record: FbiEstimateRecord) {
  const safe = { ...record };
  delete safe.API_KEY;
  delete safe.api_key;
  return safe;
}

function isRecord(value: unknown): value is FbiEstimateRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
