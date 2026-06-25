import { calculateHeroSafeBudget } from "@/lib/hero/calculateHeroSafeBudget";
import type { BuyerProfile, HeroFitScoreDetails, HeroListing } from "@/lib/hero/types";

export function calculateHeroFitScore(listing: HeroListing, profile: BuyerProfile): HeroFitScoreDetails {
  const reasons: string[] = [];
  const missingData: string[] = [];
  const disqualifiers: string[] = [];
  let earned = 0;
  let possible = 0;

  if (profile.city) {
    possible += 25;
    if (listing.city && sameText(listing.city, profile.city)) {
      earned += 25;
      reasons.push(`Matches your ${profile.city} location request.`);
    } else if (listing.city) {
      disqualifiers.push(`Located in ${listing.city}, not ${profile.city}.`);
    } else {
      missingData.push("Listing city");
    }
  }

  if (profile.state) {
    possible += 10;
    if (listing.state && sameText(listing.state, profile.state)) {
      earned += 10;
      reasons.push(`Matches your ${profile.state} state request.`);
    } else if (listing.state) {
      disqualifiers.push(`Located in ${listing.state}, not ${profile.state}.`);
    } else {
      missingData.push("Listing state");
    }
  }

  const budget = calculateHeroSafeBudget(profile);
  if (budget) {
    possible += 30;
    if (typeof listing.price === "number") {
      if (listing.price <= budget.estimatedPurchasePrice) {
        earned += 30;
        reasons.push("Within your estimated safe budget.");
      } else if (listing.price <= budget.estimatedPurchasePrice * 1.08) {
        earned += 12;
        reasons.push("Slightly above your estimated safe budget, so it may require careful review.");
      } else {
        disqualifiers.push("Priced above the estimated safe budget range.");
      }
    } else {
      missingData.push("Listing price");
    }
  }

  if (profile.requestedBeds) {
    possible += 20;
    if (typeof listing.beds === "number") {
      if (listing.beds >= profile.requestedBeds) {
        earned += 20;
        reasons.push(`Meets your estimated ${profile.requestedBeds}+ bedroom need.`);
      } else {
        disqualifiers.push(`Has ${listing.beds} bedroom${listing.beds === 1 ? "" : "s"}, below your estimated need.`);
      }
    } else {
      missingData.push("Bedroom count");
    }
  }

  const description = listing.description?.toLowerCase() ?? "";
  if (profile.schoolImportance) {
    possible += 10;
    if (/school|district|education/.test(description)) {
      earned += 6;
      reasons.push("Listing description mentions schools or district context.");
    } else {
      missingData.push("Verified school rating data");
    }
  }

  if (profile.groceryImportance) {
    possible += 8;
    if (/grocery|shopping|store|market|retail/.test(description)) {
      earned += 6;
      reasons.push("Listing description mentions shopping or daily-needs access.");
    } else {
      missingData.push("Verified grocery/store proximity data");
    }
  }

  if (profile.safetyImportance) {
    possible += 10;
    missingData.push("Verified crime and safety data");
  }

  if (profile.commuteImportance) {
    possible += 7;
    missingData.push("Verified commute-time data");
  }

  if (possible === 0) {
    possible = 1;
    earned = 0;
  }

  return {
    score: Math.round((earned / possible) * 100),
    reasons: Array.from(new Set(reasons)),
    missingData: Array.from(new Set(missingData)),
    disqualifiers,
  };
}

export function listingMatchesBuyerProfile(listing: HeroListing, profile: BuyerProfile) {
  const fit = calculateHeroFitScore(listing, profile);
  return fit.disqualifiers.length === 0 && fit.score > 0;
}

function sameText(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}