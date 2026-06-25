import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.user_id || !body?.listing_id) {
    return NextResponse.json({ error: "Missing user_id or listing_id." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("saved_homes").upsert({
    user_id: body.user_id,
    listing_id: body.listing_id,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to save home." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
