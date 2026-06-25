import { getCrimeometerCrimeData } from "@/lib/hero/providers/crimeometerProvider";
import { getFbiCrimeData } from "@/lib/hero/providers/fbiCrimeProvider";
import type { HeroCrimeData, HeroCrimeSignal } from "@/lib/hero/providers/types";

export type CrimeProviderInput = {
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export async function getCrimeData(input: CrimeProviderInput): Promise<HeroCrimeData> {
  const providerMode = (process.env.CRIME_PROVIDER || "auto").toLowerCase();

  if (providerMode === "crimeometer") {
    console.info("Crime provider selected: crimeometer");
    return getCrimeometerCrimeData(input);
  }

  if (providerMode === "fbi_cde" || providerMode === "fbi") {
    console.info("Crime provider selected: fbi_cde");
    return getFbiCrimeData(input);
  }

  if (process.env.CRIMEOMETER_API_KEY) {
    console.info("Crime provider selected: crimeometer");
    const crimeometer = await getCrimeometerCrimeData(input);
    if (!crimeometer.unavailable || !process.env.FBI_CRIME_API_KEY) {
      return crimeometer;
    }
    console.info("Crime provider fallback selected: fbi_cde");
    return getFbiCrimeData(input);
  }

  if (process.env.FBI_CRIME_API_KEY) {
    console.info("Crime provider selected: fbi_cde");
    return getFbiCrimeData(input);
  }

  console.info("Crime provider selected: none");
  return {
    provider: "none",
    unavailable: true,
    unavailableReason: "Crime data unavailable - no crime provider configured.",
    source: null,
    confidence: 0,
  };
}

export function toHeroCrimeSignal(score: number): HeroCrimeSignal {
  if (score <= 20) return "Very Low";
  if (score <= 40) return "Low";
  if (score <= 60) return "Moderate";
  if (score <= 80) return "Elevated";
  return "High";
}

export function normalizeCrimeRiskScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
