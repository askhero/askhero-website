import type {
  ListingProvider,
  ListingSearchParams,
} from "@/lib/integrations/idx/provider-interface";
import type { NormalizedListing } from "@/types/listing";

export class ResoProviderPlaceholder implements ListingProvider {
  name = "reso-placeholder";

  async search(_params: ListingSearchParams): Promise<NormalizedListing[]> {
    void _params;
    return [];
  }

  async getBySourceId(_sourceId: string): Promise<NormalizedListing | null> {
    void _sourceId;
    return null;
  }

  normalize(rawListing: unknown): NormalizedListing {
    const raw = rawListing as Record<string, unknown>;
    return {
      address_line_1: String(raw.UnparsedAddress || ""),
      address_line_2: null,
      city: String(raw.City || ""),
      state: String(raw.StateOrProvince || ""),
      zip: String(raw.PostalCode || ""),
      latitude: Number(raw.Latitude) || null,
      longitude: Number(raw.Longitude) || null,
      price: Number(raw.ListPrice) || null,
      beds: Number(raw.BedroomsTotal) || null,
      baths: Number(raw.BathroomsTotalInteger) || null,
      sqft: Number(raw.LivingArea) || null,
      lot_size: Number(raw.LotSizeArea) || null,
      year_built: Number(raw.YearBuilt) || null,
      property_type: String(raw.PropertySubType || ""),
      status: "active",
      description: String(raw.PublicRemarks || ""),
      listing_agent_name: String(raw.ListAgentFullName || ""),
      listing_agent_email: String(raw.ListAgentEmail || ""),
      listing_agent_phone: String(raw.ListAgentPreferredPhone || ""),
      brokerage_name: String(raw.ListOfficeName || ""),
      source_type: "reso",
      source_id: String(raw.ListingKey || ""),
      approval_status: "pending",
    };
  }
}
