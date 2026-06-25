import { NextResponse } from "next/server";
import { generateListingDraft } from "@/lib/hero/generateListingDraft";
import { parseListingPrompt, type ParsedListingPrompt } from "@/lib/hero/parseListingPrompt";
import { getClientKey, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ConfirmPayload = {
  listingId?: string;
  fields?: Partial<ParsedListingPrompt> & {
    title?: string;
    description?: string;
    heroAiSummary?: string;
    highlights?: string[];
    missingData?: string[];
  };
};

export async function POST(request: Request) {
  if (!rateLimit(getClientKey(request, "listing-builder-confirm"), 10, 60_000).allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again soon." }, { status: 429 });
  }

  const payload = (await request.json().catch(() => null)) as ConfirmPayload | null;
  const listingId = payload?.listingId;
  if (!listingId) {
    return NextResponse.json({ error: "Missing listing draft." }, { status: 400 });
  }

  const fields = payload?.fields ?? {};
  const requireApproval = process.env.REQUIRE_ADMIN_LISTING_APPROVAL !== "false";
  const status = requireApproval ? "pending_review" : "active";
  const published = !requireApproval;
  const approvalStatus = requireApproval ? "pending" : "approved";
  const approvedAt = requireApproval ? null : new Date().toISOString();

  const parsed = normalizeEditableFields(fields);
  const regenerated = generateListingDraft(parsed);
  const title = fields.title?.trim() || regenerated.title;
  const description = fields.description?.trim() || regenerated.description;
  const highlights = normalizeStringArray(fields.highlights).length ? normalizeStringArray(fields.highlights) : regenerated.highlights;
  const missingData = normalizeStringArray(fields.missingData).length ? normalizeStringArray(fields.missingData) : regenerated.missingData;
  const heroAiSummary = fields.heroAiSummary?.trim() || regenerated.heroAiSummary;

  const supabase = createSupabaseAdminClient();
  const { data: existingListing } = await supabase
    .from("listings")
    .select("metadata")
    .eq("id", listingId)
    .single();
  const { data: existingScore } = await supabase
    .from("hero_scores")
    .select("total_score,letter_grade,explanation,buyer_recommendation,confidence_level,component_scores")
    .eq("listing_id", listingId)
    .maybeSingle();
  const existingMetadata = isRecord(existingListing?.metadata) ? existingListing.metadata : {};

  const { error } = await supabase
    .from("listings")
    .update({
      title,
      address: parsed.address,
      address_line_1: parsed.address_line_1,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
      price: parsed.asking_price,
      beds: parsed.beds,
      baths: parsed.baths,
      sqft: parsed.sqft,
      lot_size: parsed.lot_size,
      year_built: parsed.year_built,
      property_type: parsed.property_type,
      status,
      published,
      approval_status: approvalStatus,
      approved_at: approvedAt,
      description,
      metadata: {
        ...existingMetadata,
        listing_builder: true,
        confirmed_at: new Date().toISOString(),
        parsed_listing: parsed,
        highlights,
        missing_data: missingData,
        hero_ai_summary: heroAiSummary,
        provider_data: isRecord(existingMetadata.provider_data) ? existingMetadata.provider_data : {
          schoolRating: "Data not available yet.",
          crimeData: "Data not available yet.",
          floodData: "Data not available yet.",
          appreciationOutlook: "Data not available yet.",
          insuranceRisk: "Data not available yet.",
        },
        seller_notes: parsed.seller_notes,
      },
    })
    .eq("id", listingId);

  if (error) {
    console.error("Hero Listing Builder confirm failed", error);
    return NextResponse.json({ error: "Unable to confirm listing." }, { status: 500 });
  }

  await supabase.from("hero_scores").upsert({
    listing_id: listingId,
    total_score: typeof existingScore?.total_score === "number" ? existingScore.total_score : regenerated.heroScore.total_score,
    letter_grade: existingScore?.letter_grade || regenerated.heroScore.letter_grade,
    explanation: existingScore?.explanation || regenerated.heroScore.explanation,
    buyer_recommendation: heroAiSummary,
    confidence_level: existingScore?.confidence_level || regenerated.heroScore.confidence_level,
    component_scores: {
      ...(isRecord(existingScore?.component_scores) ? existingScore.component_scores : {}),
      ...regenerated.heroScore.component_scores,
      missing_data: missingData,
      confirmed_from: "hero_listing_builder",
    },
  });

  return NextResponse.json({ success: true, listingId, status, published, approvalStatus });
}

function normalizeEditableFields(fields: ConfirmPayload["fields"]): ParsedListingPrompt {
  const rawPrompt = fields?.rawPrompt || "Confirmed Hero Listing";
  const parsedFromPrompt = parseListingPrompt(rawPrompt);

  return {
    rawPrompt,
    address: stringOrNull(fields?.address) ?? parsedFromPrompt.address,
    address_line_1: stringOrNull(fields?.address_line_1) ?? parsedFromPrompt.address_line_1,
    city: stringOrNull(fields?.city) ?? parsedFromPrompt.city,
    state: stringOrNull(fields?.state) ?? parsedFromPrompt.state,
    zip: stringOrNull(fields?.zip) ?? parsedFromPrompt.zip,
    asking_price: numberOrNull(fields?.asking_price) ?? parsedFromPrompt.asking_price,
    beds: numberOrNull(fields?.beds) ?? parsedFromPrompt.beds,
    baths: numberOrNull(fields?.baths) ?? parsedFromPrompt.baths,
    sqft: numberOrNull(fields?.sqft) ?? parsedFromPrompt.sqft,
    lot_size: numberOrNull(fields?.lot_size) ?? parsedFromPrompt.lot_size,
    year_built: numberOrNull(fields?.year_built) ?? parsedFromPrompt.year_built,
    property_type: stringOrNull(fields?.property_type) ?? parsedFromPrompt.property_type,
    features: normalizeStringArray(fields?.features).length ? normalizeStringArray(fields?.features) : parsedFromPrompt.features,
    seller_notes: normalizeStringArray(fields?.seller_notes).length ? normalizeStringArray(fields?.seller_notes) : parsedFromPrompt.seller_notes,
  };
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

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") return value.split("\n").map((item) => item.trim()).filter(Boolean);
  return [];
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
