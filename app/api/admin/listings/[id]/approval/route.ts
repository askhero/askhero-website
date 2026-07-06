import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  if (cookieStore.get("askhero_admin")?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "";

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }

  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const updates =
    action === "approve"
      ? { approval_status: "approved", status: "active", published: true, approved_at: new Date().toISOString() }
      : { approval_status: "rejected", status: "draft", published: false };

  const { error } = await supabase.from("listings").update(updates).eq("id", id);
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update listing." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
