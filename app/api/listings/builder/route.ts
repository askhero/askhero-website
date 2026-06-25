import { NextResponse } from "next/server";
import { enrichListing, type EnrichedListingDraft } from "@/lib/hero/enrichListing";
import { generateListingDraft } from "@/lib/hero/generateListingDraft";
import { parseListingPrompt } from "@/lib/hero/parseListingPrompt";
import { getClientKey, rateLimit } from "@/lib/rate-limit";
import { mediaCategorySlug, orderListingMedia } from "@/lib/hero/mediaTourOrder";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_MEDIA_FILES = 12;
const MAX_FILE_SIZE = 80 * 1024 * 1024;
const MEDIA_BUCKET = "listing-photos";

export async function POST(request: Request) {
  if (!rateLimit(getClientKey(request, "listing-builder"), 8, 60_000).allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again soon." }, { status: 429 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid listing builder submission." }, { status: 400 });
  }

  const prompt = String(formData.get("prompt") ?? "").trim();
  if (prompt.length < 20) {
    return NextResponse.json({ error: "Tell Hero a little more about the listing." }, { status: 400 });
  }

  if (prompt.length > 6000) {
    return NextResponse.json({ error: "Listing prompt is too long." }, { status: 400 });
  }

  const rawMedia = formData.getAll("media");
  const mediaCount = rawMedia.filter((entry): entry is File => entry instanceof File && entry.size > 0).slice(0, MAX_MEDIA_FILES).length;
  const parsed = parseListingPrompt(prompt);
  const baseDraft = generateListingDraft(parsed);
  const draft = await enrichListing(parsed, baseDraft, { mediaCount });
  const finalParsed = draft.parsed;
  const supabase = createSupabaseAdminClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      title: draft.title,
      address: finalParsed.address,
      address_line_1: finalParsed.address_line_1,
      city: finalParsed.city,
      state: finalParsed.state,
      zip: finalParsed.zip,
      latitude: draft.enrichment.geocoding_data.latitude,
      longitude: draft.enrichment.geocoding_data.longitude,
      price: finalParsed.asking_price,
      beds: finalParsed.beds,
      baths: finalParsed.baths,
      sqft: finalParsed.sqft,
      lot_size: finalParsed.lot_size,
      year_built: finalParsed.year_built,
      property_type: finalParsed.property_type,
      status: "draft",
      published: false,
      description: draft.description,
      source_type: "manual",
      approval_status: "pending",
      metadata: buildListingMetadata(finalParsed, draft, []),
    })
    .select("id")
    .single();

  if (error || !listing) {
    console.error("Hero Listing Builder insert failed", error);
    return NextResponse.json({ error: "Unable to save listing draft." }, { status: 500 });
  }

  let media: Awaited<ReturnType<typeof uploadMediaFiles>>;
  try {
    media = await uploadMediaFiles(
      supabase,
      listing.id,
      rawMedia,
      formData.getAll("mediaLabels"),
      formData.getAll("mediaOrders"),
      formData.getAll("mediaCategories"),
      formData.getAll("mediaCategorySlugs"),
      formData.getAll("mediaIsCover"),
    );
  } catch (caught) {
    return NextResponse.json({ error: caught instanceof Error ? caught.message : "Unable to upload listing media." }, { status: 400 });
  }
  await saveListingEnrichment(supabase, listing.id, draft.enrichment);

  await supabase.from("hero_scores").upsert({
    listing_id: listing.id,
    total_score: draft.heroScore.total_score,
    letter_grade: draft.heroScore.letter_grade,
    explanation: draft.heroScore.explanation,
    buyer_recommendation: draft.heroScore.buyer_recommendation,
    confidence_level: draft.heroScore.confidence_level,
    component_scores: {
      ...draft.heroScore.component_scores,
      enrichment: draft.enrichment.provider_status,
      conflicts: draft.enrichment.conflicts,
    },
  });

  if (media.length > 0) {
    await supabase
      .from("listings")
      .update({ metadata: buildListingMetadata(finalParsed, draft, media) })
      .eq("id", listing.id);
  }

  return NextResponse.json({
    success: true,
    listingId: listing.id,
    parsed: finalParsed,
    draft,
    media,
  });
}

