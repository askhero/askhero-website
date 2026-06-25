import type { HeroListingDraft } from "@/lib/hero/generateListingDraft";
import { buildHeroCrimeScoreFactor, buildHeroFloodScoreFactor, calculateHeroScore } from "@/lib/hero/calculateHeroScore";
import type { HeroListing } from "@/lib/hero/types";
import { fetchAttomPropertyDetails } from "@/lib/hero/providers/attomProvider";
import { getCrimeData } from "@/lib/hero/providers/crimeProvider";
import { getFloodData } from "@/lib/hero/providers/floodProvider";
import { fetchGoogleMapsEnrichment } from "@/lib/hero/providers/googleMapsProvider";
import { fetchGreatSchoolsData } from "@/lib/hero/providers/greatSchoolsProvider";
import { fetchMarketOutlook } from "@/lib/hero/providers/marketProvider";
import type { EnrichmentConflict, HeroCrimeData, ListingEnrichmentData, ProviderResult } from "@/lib/hero/providers/types";
import type { ParsedListingPrompt } from "@/lib/hero/parseListingPrompt";

export type EnrichedListingDraft = HeroListingDraft & {
  parsed: ParsedListingPrompt;
  enrichment: ListingEnrichmentData;
  providerData: {
    propertyHistory: string;
    saleHistory: string[];
    taxHistory: string[];
    schoolRating: string;
    crimeData: string;
    floodData: string;
    appreciationOutlook: string;
    insuranceRisk: string;
    amenities: string;
    source: string;
  };
};

export async function enrichListing(parsed: ParsedListingPrompt, draft: HeroListingDraft, options: { mediaCount?: number } = {}): Promise<EnrichedListingDraft> {
  logProviderEnvCheck();
  const google = await fetchGoogleMapsEnrichment(parsed);
  const geocoding = google.data.geocoding;
  const location = {
    city: geocoding.city || parsed.city,
    state: geocoding.state || parsed.state,
    zip: geocoding.zip || parsed.zip,
  };
  const [attom, schools, crime, flood, market] = await Promise.all([
    fetchAttomPropertyDetails(parsed),
    fetchGreatSchoolsData(parsed, geocoding),
    getCrimeData({ city: location.city, state: location.state, zip: location.zip, latitude: geocoding.latitude, longitude: geocoding.longitude }),
    getFloodData({ address: parsed.address, city: location.city, state: location.state, zip: location.zip, latitude: geocoding.latitude, longitude: geocoding.longitude }),
    fetchMarketOutlook(parsed),
  ]);

  const conflicts = findConflicts(parsed, attom.data);
  const mergedParsed = mergeProviderFacts(parsed, attom.data, conflicts);
  const schoolData = schools.data.length ? schools.data : google.data.nearby_schools.map((school) => ({
    name: school.name,
    rating: null,
    ratingBand: null,
    distanceMiles: school.distanceMiles ?? null,
    level: null,
    source: school.source,
  }));
  const unavailableData = [
    ...google.unavailable,
    ...attom.unavailable,
    ...schools.unavailable,
    ...(crime.unavailableReason ? [crime.unavailableReason] : []),
    ...(flood.unavailableReason ? [flood.unavailableReason] : []),
    ...market.unavailable,
  ].map(toPublicUnavailableMessage);
  const enrichment: ListingEnrichmentData = {
    property_details: attom.data,
    geocoding_data: geocoding,
    nearby_schools: schoolData,
    nearby_grocery: google.data.nearby_grocery,
    nearby_shopping: google.data.nearby_shopping,
    nearby_hospitals: google.data.nearby_hospitals,
    nearby_roads: google.data.nearby_roads,
    nearby_highways: google.data.nearby_highways,
    nearby_parks: google.data.nearby_parks,
    crime_data: crime,
    flood_data: flood,
    appreciation_projection: market.data,
    unavailable_data: unavailableData,
    provider_status: {
      google_maps: google.status,
      attom: attom.status,
      greatschools: schools.status,
      crimeometer: crime.provider === "crimeometer" && !crime.unavailable ? "available" : "unavailable",
      fbi_cde: crime.provider === "fbi_cde" && !crime.unavailable ? "available" : "unavailable",
      fema_nfhl: flood.provider === "fema_nfhl" && !flood.unavailable ? "available" : "unavailable",
      market: market.status,
    },
    conflicts,
  };

  const enrichedHighlights = buildHighlights(mergedParsed);
  const enrichedTitle = buildTitle(mergedParsed);
  const enrichedDescription = buildDescription(mergedParsed, enrichedHighlights);
  const enrichedScore = calculateHeroScore(toHeroListing(mergedParsed, enrichedDescription), { enrichment, mediaCount: options.mediaCount });
  const enrichedMissingData = collectEnrichedMissingData(mergedParsed, enrichedScore.missingData, unavailableData);
  const enrichedSummary = buildHeroAiSummary(mergedParsed, enrichedScore.score, enrichment);

  return {
    ...draft,
    title: enrichedTitle,
    description: enrichedDescription,
    highlights: enrichedHighlights,
    heroAiSummary: enrichedSummary,
    heroScore: {
      total_score: enrichedScore.score,
      letter_grade: enrichedScore.label,
      explanation: `Hero Score is based on available facts only. Completed checks: ${enrichedScore.reasons.join(", ")}.`,
      buyer_recommendation: enrichedSummary,
      confidence_level: enrichedScore.score >= 75 ? "medium" : "low",
      component_scores: {
        available_facts: enrichedScore.reasons,
        missing_data: enrichedMissingData,
        provider_status: enrichment.provider_status,
        crime_signal: buildHeroCrimeScoreFactor(crime),
        flood_signal: buildHeroFloodScoreFactor(flood),
        conflicts: enrichment.conflicts,
      },
    },
    parsed: mergedParsed,
    missingData: enrichedMissingData,
    enrichment,
    providerData: {
      propertyHistory: summarizePropertyDetails(attom.data),
      saleHistory: summarizeHistoryList(attom.data.sale_history, "sale history"),
      taxHistory: hasRecord(attom.data.tax_assessment) ? summarizeRecord(attom.data.tax_assessment, "Tax/assessment data") : [],
      schoolRating: schoolData.length ? summarizeSchools(schoolData) : "Data not available yet.",
      crimeData: crime.unavailable ? "Data not available yet." : `${crime.heroCrimeSignal ?? "Available"} crime signal`,
      floodData: flood.unavailable ? "Data not available yet." : `${flood.heroFloodSignal ?? "Unknown"} flood signal`,
      appreciationOutlook: market.data.fiveYearOutlook || "Data not available yet.",
      insuranceRisk: summarizeInsuranceReview(flood),
      amenities: summarizeAmenities(enrichment),
      source: providerSource([google, attom, schools, market], crime),
    },
  };
}

