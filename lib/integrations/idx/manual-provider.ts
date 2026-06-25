import type {
  ListingProvider,
  ListingSearchParams,
} from "@/lib/integrations/idx/provider-interface";
import type { NormalizedListing } from "@/types/listing";

export class ManualListingProvider implements ListingProvider {
  name = "manual";

  constructor(private listings: NormalizedListing[] = []) {}

  async search(params: ListingSearchParams) {
    return this.listings.filter((listing) => {
      if (params.city && listing.city.toLowerCase() !== params.city.toLowerCase()) return false;
      if (params.state && listing.state.toLowerCase() !== params.state.toLowerCase()) return false;
      if (params.zip && listing.zip !== params.zip) return false;
      if (params.minPrice && (listing.price || 0) < params.minPrice) return false;
      if (params.maxPrice && (listing.price || 0) > params.maxPrice) return false;
      if (params.beds && (listing.beds || 0) < params.beds) return false;
      if (params.baths && (listing.baths || 0) < params.baths) return false;
      return true;
    });
  }

  async getBySourceId(sourceId: string) {
    return this.listings.find((listing) => listing.source_id === sourceId) || null;
  }

  normalize(rawListing: unknown): NormalizedListing {
    const raw = rawListing as Partial<NormalizedListing>;
    return {
      address_line_1: raw.address_line_1 || "",
      address_line_2: raw.address_line_2 || null,
      city: raw.city || "",
      state: raw.state || "",
      zip: raw.zip || "",
      latitude: raw.latitude || null,
      longitude: raw.longitude || null,
      price: raw.price || null,
      beds: raw.beds || null,
      baths: raw.baths || null,
      sqft: raw.sqft || null,
      lot_size: raw.lot_size || null,
      year_built: raw.year_built || null,
      property_type: raw.property_type || null,
      status: raw.status || "coming_soon",
      description: raw.description || null,
      listing_agent_name: raw.listing_agent_name || null,
      listing_agent_email: raw.listing_agent_email || null,
      listing_agent_phone: raw.listing_agent_phone || null,
      brokerage_name: raw.brokerage_name || null,
      source_type: "manual",
      source_id: raw.source_id || null,
      approval_status: raw.approval_status || "pending",
    };
  }
}
