import { NextResponse } from "next/server";
import { calculateHeroScore } from "@/lib/hero-score";
import { getClientKey, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!rateLimit(getClientKey(request, "import-submit"), 5, 60_000).allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again soon." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  if (!raw) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // Honeypot
  if ((raw as Record<string, unknown>).company) return NextResponse.json({ success: true });

  const {
    address_line_1,
    city,
    state,
    zip,
    price,
    beds,
    baths,
    sqft,
    year_built,
    lot_size,
    property_type,
    description,
    listing_agent_name,
    listing_agent_phone,
    listing_agent_email,
    brokerage_name,
    hoa_fee,
    import_source_url,
    imported_image_urls,
    certification_accepted,
    certification_timestamp,
  } = raw as Record<string, unknown>;

  if (!address_line_1 || typeof address_line_1 !== "string") {
    return NextResponse.json({ error: "Address line 1 is required." }, { status: 400 });
  }
  if (!city || typeof city !== "string") {
    return NextResponse.json({ error: "City is required." }, { status: 400 });
  }
  if (!state || typeof state !== "string") {
    return NextResponse.json({ error: "State is required." }, { status: 400 });
  }
  if (!price || Number(price) <= 0) {
    return NextResponse.json({ error: "A valid price is required." }, { status: 400 });
  }
  if (!beds || Number(beds) <= 0) {
    return NextResponse.json({ error: "Number of beds is required." }, { status: 400 });
  }
  if (!baths || Number(baths) <= 0) {
    return NextResponse.json({ error: "Number of baths is required." }, { status: 400 });
  }
  if (!certification_accepted) {
    return NextResponse.json({ error: "You must certify the listing before submitting." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const insertPayload: Record<string, unknown> = {
    address_line_1,
    city,
    state,
    zip: zip ?? null,
    price: Number(price),
    beds: Number(beds),
    baths: Number(baths),
    sqft: sqft ? Number(sqft) : null,
    year_built: year_built ? Number(year_built) : null,
    lot_size: lot_size ? Number(lot_size) : null,
    property_type: property_type ?? null,
    description: description ?? null,
    listing_agent_name: listing_agent_name ?? null,
    listing_agent_email: listing_agent_email ?? null,
    listing_agent_phone: listing_agent_phone ?? null,
    brokerage_name: brokerage_name ?? null,
    hoa_fee: hoa_fee ? Number(hoa_fee) : null,
    source_type: "imported",
    approval_status: "pending",
    status: "draft",
    published: false,
    import_source_url: import_source_url ?? null,
    imported_image_urls: Array.isArray(imported_image_urls) ? imported_image_urls : [],
    certification_accepted: true,
    certification_timestamp: certification_timestamp ?? new Date().toISOString(),
  };

  let { data, error } = await supabase
    .from("listings")
    .insert(insertPayload)
    .select("id,price,sqft,year_built,status,city,property_type")
    .single();

  // PGRST204 = column not found (migration pending). Retry without the new columns
  // so the listing still saves even if the schema hasn't been updated yet.
  if (error?.code === "PGRST204") {
    console.warn("import-submit: new columns missing, retrying without import columns:", error.message);
    const { certification_accepted: _ca, certification_timestamp: _ct, import_source_url: _is, imported_image_urls: _ii, ...corePayload } = insertPayload;
    ({ data, error } = await supabase
      .from("listings")
      .insert(corePayload)
      .select("id,price,sqft,year_built,status,city,property_type")
      .single());
  }

  if (error || !data) {
    console.error("import-submit insert failed", error);
    return NextResponse.json({ error: "Unable to save listing. Please try again." }, { status: 500 });
  }

  const score = calculateHeroScore(data);
  await supabase.from("hero_scores").insert({
    listing_id: data.id,
    ...score,
  });

  return NextResponse.json({ success: true, listing_id: data.id });
}
