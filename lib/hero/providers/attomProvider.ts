import type { ParsedListingPrompt } from "@/lib/hero/parseListingPrompt";
import { errorResult, unavailableResult, type AttomPropertyDetails, type ProviderResult } from "@/lib/hero/providers/types";

const provider = "ATTOM";
const emptyData: AttomPropertyDetails = {};

export async function fetchAttomPropertyDetails(parsed: ParsedListingPrompt): Promise<ProviderResult<AttomPropertyDetails>> {
  const key = process.env.ATTOM_API_KEY;
  if (!key) {
    return unavailableResult(provider, emptyData, "Property details unavailable - ATTOM API key not configured.");
  }

  if (!parsed.address_line_1 || !parsed.city || !parsed.state) {
    return unavailableResult(provider, emptyData, "Property details unavailable - address, city, and state are required for ATTOM lookup.");
  }

  try {
    const url = new URL(process.env.ATTOM_API_URL || "https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail");
    url.searchParams.set("address1", parsed.address_line_1);
    url.searchParams.set("address2", `${parsed.city}, ${parsed.state}${parsed.zip ? ` ${parsed.zip}` : ""}`);
    const response = await fetch(url, { headers: { apikey: key, Accept: "application/json" } });
    if (!response.ok) {
      return errorResult(provider, emptyData, "Property details unavailable - ATTOM request failed.");
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const property = Array.isArray(payload.property) ? payload.property[0] as Record<string, unknown> | undefined : undefined;
    if (!property) {
      return unavailableResult(provider, emptyData, "Property details unavailable - ATTOM returned no matching property.");
    }

    const data: AttomPropertyDetails = {
      beds: firstNumber(property, ["beds", "bedrooms"]),
      baths: firstNumber(property, ["bathsTotal", "bathstotal", "baths", "bathrooms", "bathFull", "bathsfull"]),
      sqft: firstNumber(property, ["livingSize", "livingsize", "universalSize", "universalsize", "buildingSize", "grossSize"]),
      lot_size: firstNumber(property, ["lotSize1", "lotsize1", "lotSize2", "lotsize2", "lotSqft", "lotSquareFeet"]),
      year_built: firstNumber(property, ["yearBuilt", "yearbuilt", "effectiveYearBuilt"]),
      property_type: firstString(property, ["propertyType", "propertytype", "propType", "proptype", "propSubType", "propsubtype", "useType"]),
      tax_assessment: objectOrEmpty(findFirstValue(property, ["assessment", "tax", "taxAssessment"])),
      sale_history: arrayOrEmpty(findFirstValue(property, ["saleHistory", "salesHistory", "sale", "sales"])),
      raw_summary: objectOrEmpty(findFirstValue(property, ["summary"])),
    };

    const hasUsableFacts = ["beds", "baths", "sqft", "lot_size", "year_built", "property_type"].some(
      (key) => data[key as keyof AttomPropertyDetails] !== null && data[key as keyof AttomPropertyDetails] !== undefined && data[key as keyof AttomPropertyDetails] !== "",
    );

    if (!hasUsableFacts) {
      return unavailableResult(provider, data, "Property details unavailable - ATTOM returned a record without usable listing facts.");
    }

    return {
      provider,
      status: "available",
      data,
      unavailable: [],
      raw: payload,
    };
  } catch (error) {
    return errorResult(provider, emptyData, "Property details unavailable - ATTOM request failed.", error);
  }
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function arrayOrEmpty(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "object" && value !== null) return [value];
  return [];
}

function firstNumber(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = numberOrNull(findFirstValue(source, [key]));
    if (value !== null) return value;
  }
  return null;
}

function firstString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = stringOrNull(findFirstValue(source, [key]));
    if (value !== null) return normalizePropertyType(value);
  }
  return null;
}

function findFirstValue(source: unknown, keys: string[]): unknown {
  if (typeof source !== "object" || source === null) return null;
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  const stack = [source as Record<string, unknown>];

  while (stack.length) {
    const current = stack.shift();
    if (!current) continue;

    for (const [key, value] of Object.entries(current)) {
      if (wanted.has(key.toLowerCase())) return value;
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && !Array.isArray(item)).forEach((item) => stack.push(item));
        } else {
          stack.push(value as Record<string, unknown>);
        }
      }
    }
  }

  return null;
}

function normalizePropertyType(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("single")) return "Single Family";
  if (lower.includes("town")) return "Townhome";
  if (lower.includes("condo")) return "Condo";
  if (lower.includes("duplex")) return "Duplex";
  return value.replace(/\w\S*/g, (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
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
