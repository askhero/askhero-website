import type { EnrichedListingDraft } from "@/lib/hero/enrichListing";
import type { ParsedListingPrompt } from "@/lib/hero/parseListingPrompt";

export type BuilderMediaFile = {
  file: File;
  previewUrl: string;
  kind: "image" | "video" | "file";
  tourLabel?: string;
  tourOrder?: number;
  category?: string;
  categorySlug?: string;
  isCover?: boolean;
};

export type SavedBuilderMedia = {
  name: string;
  type: string;
  size: number;
  storage_path: string;
  kind: "image" | "video" | "file";
  tourLabel?: string;
  tourOrder?: number;
  category?: string;
  categorySlug?: string;
  isCover?: boolean;
};

export type ListingBuilderDraft = {
  listingId: string;
  parsed: ParsedListingPrompt;
  draft: EnrichedListingDraft;
  media: SavedBuilderMedia[];
};

export type EditableListingFields = ParsedListingPrompt & {
  title: string;
  description: string;
  heroAiSummary: string;
  highlightsText: string;
  missingDataText: string;
};
