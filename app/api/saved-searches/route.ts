import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.user_id || !body?.name || !body?.filters) {
    return NextResponse.json({ error: "Missing saved search fields." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("saved_searches").insert({
    user_id: body.user_id,
    name: body.name,
    filters: body.filters,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to save search." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
