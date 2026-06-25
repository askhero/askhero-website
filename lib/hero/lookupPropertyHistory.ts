import type { ParsedListingPrompt } from "@/lib/hero/parseListingPrompt";

export type PropertyHistoryLookup = {
  source: string;
  propertyFacts: Partial<Pick<ParsedListingPrompt, "lot_size" | "year_built" | "property_type">>;
  saleHistory: string[];
  taxHistory: string[];
  schoolRating: string | null;
  crimeData: string | null;
  appreciationOutlook: string | null;
  insuranceRisk: string | null;
  raw?: unknown;
};

export async function lookupPropertyHistory(address: string | null): Promise<PropertyHistoryLookup | null> {
  const endpoint = process.env.PROPERTY_HISTORY_API_URL;
  if (!address || !endpoint) {
    return null;
  }

  const url = new URL(endpoint);
  url.searchParams.set("address", address);

  const response = await fetch(url, {
    headers: process.env.PROPERTY_HISTORY_API_KEY
      ? { Authorization: `Bearer ${process.env.PROPERTY_HISTORY_API_KEY}` }
      : undefined,
    next: { revalidate: 60 * 60 * 24 },
  }).catch((error) => {
    console.warn("Property history lookup unavailable", error);
    return null;
  });

  if (!response?.ok) {
    return null;
  }

  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!data) {
    return null;
  }

  return normalizePropertyHistory(data);
}

export function mergePropertyHistory(parsed: ParsedListingPrompt, lookup: PropertyHistoryLookup | null): ParsedListingPrompt {
  if (!lookup) return parsed;

  return {
    ...parsed,
    lot_size: parsed.lot_size ?? numberOrNull(lookup.propertyFacts.lot_size),
    year_built: parsed.year_built ?? numberOrNull(lookup.propertyFacts.year_built),
    property_type: parsed.property_type ?? stringOrNull(lookup.propertyFacts.property_type),
    seller_notes: [
      ...parsed.seller_notes,
      `Property history lookup source: ${lookup.source}.`,
    ],
  };
}

function normalizePropertyHistory(data: Record<string, unknown>): PropertyHistoryLookup {
  const facts = objectOrEmpty(data.propertyFacts ?? data.facts ?? data);

  return {
    source: stringOrNull(data.source) ?? "Configured property history provider",
    propertyFacts: {
      lot_size: numberOrNull(facts.lot_size ?? facts.lotSize),
      year_built: numberOrNull(facts.year_built ?? facts.yearBuilt),
      property_type: stringOrNull(facts.property_type ?? facts.propertyType),
    },
    saleHistory: stringArray(data.saleHistory ?? data.sales ?? data.priorSales),
    taxHistory: stringArray(data.taxHistory ?? data.taxes),
    schoolRating: stringOrNull(data.schoolRating),
    crimeData: stringOrNull(data.crimeData),
    appreciationOutlook: stringOrNull(data.appreciationOutlook),
    insuranceRisk: stringOrNull(data.insuranceRisk),
    raw: data,
  };
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 8);
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