export function logProviderEnvCheck() {
  if (process.env.NODE_ENV === "production") return;
  console.log("[env-check]", {
    hasGoogleMapsKey: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    hasFbiCrimeKey: Boolean(process.env.FBI_CRIME_API_KEY),
    hasFbiBaseUrl: Boolean(process.env.FBI_CRIME_BASE_URL),
    hasFemaOpenBaseUrl: Boolean(process.env.FEMA_OPENFEMA_BASE_URL),
    hasFemaNfhlBaseUrl: Boolean(process.env.FEMA_NFHL_BASE_URL),
  });
}

function summarizeInsuranceReview(flood: ListingEnrichmentData["flood_data"]) {
  if (flood.unavailable) return "Flood-related insurance review unavailable.";
  if (flood.heroFloodSignal === "High") return "Flood-related insurance review strongly recommended.";
  if (flood.heroFloodSignal === "Moderate" || flood.heroFloodSignal === "Elevated") return "Flood-related insurance review recommended.";
  if (flood.heroFloodSignal === "Minimal") return "No elevated flood signal found; verify with lender and insurance professional.";
  return "Insurance review recommended before publishing.";
}

function buildTitle(parsed: ParsedListingPrompt) {
  const facts = [
    parsed.beds ? `${formatNumber(parsed.beds)} Bed` : null,
    parsed.baths ? `${formatNumber(parsed.baths)} Bath` : null,
  ].filter((fact): fact is string => Boolean(fact));
  const type = parsed.property_type || "Home";
  const location = parsed.city && parsed.state ? `${parsed.city}, ${parsed.state}` : parsed.address_line_1 || "Listing Draft";
  return `${facts.length ? `${facts.join(", ")} ` : ""}${type} in ${location}`;
}

function buildDescription(parsed: ParsedListingPrompt, highlights: string[]) {
  const location = parsed.city && parsed.state ? `${parsed.city}, ${parsed.state}` : "the market";
  const factSentence = [
    parsed.asking_price ? `listed at ${formatMoney(parsed.asking_price)}` : null,
    parsed.beds && parsed.baths ? `with ${formatNumber(parsed.beds)} bedrooms and ${formatNumber(parsed.baths)} bathrooms` : null,
    parsed.sqft ? `approximately ${formatNumber(parsed.sqft)} square feet` : null,
    parsed.year_built ? `built in ${parsed.year_built}` : null,
    parsed.property_type ? `classified as ${parsed.property_type}` : null,
  ].filter((fact): fact is string => Boolean(fact));

  const opening = parsed.address
    ? `${parsed.address} is a draft listing ${factSentence.length ? factSentence.join(", ") : `in ${location}`}.`
    : `This is a draft listing in ${location}${factSentence.length ? `, ${factSentence.join(", ")}` : ""}.`;
  const highlightSentence = highlights.length ? ` Key highlights include ${formatList(highlights.slice(0, 5))}.` : "";
  const reviewSentence = " Details should be reviewed and confirmed by the seller or listing agent before publishing.";
  return `${opening}${highlightSentence}${reviewSentence}`;
}

