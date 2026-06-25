export type ListingStatus = "coming_soon" | "active" | "pending" | "sold" | "off_market";
export type ListingSourceType = "manual" | "idx" | "reso" | "api";
export type ListingApprovalStatus = "pending" | "approved" | "rejected";

export type NormalizedListing = {
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  zip: string;
  latitude?: number | null;
  longitude?: number | null;
  price?: number | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  lot_size?: number | null;
  year_built?: number | null;
  property_type?: string | null;
  status: ListingStatus;
  description?: string | null;
  listing_agent_name?: string | null;
  listing_agent_email?: string | null;
  listing_agent_phone?: string | null;
  brokerage_name?: string | null;
  source_type: ListingSourceType;
  source_id?: string | null;
  approval_status: ListingApprovalStatus;
};
