import type { NormalizedListing } from "@/types/listing";

export type ListingSearchParams = {
  city?: string;
  state?: string;
  zip?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
};

export interface ListingProvider {
  name: string;
  search(params: ListingSearchParams): Promise<NormalizedListing[]>;
  getBySourceId(sourceId: string): Promise<NormalizedListing | null>;
  normalize(rawListing: unknown): NormalizedListing;
}
