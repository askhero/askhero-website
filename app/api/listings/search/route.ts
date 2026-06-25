import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("listings")
    .select("*, hero_scores(total_score,letter_grade,component_scores)")
    .eq("approval_status", "approved")
    .limit(50);

  const city = searchParams.get("city");
  if (city) query = query.ilike("city", city);

  const minPrice = Number(searchParams.get("minPrice"));
  const maxPrice = Number(searchParams.get("maxPrice"));
  if (Number.isFinite(minPrice) && minPrice > 0) query = query.gte("price", minPrice);
  if (Number.isFinite(maxPrice) && maxPrice > 0) query = query.lte("price", maxPrice);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to search listings." }, { status: 500 });
  }

  return NextResponse.json({ listings: data || [] });
}