function buildListingMetadata(
  parsed: EnrichedListingDraft["parsed"],
  draft: EnrichedListingDraft,
  media: Array<{ name: string; type: string; size: number; storage_path: string; kind: "image" | "video" | "file"; tourLabel?: string; tourOrder?: number; category?: string; categorySlug?: string; isCover?: boolean }>,
) {
  return {
    listing_builder: true,
    raw_prompt: parsed.rawPrompt,
    parsed_listing: parsed,
    highlights: draft.highlights,
    missing_data: draft.missingData,
    hero_ai_summary: draft.heroAiSummary,
    provider_data: draft.providerData,
    enrichment: draft.enrichment,
    conflicts: draft.enrichment.conflicts,
    seller_notes: parsed.seller_notes,
    media,
  };
}

async function saveListingEnrichment(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  listingId: string,
  enrichment: EnrichedListingDraft["enrichment"],
) {
  const { error } = await supabase.from("listing_enrichment").upsert({
    listing_id: listingId,
    property_details: enrichment.property_details,
    geocoding_data: enrichment.geocoding_data,
    nearby_schools: enrichment.nearby_schools,
    nearby_grocery: enrichment.nearby_grocery,
    nearby_shopping: enrichment.nearby_shopping,
    nearby_hospitals: enrichment.nearby_hospitals,
    nearby_roads: enrichment.nearby_roads,
    nearby_highways: enrichment.nearby_highways,
    crime_data: enrichment.crime_data,
    flood_data: enrichment.flood_data,
    appreciation_projection: enrichment.appreciation_projection,
    unavailable_data: enrichment.unavailable_data,
    provider_status: enrichment.provider_status,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("listing_enrichment upsert skipped", error.message);
  }
}

async function uploadMediaFiles(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  listingId: string,
  rawFiles: FormDataEntryValue[],
  rawLabels: FormDataEntryValue[] = [],
  rawOrders: FormDataEntryValue[] = [],
  rawCategories: FormDataEntryValue[] = [],
  rawCategorySlugs: FormDataEntryValue[] = [],
  rawIsCover: FormDataEntryValue[] = [],
) {
  const files = orderListingMedia(
    rawFiles
      .filter((entry): entry is File => entry instanceof File && entry.size > 0)
      .slice(0, MAX_MEDIA_FILES)
      .map((file, index) => ({
        file,
        kind: mediaKind(file),
        tourLabel: stringOrNull(rawLabels[index]),
        tourOrder: numberOrNull(rawOrders[index]),
        category: stringOrNull(rawCategories[index]) || stringOrNull(rawLabels[index]) || undefined,
        categorySlug: stringOrNull(rawCategorySlugs[index]) || undefined,
        isCover: stringOrNull(rawIsCover[index]) === "true",
      })),
    (item) => item.file.name,
    (item) => item.kind,
  );
  if (files.some((file) => !file.category && !file.tourLabel)) {
    throw new Error("Choose a media category for every uploaded file.");
  }

  const uploaded: Array<{ name: string; type: string; size: number; storage_path: string; kind: "image" | "video" | "file"; tourLabel?: string; tourOrder?: number; category?: string; categorySlug?: string; isCover?: boolean }> = [];

  for (const [index, file] of files.entries()) {
    if (file.file.size > MAX_FILE_SIZE) {
      continue;
    }

    const kind = file.kind;
    const extension = file.file.name.includes(".") ? file.file.name.split(".").pop() : "bin";
    const storagePath = `${listingId}/${Date.now()}-${index}.${extension}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, file.file, {
      contentType: file.file.type || "application/octet-stream",
      upsert: false,
    });

    if (error) {
      console.warn("Hero Listing Builder media upload skipped", error.message);
      continue;
    }

    const category = file.category || file.tourLabel || "Other";
    const categorySlug = file.categorySlug || mediaCategorySlug(category);
    uploaded.push({ name: file.file.name, type: file.file.type || "application/octet-stream", size: file.file.size, storage_path: storagePath, kind, tourLabel: category, tourOrder: file.tourOrder, category, categorySlug, isCover: file.isCover });

    if (kind === "image") {
      await supabase.from("listing_photos").insert({
        listing_id: listingId,
        storage_path: storagePath,
        alt_text: `${category} - ${file.file.name}`,
        sort_order: index,
        category,
        category_slug: categorySlug,
        is_cover: Boolean(file.isCover),
      });
    }
  }

  return uploaded;
}

function mediaKind(file: File): "image" | "video" | "file" {
  const type = typeof file.type === "string" ? file.type : "";
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  return "file";
}

function stringOrNull(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function numberOrNull(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
