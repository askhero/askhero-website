import { NextResponse } from "next/server";
import { clearAskHeroSession } from "@/lib/auth/session";

export async function POST() {
  await clearAskHeroSession();
  return NextResponse.json({ success: true });
}
