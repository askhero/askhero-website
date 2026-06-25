import type { BuyerProfile } from "@/lib/hero/types";

const STATE_ALIASES: Record<string, string> = {
  "north carolina": "NC",
  nc: "NC",
  georgia: "GA",
  ga: "GA",
  tennessee: "TN",
  tn: "TN",
  "south carolina": "SC",
  sc: "SC",
  florida: "FL",
  fl: "FL",
};

const KNOWN_MARKETS: Record<string, { city: string; state: string }> = {
  charlotte: { city: "Charlotte", state: "NC" },
  raleigh: { city: "Raleigh", state: "NC" },
  atlanta: { city: "Atlanta", state: "GA" },
  nashville: { city: "Nashville", state: "TN" },
};

export function parseBuyerSearch(query: string): BuyerProfile {
  const normalized = query.trim();
  const lower = normalized.toLowerCase();
  const { city, state } = parseLocation(normalized);
  const familySize = parseFamilySize(lower);
  const explicitBeds = parseRequestedBeds(lower);
  const priorities = parsePriorities(lower);

  return {
    rawQuery: normalized,
    income: parseIncome(lower),
    familySize,
    city,
    state,
    requestedBeds: explicitBeds ?? inferBedsFromFamily(familySize),
    schoolImportance: priorities.includes("Schools"),
    safetyImportance: priorities.includes("Safety"),
    groceryImportance: priorities.includes("Grocery access"),
    commuteImportance: priorities.includes("Commute"),
    budgetIntent: parseBudgetIntent(lower),
    priorities,
  };
}

function parseIncome(value: string) {
  const incomeContext = value.match(/(?:income|earn|salary|household)\D{0,24}(\$?\d[\d,]*(?:\.\d+)?\s*(?:k|m)?)/i);
  const money = incomeContext?.[1] ?? value.match(/\$\s*\d[\d,]*(?:\.\d+)?\s*(?:k|m)?/i)?.[0];
  if (!money) return null;
  return parseMoney(money);
}

function parseMoney(value: string) {
  const compact = value.toLowerCase().replace(/[$,\s]/g, "");
  const multiplier = compact.endsWith("m") ? 1_000_000 : compact.endsWith("k") ? 1_000 : 1;
  const numeric = Number.parseFloat(compact.replace(/[km]$/, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.round(numeric * multiplier);
}

function parseFamilySize(value: string) {
  const match = value.match(/family\s+of\s+(\d+)/i) ?? value.match(/(\d+)\s+(?:people|person|children|kids|family members)/i);
  const size = match ? Number.parseInt(match[1], 10) : null;
  return size && size > 0 ? size : null;
}

function parseRequestedBeds(value: string) {
  const match = value.match(/(\d+)\s*(?:bed|beds|bedroom|bedrooms)/i);
  const beds = match ? Number.parseInt(match[1], 10) : null;
  return beds && beds > 0 ? beds : null;
}

function inferBedsFromFamily(familySize: number | null) {
  if (!familySize) return null;
  if (familySize <= 2) return 2;
  if (familySize <= 4) return 3;
  return 4;
}

function parseLocation(query: string) {
  const lower = query.toLowerCase();
  const locationWithState = query.match(/(?:in|near|around|within)\s+([a-zA-Z .'-]+?),?\s+(NC|GA|TN|SC|FL|North Carolina|Georgia|Tennessee|South Carolina|Florida)\b/i);
  if (locationWithState) {
    return {
      city: titleCase(locationWithState[1].replace(/\bwith\b.*$/i, "").trim()),
      state: STATE_ALIASES[locationWithState[2].toLowerCase()] ?? locationWithState[2].toUpperCase(),
    };
  }

  for (const [key, market] of Object.entries(KNOWN_MARKETS)) {
    if (lower.includes(key)) return market;
  }

  return { city: null, state: null };
}

function parsePriorities(value: string) {
  const priorities: string[] = [];
  if (/school|district|education/.test(value)) priorities.push("Schools");
  if (/safe|safety|crime|low crime|security/.test(value)) priorities.push("Safety");
  if (/grocery|groceries|store|shopping|market/.test(value)) priorities.push("Grocery access");
  if (/commute|drive|walk|transit|work/.test(value)) priorities.push("Commute");
  if (/value|deal|below market|opportunity|negotiat/.test(value)) priorities.push("Value opportunity");
  return priorities;
}

function parseBudgetIntent(value: string): BuyerProfile["budgetIntent"] {
  if (/safe|conservative|comfortable|not stretch|avoid stretching/.test(value)) return "conservative";
  if (/stretch|max budget|maximum|as much as/.test(value)) return "stretch";
  if (/budget|afford|income|payment/.test(value)) return "balanced";
  return "unknown";
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}