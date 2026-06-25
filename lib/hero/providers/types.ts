import type { ParsedListingPrompt } from "@/lib/hero/parseListingPrompt";

export type ProviderStatus = "available" | "unavailable" | "error";

export type ProviderResult<T> = {
  provider: string;
  status: ProviderStatus;
  data: T;
  unavailable: string[];
  raw?: unknown;
};

export type GeocodingData = {
  verifiedAddress: string | null;
  formattedAddress?: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
};

export type NearbyAmenity = {
  name: string;
  address: string | null;
  type?: string | null;
  distanceMiles?: number | null;
  rating: number | null;
  placeId: string | null;
  category: string;
  source?: string | null;
};

export type GoogleMapsData = {
  geocoding: GeocodingData;
  nearby_schools: NearbyAmenity[];
  nearby_grocery: NearbyAmenity[];
  nearby_shopping: NearbyAmenity[];
  nearby_hospitals: NearbyAmenity[];
  nearby_roads: NearbyAmenity[];
  nearby_highways: NearbyAmenity[];
  nearby_parks: NearbyAmenity[];
};

export type AttomPropertyDetails = Partial<Pick<ParsedListingPrompt, "beds" | "baths" | "sqft" | "lot_size" | "year_built" | "property_type">> & {
  tax_assessment?: Record<string, unknown>;
  sale_history?: unknown[];
  raw_summary?: Record<string, unknown>;
};

export type SchoolData = {
  name: string;
  rating: string | number | null;
  ratingBand: string | null;
  distanceMiles: number | null;
  level: string | null;
  source?: string | null;
};

export type HeroCrimeSignal = "Very Low" | "Low" | "Moderate" | "Elevated" | "High";

export type HeroCrimeProvider = "crimeometer" | "fbi_cde" | "none";

export type HeroCrimeData = {
  provider: HeroCrimeProvider;
  unavailable: boolean;
  unavailableReason?: string;
  heroCrimeSignal?: HeroCrimeSignal;
  overallRiskScore?: number | null;
  violentCrimeRate?: number | null;
  propertyCrimeRate?: number | null;
  confidence?: number;
  source?: string | null;
  lastUpdated?: string | null;
  rawData?: unknown;
};

export type HeroFloodSignal = "Minimal" | "Moderate" | "Elevated" | "High" | "Unknown";

export type HeroFloodData = {
  provider: "fema_nfhl" | "none";
  unavailable: boolean;
  unavailableReason?: string;
  heroFloodSignal?: HeroFloodSignal;
  floodZone?: string | null;
  floodZoneDescription?: string | null;
  specialFloodHazardArea?: boolean | null;
  firmPanel?: string | null;
  effectiveDate?: string | null;
  confidence?: number;
  source?: string;
  lastUpdated?: string | null;
  rawData?: unknown;
};

export type MarketOutlookData = {
  fiveYearOutlook: string | null;
  projection: Record<string, unknown>;
};

export type EnrichmentConflict = {
  field: keyof ParsedListingPrompt;
  userValue: string | number | null;
  providerValue: string | number | null;
  provider: string;
  message: string;
};

export type ListingEnrichmentData = {
  property_details: AttomPropertyDetails;
  geocoding_data: GeocodingData;
  nearby_schools: SchoolData[];
  nearby_grocery: NearbyAmenity[];
  nearby_shopping: NearbyAmenity[];
  nearby_hospitals: NearbyAmenity[];
  nearby_roads: NearbyAmenity[];
  nearby_highways: NearbyAmenity[];
  nearby_parks: NearbyAmenity[];
  crime_data: HeroCrimeData;
  flood_data: HeroFloodData;
  appreciation_projection: MarketOutlookData | Record<string, never>;
  unavailable_data: string[];
  provider_status: Record<string, ProviderStatus>;
  conflicts: EnrichmentConflict[];
};

export function unavailableResult<T>(provider: string, data: T, message: string): ProviderResult<T> {
  return { provider, status: "unavailable", data, unavailable: [message] };
}

export function errorResult<T>(provider: string, data: T, message: string, raw?: unknown): ProviderResult<T> {
  return { provider, status: "error", data, unavailable: [message], raw };
}
