import { NextResponse } from "next/server";
import { calculateHeroScore } from "@/lib/hero-score";
import { getClientKey, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cleanOptional, listingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!rateLimit(getClientKey(request, "manual-listing"), 5, 60_000).allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again soon." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  if (raw?.company) {
    return NextResponse.json({ success: true });
  }

  const payload = listingSchema.safeParse(raw);
  if (!payload.success) {
    return NextResponse.json({ error: "Please check the listing form." }, { status: 400 });
  }

  const listing = payload.data;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .insert({
      ...listing,
      address_line_2: cleanOptional(listing.address_line_2),
      property_type: cleanOptional(listing.property_type),
      description: cleanOptional(listing.description),
      listing_agent_name: cleanOptional(listing.listing_agent_name),
      listing_agent_email: cleanOptional(listing.listing_agent_email),
      listing_agent_phone: cleanOptional(listing.listing_agent_phone),
      brokerage_name: cleanOptional(listing.brokerage_name),
      source_type: "manual",
      approval_status: "pending",
    })
    .select("id,price,sqft,year_built,status,city,property_type")
    .single();

  if (error || !data) {
    console.error(error);
    return NextResponse.json({ error: "Unable to submit listing." }, { status: 500 });
  }

  const score = calculateHeroScore(data);
  await supabase.from("hero_scores").insert({
    listing_id: data.id,
    ...score,
  });

  return NextResponse.json({ success: true, listing_id: data.id });
}
