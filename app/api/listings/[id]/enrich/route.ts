import { NextResponse } from "next/server";
import { enrichListing } from "@/lib/hero/enrichListing";
import { generateListingDraft } from "@/lib/hero/generateListingDraft";
import type { ParsedListingPrompt } from "@/lib/hero/parseListingPrompt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const parsed = listingToParsedPrompt(listing as Record<string, unknown>);
  const draft = await enrichListing(parsed, generateListingDraft(parsed));

  await supabase
    .from("listings")
    .update({
      metadata: {
        ...(isRecord(listing.metadata) ? listing.metadata : {}),
        enrichment: draft.enrichment,
        provider_data: draft.providerData,
        conflicts: draft.enrichment.conflicts,
        missing_data: draft.missingData,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  const { error: enrichmentError } = await supabase.from("listing_enrichment").upsert({
    listing_id: id,
    property_details: draft.enrichment.property_details,
    geocoding_data: draft.enrichment.geocoding_data,
    nearby_schools: draft.enrichment.nearby_schools,
    nearby_grocery: draft.enrichment.nearby_grocery,
    nearby_shopping: draft.enrichment.nearby_shopping,
    nearby_hospitals: draft.enrichment.nearby_hospitals,
    nearby_roads: draft.enrichment.nearby_roads,
    nearby_highways: draft.enrichment.nearby_highways,
    crime_data: draft.enrichment.crime_data,
    flood_data: draft.enrichment.flood_data,
    appreciation_projection: draft.enrichment.appreciation_projection,
    unavailable_data: draft.enrichment.unavailable_data,
    provider_status: draft.enrichment.provider_status,
    updated_at: new Date().toISOString(),
  });

  if (enrichmentError) {
    console.warn("listing_enrichment upsert skipped", enrichmentError.message);
  }

  if (draft.enrichment.geocoding_data.latitude && draft.enrichment.geocoding_data.longitude) {
    await supabase
      .from("listings")
      .update({
        latitude: draft.enrichment.geocoding_data.latitude,
        longitude: draft.enrichment.geocoding_data.longitude,
      })
      .eq("id", id);
  }

  return NextResponse.json({ success: true, listingId: id, enrichment: draft.enrichment, providerData: draft.providerData });
}

function listingToParsedPrompt(listing: Record<string, unknown>): ParsedListingPrompt {
  const metadata = isRecord(listing.metadata) ? listing.metadata : {};
  const parsed = isRecord(metadata.parsed_listing) ? metadata.parsed_listing : {};
  return {
    rawPrompt: String(parsed.rawPrompt ?? metadata.raw_prompt ?? "Existing listing enrichment"),
    address: stringOrNull(listing.address) ?? stringOrNull(parsed.address),
    address_line_1: stringOrNull(listing.address_line_1) ?? stringOrNull(parsed.address_line_1),
    city: stringOrNull(listing.city) ?? stringOrNull(parsed.city),
    state: stringOrNull(listing.state) ?? stringOrNull(parsed.state),
    zip: stringOrNull(listing.zip) ?? stringOrNull(parsed.zip),
    asking_price: numberOrNull(listing.price) ?? numberOrNull(parsed.asking_price),
    beds: numberOrNull(listing.beds) ?? numberOrNull(parsed.beds),
    baths: numberOrNull(listing.baths) ?? numberOrNull(parsed.baths),
    sqft: numberOrNull(listing.sqft) ?? numberOrNull(parsed.sqft),
    lot_size: numberOrNull(listing.lot_size) ?? numberOrNull(parsed.lot_size),
    year_built: numberOrNull(listing.year_built) ?? numberOrNull(parsed.year_built),
    property_type: stringOrNull(listing.property_type) ?? stringOrNull(parsed.property_type),
    features: Array.isArray(metadata.highlights) ? metadata.highlights.map(String) : [],
    seller_notes: Array.isArray(parsed.seller_notes) ? parsed.seller_notes.map(String) : [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
