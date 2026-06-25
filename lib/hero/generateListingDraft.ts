import type { HeroListing } from "@/lib/hero/types";
import { calculateHeroScore, collectMissingListingData } from "@/lib/hero/calculateHeroScore";
import type { ParsedListingPrompt } from "@/lib/hero/parseListingPrompt";

export type HeroListingDraft = {
  title: string;
  description: string;
  highlights: string[];
  missingData: string[];
  heroAiSummary: string;
  heroScore: {
    total_score: number;
    letter_grade: string;
    explanation: string;
    buyer_recommendation: string;
    confidence_level: "low" | "medium" | "high";
    component_scores: Record<string, unknown>;
  };
};

export function generateListingDraft(parsed: ParsedListingPrompt): HeroListingDraft {
  const title = generateTitle(parsed);
  const highlights = parsed.features.length > 0 ? parsed.features : [];
  const description = generateDescription(parsed, highlights);
  const listing = toHeroListing(parsed, description);
  const score = calculateHeroScore(listing);
  const missingData = collectDraftMissingData(parsed, collectMissingListingData(listing));
  const heroAiSummary = generateHeroAiSummary(parsed, score.score, missingData);

  return {
    title,
    description,
    highlights,
    missingData,
    heroAiSummary,
    heroScore: {
      total_score: score.score,
      letter_grade: score.label,
      explanation: `Hero Score is based only on available seller-provided listing facts. Completed checks: ${score.reasons.join(", ") || "none yet"}.`,
      buyer_recommendation: heroAiSummary,
      confidence_level: score.score >= 75 ? "medium" : "low",
      component_scores: {
        available_facts: score.reasons,
        missing_data: missingData,
        generated_from: "deterministic_listing_builder",
      },
    },
  };
}

function generateTitle(parsed: ParsedListingPrompt) {
  const details = [
    parsed.beds ? `${formatNumber(parsed.beds)} Bedroom` : null,
    parsed.baths ? `${formatNumber(parsed.baths)} Bath` : null,
  ].filter((fact): fact is string => Boolean(fact));
  const location = parsed.city && parsed.state ? `${parsed.city}, ${parsed.state}` : parsed.address_line_1 || "Listing Draft";
  const type = parsed.property_type || "Home";
  return `${details.length ? `${details.join(", ")} ` : ""}${type} in ${location}`;
}

function generateDescription(parsed: ParsedListingPrompt, highlights: string[]) {
  const opening = parsed.address
    ? `Now available at ${parsed.address}.`
    : "Now available: a new listing draft based on the provided property details.";
  const facts = [
    parsed.asking_price ? `asking price ${formatMoney(parsed.asking_price)}` : null,
    parsed.beds ? `${formatNumber(parsed.beds)} bedrooms` : null,
    parsed.baths ? `${formatNumber(parsed.baths)} bathrooms` : null,
    parsed.sqft ? `about ${formatNumber(parsed.sqft)} sqft` : null,
    parsed.lot_size ? `lot size ${formatNumber(parsed.lot_size)}` : null,
    parsed.year_built ? `built in ${parsed.year_built}` : null,
    parsed.property_type ? `property type ${parsed.property_type}` : null,
  ].filter((fact): fact is string => Boolean(fact));

  const factSentence = facts.length ? ` This property is presented with ${formatList(facts)}.` : "";
  const highlightSentence = highlights.length ? ` Notable highlights include ${formatList(highlights)}.` : "";
  return `${opening}${factSentence}${highlightSentence}`;
}

function generateHeroAiSummary(parsed: ParsedListingPrompt, score: number, missingData: string[]) {
  const location = parsed.city ? ` in ${parsed.city}` : "";
  const knownFacts = [
    parsed.asking_price ? "price" : null,
    parsed.beds && parsed.baths ? "bed and bath count" : null,
    parsed.sqft ? "square footage" : null,
    parsed.features.length ? "seller-provided highlights" : null,
  ].filter((fact): fact is string => Boolean(fact));

  const knownText = knownFacts.length ? knownFacts.join(", ") : "basic listing information";
  const missingText = missingData.length ? ` Missing or unavailable data includes ${missingData.slice(0, 5).join(", ")}.` : "";
  return `Hero created a listing draft${location} with a preliminary score of ${score}/100 based on ${knownText}.${missingText}`;
}

function collectDraftMissingData(parsed: ParsedListingPrompt, baseMissing: string[]) {
  const missing = [...baseMissing];
  if (!parsed.address) missing.push("Full address");
  if (!parsed.lot_size) missing.push("Lot size");
  if (!parsed.property_type) missing.push("Property type");
  missing.push("School rating data", "Crime data", "Appreciation outlook", "Insurance-risk data");
  return Array.from(new Set(missing));
}

function toHeroListing(parsed: ParsedListingPrompt, description: string): HeroListing {
  return {
    id: "draft",
    address_line_1: parsed.address_line_1,
    address_line_2: null,
    city: parsed.city,
    state: parsed.state,
    zip: parsed.zip,
    price: parsed.asking_price,
    beds: parsed.beds,
    baths: parsed.baths,
    sqft: parsed.sqft,
    lot_size: parsed.lot_size,
    year_built: parsed.year_built,
    property_type: parsed.property_type,
    status: "draft",
    description,
    listing_agent_name: null,
    listing_agent_email: null,
    listing_agent_phone: null,
    brokerage_name: null,
    hero_scores: null,
  };
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function formatList(values: string[]) {
  if (values.length <= 1) return values[0] ?? "";
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}
