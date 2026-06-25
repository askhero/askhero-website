import type { BuyerProfile, HeroFitScoreDetails, HeroListing, HeroScoreDetails } from "@/lib/hero/types";

export function generateHeroAISummary(
  listing: HeroListing,
  profile: BuyerProfile,
  scoreDetails: { heroScore: HeroScoreDetails; fitScore: HeroFitScoreDetails },
) {
  const location = [listing.city, listing.state].filter(Boolean).join(", ") || "this market";
  const searchLocation = [profile.city, profile.state].filter(Boolean).join(", ");
  const reasons = scoreDetails.fitScore.reasons.slice(0, 2);
  const missing = scoreDetails.fitScore.missingData.length
    ? scoreDetails.fitScore.missingData
    : scoreDetails.heroScore.missingData;

  const opening = searchLocation
    ? `This home appears to fit your ${searchLocation} search because`
    : `This ${location} home appears relevant because`;

  if (reasons.length === 0) {
    return `Hero can evaluate this approved listing, but the current data does not confirm a strong match yet. ${formatMissing(missing)}`;
  }

  return `${opening} ${joinSentence(reasons).toLowerCase()}. ${formatMissing(missing)}`;
}

function formatMissing(missing: string[]) {
  if (missing.length === 0) return "No major requested data gaps were found in the available listing fields.";
  return `${joinSentence(missing.slice(0, 5))} ${missing.length === 1 ? "is" : "are"} not available yet, so Hero cannot fully validate every risk signal.`;
}

function joinSentence(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}