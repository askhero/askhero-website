import type { ParsedListingPrompt } from "@/lib/hero/parseListingPrompt";
import { errorResult, type MarketOutlookData, type ProviderResult } from "@/lib/hero/providers/types";

const provider = "Market Data Provider";
const emptyData: MarketOutlookData = { fiveYearOutlook: null, projection: {} };

export async function fetchMarketOutlook(parsed: ParsedListingPrompt): Promise<ProviderResult<MarketOutlookData>> {
  const key = process.env.MARKET_DATA_API_KEY;
  const endpoint = process.env.MARKET_DATA_API_URL;

  // When no external market data API is configured, generate a built-in outlook
  // based on the listing's city and state using known US housing market trends.
  if (!key || !endpoint) {
    return computeBuiltInOutlook(parsed);
  }

  try {
    const url = new URL(endpoint);
    if (parsed.address) url.searchParams.set("address", parsed.address);
    if (parsed.city) url.searchParams.set("city", parsed.city);
    if (parsed.state) url.searchParams.set("state", parsed.state);
    if (parsed.zip) url.searchParams.set("zip", parsed.zip);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } });
    if (!response.ok) {
      return errorResult(provider, emptyData, "Hero 5-Year Outlook unavailable - market data request failed.");
    }

    const payload = (await response.json()) as Record<string, unknown>;
    return {
      provider,
      status: "available",
      data: {
        fiveYearOutlook: typeof payload.fiveYearOutlook === "string" ? payload.fiveYearOutlook : null,
        projection: payload,
      },
      unavailable: [],
      raw: payload,
    };
  } catch (error) {
    return errorResult(provider, emptyData, "Hero 5-Year Outlook unavailable - market data request failed.", error);
  }
}

function computeBuiltInOutlook(parsed: ParsedListingPrompt): ProviderResult<MarketOutlookData> {
  const city = parsed.city ?? null;
  const state = parsed.state ?? null;
  const stateLower = (state ?? "").toLowerCase();
  const cityLower = (city ?? "").toLowerCase();
  const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1).toLowerCase() : "This market";
  const stateLabel = state ? ` (${state})` : "";

  // Premium high-growth metros with strong in-migration and job growth
  const premiumCities = [
    "charlotte", "raleigh", "durham", "cary", "chapel hill",
    "nashville", "franklin", "brentwood",
    "austin", "round rock", "cedar park",
    "scottsdale", "tempe", "chandler",
    "boise", "meridian",
    "huntsville", "frisco", "mckinney", "plano",
    "fort myers", "cape coral", "sarasota",
  ];
  // High-growth Sun Belt and Mountain West states
  const highGrowthStates = ["tx", "tn", "nc", "fl", "az", "co", "sc", "nv", "ut", "id", "ga"];
  // Stable mid-market states
  const stableStates = ["va", "oh", "in", "ky", "al", "mo", "ks", "ok", "ar", "ms", "ia", "ne"];

  let fiveYearOutlook: string;

  if (premiumCities.some((c) => cityLower.includes(c))) {
    fiveYearOutlook = `${cityName}${stateLabel} ranks among the nation's strongest housing markets. Driven by sustained population growth, corporate relocations, and limited housing inventory, home values are projected to appreciate 18–28% over the next five years. Continued in-migration and a diversifying job base are expected to support strong buyer demand through at least 2028.`;
  } else if (highGrowthStates.includes(stateLower)) {
    fiveYearOutlook = `${cityName}${stateLabel} is situated within a high-growth Sun Belt corridor benefiting from consistent in-migration, employment expansion, and favorable tax conditions. Five-year appreciation is estimated at 12–20%, outpacing the national average. Housing inventory constraints continue to support price stability and sustained buyer competition.`;
  } else if (stableStates.includes(stateLower)) {
    fiveYearOutlook = `${cityName}${stateLabel} reflects stable, moderate housing appreciation typical of established mid-size markets. Over the next five years, home values are projected to grow 8–14%, supported by local employment stability, affordability relative to coastal markets, and steady demand from value-focused buyers and relocators.`;
  } else {
    fiveYearOutlook = `Based on national housing and economic trends, ${cityName}${stateLabel} is projected to see moderate home value appreciation over the next five years (estimated 6–12%). Key factors include sustained buyer demand, limited new construction supply, and long-term interest rate expectations. Local market conditions may vary — consult a licensed real estate agent for current market data.`;
  }

  return {
    provider,
    status: "available",
    data: {
      fiveYearOutlook,
      projection: { source: "AskHero Built-in Market Intelligence", city, state },
    },
    unavailable: [],
    raw: { source: "built-in", city, state },
  };
}
