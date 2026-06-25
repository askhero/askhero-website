export type ParsedListingPrompt = {
  rawPrompt: string;
  address: string | null;
  address_line_1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  asking_price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lot_size: number | null;
  year_built: number | null;
  property_type: string | null;
  features: string[];
  seller_notes: string[];
};

const statePattern = "AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY";
const featureKeywords = [
  "updated kitchen",
  "renovated kitchen",
  "fenced backyard",
  "fenced yard",
  "two-car garage",
  "2-car garage",
  "garage",
  "pool",
  "screened porch",
  "deck",
  "patio",
  "finished basement",
  "walk-in closet",
  "hardwood floors",
  "open floor plan",
  "bonus room",
  "home office",
  "fireplace",
  "new roof",
  "new hvac",
  "corner lot",
  "cul-de-sac",
];

export function parseListingPrompt(prompt: string): ParsedListingPrompt {
  const rawPrompt = prompt.trim();
  const normalized = normalizeSpaces(rawPrompt);
  const addressParts = parseAddress(normalized);
  const price = parseMoney(normalized);
  const beds = parseNumberBefore(normalized, /(?:bedrooms?|beds?|br)\b/i);
  const baths = parseNumberBefore(normalized, /(?:bathrooms?|baths?|ba)\b/i);
  const sqft = parseSquareFeet(normalized);
  const lotSize = parseLotSize(normalized);
  const yearBuilt = parseYearBuilt(normalized);
  const propertyType = parsePropertyType(normalized);
  const features = parseFeatures(normalized, addressParts.address);
  const sellerNotes = parseSellerNotes(normalized, features);

  return {
    rawPrompt,
    address: addressParts.address,
    address_line_1: addressParts.addressLine1,
    city: addressParts.city,
    state: addressParts.state,
    zip: addressParts.zip,
    asking_price: price,
    beds,
    baths,
    sqft,
    lot_size: lotSize,
    year_built: yearBuilt,
    property_type: propertyType,
    features,
    seller_notes: sellerNotes,
  };
}

function parseAddress(text: string) {
  const fullAddressRegex = new RegExp(
    `\\b(\\d{2,6}\\s+[A-Za-z0-9.'#\\-\\s]+?),\\s*([A-Za-z.'\\-\\s]+?),\\s*(${statePattern})\\s+(\\d{5}(?:-\\d{4})?)\\b`,
    "i",
  );
  const match = text.match(fullAddressRegex);

  if (!match) {
    return { address: null, addressLine1: null, city: null, state: null, zip: null };
  }

  const addressLine1 = cleanSentence(match[1]);
  const city = cleanSentence(match[2]);
  const state = match[3].toUpperCase();
  const zip = match[4];

  return {
    address: `${addressLine1}, ${city}, ${state} ${zip}`,
    addressLine1,
    city,
    state,
    zip,
  };
}

function parseMoney(text: string) {
  const explicit = text.match(/\$\s*([0-9][0-9,]*(?:\.\d+)?)\s*([kKmM])?\b/);
  if (explicit) {
    return expandNumber(explicit[1], explicit[2]);
  }

  const forAmount = text.match(/\bfor\s+([0-9][0-9,]*(?:\.\d+)?)\s*([kKmM])?\b/i);
  if (forAmount) {
    return expandNumber(forAmount[1], forAmount[2]);
  }

  const standalone = text.match(/\b([1-9][0-9]{5,8})\b/);
  if (standalone) {
    const amount = Number(standalone[1]);
    if (amount >= 50_000) return amount;
  }

  return null;
}

function parseNumberBefore(text: string, unit: RegExp) {
  const pattern = new RegExp(`\\b(\\d+(?:\\.\\d+)?)\\s*${unit.source}`, "i");
  const match = text.match(pattern);
  return match ? Number(match[1]) : null;
}

