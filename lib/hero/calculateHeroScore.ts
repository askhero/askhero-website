import type { HeroCrimeData, HeroFloodData, ListingEnrichmentData } from "@/lib/hero/providers/types";
import type { HeroListing, HeroScoreDetails } from "@/lib/hero/types";

export type HeroScoreContext = {
  enrichment?: Partial<ListingEnrichmentData> | null;
  mediaCount?: number;
};

export type HeroScoreFactorBreakdown = {
  factor: string;
  status: "available" | "unavailable";
  provider: string;
  impact: "positive" | "neutral" | "negative";
  explanation: string;
};

export function calculateHeroScore(listing: HeroListing, context: HeroScoreContext = {}): HeroScoreDetails {
  const existingScore = listing.hero_scores?.[0]?.total_score;
  if (typeof existingScore === "number") {
    return {
      score: clamp(existingScore),
      label: listing.hero_scores?.[0]?.letter_grade ?? scoreLabel(existingScore),
      reasons: ["Uses the approved Hero Score already stored for this listing.", "Hero Score is based on available facts only."],
      missingData: collectMissingListingData(listing, context),
      usedExistingScore: true,
    };
  }

  const enrichment = context.enrichment;
  const checks = [
    { ok: hasValue(listing.price), label: "Price is available", weight: 15 },
    { ok: hasValue(listing.beds) && hasValue(listing.baths), label: "Bed and bath count are available", weight: 14 },
    { ok: hasValue(listing.sqft), label: "Square footage is available", weight: 12 },
    { ok: hasValue(listing.year_built), label: "Year built is available", weight: 7 },
    { ok: Boolean(listing.description), label: "Listing description is available", weight: 14 },
    { ok: Boolean(context.mediaCount && context.mediaCount > 0), label: "Listing media is available", weight: 8 },
    { ok: Boolean(enrichment?.geocoding_data && hasValue(enrichment.geocoding_data.latitude) && hasValue(enrichment.geocoding_data.longitude)), label: "Address verification is available", weight: 10 },
    { ok: Boolean(enrichment?.property_details && Object.keys(enrichment.property_details).length > 0), label: "Property details are available", weight: 8 },
    { ok: Boolean((enrichment?.nearby_grocery?.length ?? 0) + (enrichment?.nearby_shopping?.length ?? 0) + (enrichment?.nearby_hospitals?.length ?? 0)), label: "Nearby amenities are available", weight: 5 },
    { ok: Boolean(enrichment?.nearby_schools?.length), label: "School data is available", weight: 3 },
    { ok: Boolean(enrichment?.crime_data && !enrichment.crime_data.unavailable), label: "Crime risk data is available", weight: 3 },
    { ok: Boolean(enrichment?.appreciation_projection && Object.keys(enrichment.appreciation_projection).length > 0), label: "Hero 5-Year Outlook data is available", weight: 1 },
  ];

  const completed = checks.filter((check) => check.ok);
  const baseScore = completed.reduce((sum, check) => sum + check.weight, 0);
  const crimeAdjustment = getCrimeScoreAdjustment(enrichment?.crime_data);
  const floodAdjustment = getFloodScoreAdjustment(enrichment?.flood_data);
  const score = clamp(baseScore + crimeAdjustment.points + floodAdjustment.points);

  return {
    score,
    label: scoreLabel(score),
    reasons: [
      ...completed.map((check) => check.label),
      crimeAdjustment.reason,
      floodAdjustment.reason,
      "Hero Score is based on available facts only.",
    ].filter(Boolean),
    missingData: collectMissingListingData(listing, context),
    usedExistingScore: false,
  };
}

export function buildHeroFloodScoreFactor(flood?: HeroFloodData | null): HeroScoreFactorBreakdown {
  if (!flood || flood.unavailable) {
    return {
      factor: "Hero Flood Signal",
      status: "unavailable",
      provider: "Flood data",
      impact: "neutral",
      explanation: "Flood data is not available yet, so this factor is treated as neutral.",
    };
  }

  const impact = flood.heroFloodSignal === "Minimal"
    ? "positive"
    : flood.heroFloodSignal === "Moderate" || flood.heroFloodSignal === "Elevated" || flood.heroFloodSignal === "High"
      ? "negative"
      : "neutral";

  return {
    factor: "Hero Flood Signal",
    status: "available",
    provider: "Flood data",
    impact,
    explanation: `${flood.heroFloodSignal ?? "Unknown"} flood signal. Flood risk has a limited impact on Hero Score and should be verified before decisions.`,
  };
}

