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

  const { status } = await request.json().catch(() => ({ status: "" }));
  if (!["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid approval status." }, { status: 400 });
  }

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("realtor_profiles")
    .update({ approval_status: status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update realtor." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