function buildHighlights(parsed: ParsedListingPrompt) {
  const highlights = [
    parsed.features,
    parsed.sqft ? [`Approximately ${formatNumber(parsed.sqft)} square feet`] : [],
    parsed.beds && parsed.baths ? [`${formatNumber(parsed.beds)} bedrooms and ${formatNumber(parsed.baths)} bathrooms`] : [],
    parsed.year_built ? [`Built in ${parsed.year_built}`] : [],
    parsed.property_type ? [parsed.property_type] : [],
  ].flat();

  return Array.from(new Set(highlights.map(cleanHighlight).filter(Boolean))).slice(0, 8);
}

function buildHeroAiSummary(parsed: ParsedListingPrompt, score: number, enrichment: ListingEnrichmentData) {
  const known = [
    parsed.asking_price ? "asking price" : null,
    parsed.beds && parsed.baths ? "bed and bath count" : null,
    parsed.sqft ? "square footage" : null,
    parsed.year_built ? "year built" : null,
    parsed.property_type ? "property type" : null,
    enrichment.geocoding_data.verifiedAddress ? "verified address" : null,
    enrichment.crime_data.unavailable ? null : "Hero Crime Signal",
    enrichment.flood_data.unavailable ? null : "Hero Flood Signal",
    enrichment.nearby_grocery.length || enrichment.nearby_shopping.length || enrichment.nearby_hospitals.length ? "nearby amenities" : null,
  ].filter((item): item is string => Boolean(item));

  const location = parsed.city && parsed.state ? ` for ${parsed.city}, ${parsed.state}` : "";
  return `Hero prepared this draft${location} using ${known.length ? formatList(known) : "the facts provided so far"}. Current Hero Score is ${score}/100 and should be treated as preliminary until missing data is available and the listing agent confirms the facts.`;
}

function collectEnrichedMissingData(parsed: ParsedListingPrompt, scoreMissing: string[], unavailableData: string[]) {
  const providerUnavailable = unavailableData.filter((item) => !/Property records returned a record without usable listing facts/i.test(item));
  const missing = [...scoreMissing, ...providerUnavailable];

  if (parsed.year_built) removeValue(missing, "Year built");
  if (parsed.property_type) removeValue(missing, "Property type");
  if (parsed.lot_size) removeValue(missing, "Lot size");
  if (parsed.sqft) removeValue(missing, "Square footage");
  if (parsed.beds) removeValue(missing, "Beds");
  if (parsed.baths) removeValue(missing, "Baths");

  return Array.from(new Set(missing)).slice(0, 12);
}

function mergeProviderFacts(parsed: ParsedListingPrompt, facts: Partial<ParsedListingPrompt>, conflicts: EnrichmentConflict[]): ParsedListingPrompt {
  const conflictFields = new Set(conflicts.map((conflict) => conflict.field));
  return {
    ...parsed,
    beds: parsed.beds ?? numberOrNull(facts.beds),
    baths: parsed.baths ?? numberOrNull(facts.baths),
    sqft: parsed.sqft ?? numberOrNull(facts.sqft),
    lot_size: conflictFields.has("lot_size") ? parsed.lot_size : parsed.lot_size ?? numberOrNull(facts.lot_size),
    year_built: conflictFields.has("year_built") ? parsed.year_built : parsed.year_built ?? numberOrNull(facts.year_built),
    property_type: conflictFields.has("property_type") ? parsed.property_type : parsed.property_type ?? stringOrNull(facts.property_type),
  };
}

function findConflicts(parsed: ParsedListingPrompt, facts: Partial<ParsedListingPrompt>): EnrichmentConflict[] {
  const fields: Array<keyof ParsedListingPrompt> = ["beds", "baths", "sqft", "lot_size", "year_built", "property_type"];
  return fields.flatMap((field) => {
    const userValue = parsed[field];
    const providerValue = facts[field];
    if (!hasValue(userValue) || !hasValue(providerValue) || valuesMatch(userValue, providerValue)) {
      return [];
    }
    return [{
      field,
      userValue: userValue as string | number | null,
      providerValue: providerValue as string | number | null,
      provider: "property_records",
      message: `Hero found a possible conflict: You entered ${String(userValue)} for ${labelForField(field)}, but property records show ${String(providerValue)}. Please confirm the correct value.`,
    }];
  });
}

function summarizeSchools(schools: Array<{ name: string; rating: string | number | null; ratingBand: string | null }>) {
  return schools.slice(0, 3).map((school) => `${school.name}${school.rating ? ` (${school.rating})` : school.ratingBand ? ` (${school.ratingBand})` : ""}`).join(", ");
}

