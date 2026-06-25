import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { calculateHeroScore } from "@/lib/hero-score";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  if (cookieStore.get("askhero_admin")?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await request.json().catch(() => ({ status: "" }));
  if (!["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid approval status." }, { status: 400 });
  }

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .update({ approval_status: status })
    .eq("id", id)
    .select("id,price,sqft,year_built,status,city,property_type")
    .single();

  if (error || !data) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update listing." }, { status: 500 });
  }

  const score = calculateHeroScore(data);
  await supabase.from("hero_scores").upsert(
    {
      listing_id: id,
      ...score,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "listing_id" },
  );

  return NextResponse.json({ success: true });
}
