import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminKey = request.headers.get("X-Admin-Key");
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("listings")
    .update({ approval_status: "approved", published: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Unable to approve listing." }, { status: 500 });
  }

  return NextResponse.json({ success: true, id });
}