export function buildHeroCrimeScoreFactor(crime?: HeroCrimeData | null): HeroScoreFactorBreakdown {
  const provider = crimeProviderLabel(crime);

  if (!crime || crime.unavailable) {
    return {
      factor: "Hero Crime Signal",
      status: "unavailable",
      provider,
      impact: "neutral",
      explanation: "Crime data is not available yet, so this factor is not heavily penalized.",
    };
  }

  const riskScore = typeof crime.overallRiskScore === "number" ? crime.overallRiskScore : null;
  const impact = riskScore === null || (riskScore > 40 && riskScore < 70)
    ? "neutral"
    : riskScore <= 40
      ? "positive"
      : "negative";

  return {
    factor: "Hero Crime Signal",
    status: "available",
    provider,
    impact,
    explanation: `${crime.heroCrimeSignal ?? "Available"} crime signal. Lower risk can improve Hero Score; elevated risk can reduce it.`,
  };
}

export function collectMissingListingData(listing: HeroListing, context: HeroScoreContext = {}) {
  const missing: string[] = [];
  const enrichment = context.enrichment;
  if (!hasValue(listing.price)) missing.push("Price");
  if (!hasValue(listing.beds)) missing.push("Beds");
  if (!hasValue(listing.baths)) missing.push("Baths");
  if (!hasValue(listing.sqft)) missing.push("Square footage");
  if (!hasValue(listing.year_built)) missing.push("Year built");
  if (!listing.description) missing.push("Listing description");
  if (!context.mediaCount) missing.push("Listing media");
  if (!enrichment?.geocoding_data?.latitude || !enrichment.geocoding_data.longitude) missing.push("Address verification data");
  if (!enrichment?.nearby_schools?.length) missing.push("School rating data");
  if (!enrichment?.crime_data || enrichment.crime_data.unavailable) missing.push("Crime data");
  if (!enrichment?.flood_data || enrichment.flood_data.unavailable) missing.push("Flood-risk data");
  if (!enrichment?.nearby_grocery?.length && !enrichment?.nearby_shopping?.length && !enrichment?.nearby_hospitals?.length) missing.push("Nearby amenities data");
  if (!enrichment?.appreciation_projection || Object.keys(enrichment.appreciation_projection).length === 0) missing.push("Hero 5-Year Outlook data");
  missing.push("Insurance-risk data");
  return Array.from(new Set(missing));
}

function hasValue(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getCrimeScoreAdjustment(crime?: HeroCrimeData | null) {
  if (!crime || crime.unavailable || typeof crime.overallRiskScore !== "number") {
    return {
      points: 0,
      reason: crime?.unavailableReason ? "Crime data is unavailable and is not heavily penalized." : "",
    };
  }

  if (crime.overallRiskScore <= 40) {
    return {
      points: 4,
      reason: `Hero Crime Signal is ${crime.heroCrimeSignal ?? "low"}, which modestly improves the score.`,
    };
  }

  if (crime.overallRiskScore >= 70) {
    return {
      points: -6,
      reason: `Hero Crime Signal is ${crime.heroCrimeSignal ?? "elevated"}, which modestly reduces the score.`,
    };
  }

  return {
    points: 0,
    reason: `Hero Crime Signal is ${crime.heroCrimeSignal ?? "moderate"}, which is treated as neutral.`,
  };
}

function getFloodScoreAdjustment(flood?: HeroFloodData | null) {
  if (!flood || flood.unavailable) {
    return { points: 0, reason: "" };
  }

  if (flood.heroFloodSignal === "Minimal") {
    return { points: 4, reason: "Hero Flood Signal is Minimal, which modestly improves the score." };
  }

  if (flood.heroFloodSignal === "Moderate") {
    return { points: -2, reason: "Hero Flood Signal is Moderate, which slightly reduces the score." };
  }

  if (flood.heroFloodSignal === "Elevated") {
    return { points: -4, reason: "Hero Flood Signal is Elevated, which moderately reduces the score." };
  }

  if (flood.heroFloodSignal === "High") {
    return { points: -7, reason: "Hero Flood Signal is High, which reduces the score without dominating it." };
  }

  return { points: 0, reason: "Hero Flood Signal is Unknown, which is treated as neutral." };
}

function crimeProviderLabel(crime?: HeroCrimeData | null): HeroScoreFactorBreakdown["provider"] {
  if (crime?.provider && crime.provider !== "none") return "Crime data";
  return "None";
}

function scoreLabel(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "Review";
}
