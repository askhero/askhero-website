import { getFemaFloodData, type FloodProviderInput } from "@/lib/hero/providers/femaFloodProvider";
import type { HeroFloodData } from "@/lib/hero/providers/types";

export async function getFloodData(input: FloodProviderInput): Promise<HeroFloodData> {
  if ((process.env.FEMA_PROVIDER || "public").toLowerCase() !== "public") {
    return unavailable("Flood data unavailable - FEMA public flood provider is not enabled.");
  }

  return getFemaFloodData(input);
}

function unavailable(reason: string): HeroFloodData {
  return {
    provider: "none",
    unavailable: true,
    unavailableReason: reason,
    source: "FEMA National Flood Hazard Layer",
    confidence: 0,
  };
}