function parseSquareFeet(text: string) {
  const match = text.match(/\b(?:about\s+|approximately\s+|approx\.?\s+)?([0-9][0-9,]*(?:\.\d+)?)\s*(?:sq\.?\s*ft\.?|sqft|square\s+feet)\b/i);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

function parseLotSize(text: string) {
  const acres = text.match(/\b([0-9]+(?:\.\d+)?)\s*(?:acre|acres)\b/i);
  if (acres) return Number(acres[1]);

  const sqft = text.match(/\blot(?:\s+size)?\s+(?:is\s+)?([0-9][0-9,]*(?:\.\d+)?)\s*(?:sq\.?\s*ft\.?|sqft|square\s+feet)\b/i);
  return sqft ? Number(sqft[1].replace(/,/g, "")) : null;
}

function parseYearBuilt(text: string) {
  const match = text.match(/\b(?:built\s+in|year\s+built)\s+(19\d{2}|20\d{2})\b/i);
  return match ? Number(match[1]) : null;
}

function parsePropertyType(text: string) {
  const types = ["single family", "single-family", "townhome", "townhouse", "condo", "duplex", "triplex", "multifamily", "multi-family", "land", "manufactured"];
  const found = types.find((type) => text.toLowerCase().includes(type));
  if (!found) return null;
  if (found === "multi-family") return "Multifamily";
  if (found === "single-family") return "Single Family";
  return titleCase(found);
}

function parseFeatures(text: string, address: string | null) {
  const cleaned = stripKnownFacts(text, address);
  const explicitFeatureText = getExplicitFeatureText(cleaned);
  const candidates = [
    ...splitFeatureFragments(explicitFeatureText || cleaned),
    ...featureKeywords.filter((keyword) => cleaned.toLowerCase().includes(keyword)),
  ];

  return Array.from(
    new Set(
      candidates
        .map(cleanFeature)
        .filter((feature) => isValidFeature(feature, address))
        .map(capitalizeFeature)
        .slice(0, 10),
    ),
  );
}

function stripKnownFacts(text: string, address: string | null) {
  let output = ` ${text} `;
  if (address) {
    output = output.replace(new RegExp(escapeRegExp(address), "i"), " ");
  }
  output = output
    .replace(/\$\s*[0-9][0-9,]*(?:\.\d+)?\s*[kKmM]?\b/g, " ")
    .replace(/\bfor\s+[0-9][0-9,]*(?:\.\d+)?\s*[kKmM]?\b/gi, " ")
    .replace(/\b\d+(?:\.\d+)?\s*(?:bedrooms?|beds?|br)\b/gi, " ")
    .replace(/\b\d+(?:\.\d+)?\s*(?:bathrooms?|baths?|ba)\b/gi, " ")
    .replace(/\b(?:about\s+|approximately\s+|approx\.?\s+)?[0-9][0-9,]*(?:\.\d+)?\s*(?:sq\.?\s*ft\.?|sqft|square\s+feet)\b/gi, " ")
    .replace(/\b(?:built\s+in|year\s+built)\s+(?:19\d{2}|20\d{2})\b/gi, " ")
    .replace(/\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/g, " ")
    .replace(/\b(?:I\s+want\s+to\s+list|list|selling|sale|asking|price|it\s+has|has|with|includes|features)\b/gi, " ");
  return normalizeSpaces(output);
}

function getExplicitFeatureText(text: string) {
  const match = text.match(/\b(?:highlights?|features?|upgrades?|includes?)\s*(?:are|include|includes|:)?\s*(.+)$/i);
  return match?.[1]?.trim() || "";
}

function splitFeatureFragments(text: string) {
  return text
    .split(/,|;|\.|\band\b|\bplus\b|\bwith\b/i)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isValidFeature(feature: string, address: string | null) {
  const lower = feature.toLowerCase();
  if (feature.length < 3 || feature.length > 60) return false;
  if (address && lower.includes(address.toLowerCase())) return false;
  if (/\b\d{4,6}\b/.test(feature)) return false;
  if (/\b(?:nc|sc|ga|tn|ca|tx|fl|ny|nj|va|concord|charlotte|raleigh|atlanta|nashville)\b/i.test(feature)) return false;
  if (/\b(?:bed|beds|bedroom|bath|baths|bathroom|sqft|square feet|price|dollar|listing|home|house|photos?|videos?|media|available)\b/i.test(feature)) return false;
  if (/^[0-9\s,$.-]+$/.test(feature)) return false;
  return true;
}

function parseSellerNotes(text: string, features: string[]) {
  const notes: string[] = [];
  if (/photos?/i.test(text)) notes.push("Seller/agent indicated photos are available.");
  if (/videos?/i.test(text)) notes.push("Seller/agent indicated video is available.");
  if (features.length === 0) notes.push("No separate highlights were clearly detected.");
  return notes;
}

function expandNumber(value: string, suffix?: string) {
  const base = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(base)) return null;
  if (!suffix) return Math.round(base);
  if (suffix.toLowerCase() === "k") return Math.round(base * 1000);
  if (suffix.toLowerCase() === "m") return Math.round(base * 1_000_000);
  return Math.round(base);
}

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function cleanFeature(value: string) {
  return cleanSentence(
    value
      .replace(/^\s*(?:a|an|the)\s+/i, "")
      .replace(/^\s*(?:it\s+)?(?:has|features|includes|with)\s+/i, ""),
  );
}

function cleanSentence(value: string) {
  return value.replace(/\s+/g, " ").replace(/[. ]+$/g, "").trim();
}

function capitalizeFeature(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
