import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const listingIds = Array.isArray(body?.listing_ids) ? body.listing_ids : [];

  if (!body?.user_id || listingIds.length === 0 || listingIds.length > 4) {
    return NextResponse.json(
      { error: "Comparisons require a user and 1 to 4 listings." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("comparison_sets").insert({
    user_id: body.user_id,
    listing_ids: listingIds,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to save comparison." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
