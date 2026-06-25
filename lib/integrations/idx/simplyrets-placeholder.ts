import type {
  ListingProvider,
  ListingSearchParams,
} from "@/lib/integrations/idx/provider-interface";
import type { NormalizedListing } from "@/types/listing";

export class SimplyRetsProviderPlaceholder implements ListingProvider {
  name = "simplyrets-placeholder";

  async search(_params: ListingSearchParams): Promise<NormalizedListing[]> {
    void _params;
    return [];
  }

  async getBySourceId(_sourceId: string): Promise<NormalizedListing | null> {
    void _sourceId;
    return null;
  }

  normalize(rawListing: unknown): NormalizedListing {
    const raw = rawListing as {
      property?: Record<string, unknown>;
      address?: Record<string, unknown>;
      listPrice?: number;
      mlsId?: string;
      remarks?: string;
      listAgent?: Record<string, unknown>;
      listOffice?: Record<string, unknown>;
    };

    return {
      address_line_1: String(raw.address?.full || ""),
      address_line_2: null,
      city: String(raw.address?.city || ""),
      state: String(raw.address?.state || ""),
      zip: String(raw.address?.postalCode || ""),
      latitude: Number(raw.address?.lat) || null,
      longitude: Number(raw.address?.lng) || null,
      price: raw.listPrice || null,
      beds: Number(raw.property?.bedrooms) || null,
      baths: Number(raw.property?.bathsFull) || null,
      sqft: Number(raw.property?.area) || null,
      lot_size: Number(raw.property?.lotSize) || null,
      year_built: Number(raw.property?.yearBuilt) || null,
      property_type: String(raw.property?.type || ""),
      status: "active",
      description: raw.remarks || null,
      listing_agent_name: String(raw.listAgent?.fullName || ""),
      listing_agent_email: String(raw.listAgent?.email || ""),
      listing_agent_phone: String(raw.listAgent?.phone || ""),
      brokerage_name: String(raw.listOffice?.name || ""),
      source_type: "idx",
      source_id: raw.mlsId || null,
      approval_status: "pending",
    };
  }
}