function summarizeAmenities(enrichment: ListingEnrichmentData) {
  const count = enrichment.nearby_grocery.length + enrichment.nearby_shopping.length + enrichment.nearby_hospitals.length + enrichment.nearby_roads.length + enrichment.nearby_highways.length + enrichment.nearby_parks.length;
  return count > 0 ? `${count} nearby amenities found.` : "Data not available yet.";
}

function providerSource(results: Array<ProviderResult<unknown>>, crime: HeroCrimeData) {
  const available = results.filter((result) => result.status === "available").map((result) => result.provider);
  if (!crime.unavailable && crime.source) {
    available.push(crime.source);
  }
  return available.length ? "Property and neighborhood data available." : "";
}

function labelForField(field: keyof ParsedListingPrompt) {
  return field.replace(/_/g, " ");
}

function valuesMatch(left: unknown, right: unknown) {
  if (typeof left === "number" || typeof right === "number") {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    if (!Number.isFinite(leftNumber) || !Number.isFinite(rightNumber)) return false;
    const difference = Math.abs(leftNumber - rightNumber);
    const tolerance = Math.max(1, Math.abs(leftNumber) * 0.03);
    return difference <= tolerance;
  }
  return String(left).trim().toLowerCase() === String(right).trim().toLowerCase();
}

function hasValue(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

function hasRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length > 0;
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

function summarizePropertyDetails(facts: Partial<ParsedListingPrompt>) {
  const details = [
    facts.beds ? `${formatNumber(Number(facts.beds))} beds` : null,
    facts.baths ? `${formatNumber(Number(facts.baths))} baths` : null,
    facts.sqft ? `${formatNumber(Number(facts.sqft))} sqft` : null,
    facts.lot_size ? `${formatNumber(Number(facts.lot_size))} lot size` : null,
    facts.year_built ? `built ${facts.year_built}` : null,
    facts.property_type ? String(facts.property_type) : null,
  ].filter((detail): detail is string => Boolean(detail));

  return details.length ? `Property records show ${formatList(details)}.` : "Data not available yet.";
}

function summarizeHistoryList(value: unknown[] | undefined, label: string) {
  if (!value?.length) return [];
  return value.slice(0, 3).map((item, index) => {
    if (typeof item !== "object" || item === null) return `${label} item ${index + 1}: ${String(item)}`;
    const record = item as Record<string, unknown>;
    const date = stringOrNull(record.saleDate ?? record.saledate ?? record.date ?? record.transferDate);
    const amount = numberOrNull(record.saleAmount ?? record.saleamt ?? record.amount ?? record.price);
    const parts = [date, amount ? formatMoney(amount) : null].filter(Boolean);
    return parts.length ? `${label}: ${parts.join(" - ")}` : `${label} item ${index + 1} available.`;
  });
}

function summarizeRecord(record: Record<string, unknown>, label: string) {
  const assessedValue = numberOrNull(findRecordValue(record, ["assessedValue", "assdttlvalue", "marketValue", "mktTtlValue"]));
  const taxYear = stringOrNull(findRecordValue(record, ["taxYear", "taxyear", "year"]));
  const parts = [
    taxYear ? `tax year ${taxYear}` : null,
    assessedValue ? `assessed value ${formatMoney(assessedValue)}` : null,
  ].filter((part): part is string => Boolean(part));
  return [parts.length ? `${label}: ${parts.join(", ")}.` : `${label} available.`];
}

function toPublicUnavailableMessage(message: string) {
  return message
    .replace(/ATTOM/gi, "Property records")
    .replace(/Google Maps(?: Platform)?/gi, "Map data")
    .replace(/GreatSchools/gi, "School data")
    .replace(/Crimeometer|FBI Crime Data Explorer|FBI CDE/gi, "Crime data")
    .replace(/FEMA National Flood Hazard Layer|FEMA|NFHL/gi, "Flood data")
    .replace(/market data provider/gi, "market data")
    .replace(/\s*-\s*/g, ": ");
}

function findRecordValue(record: Record<string, unknown>, keys: string[]) {
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  const stack = [record];
  while (stack.length) {
    const current = stack.shift();
    if (!current) continue;
    for (const [key, value] of Object.entries(current)) {
      if (wanted.has(key.toLowerCase())) return value;
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        stack.push(value as Record<string, unknown>);
      }
    }
  }
  return null;
}

function cleanHighlight(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim();
}

function removeValue(values: string[], value: string) {
  const index = values.findIndex((item) => item.toLowerCase() === value.toLowerCase());
  if (index >= 0) values.splice(index, 1);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function formatList(values: string[]) {
  if (values.length <= 1) return values[0] ?? "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
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
