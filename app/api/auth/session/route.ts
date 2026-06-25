import { NextResponse } from "next/server";
import { setAskHeroSession, type AskHeroRole } from "@/lib/auth/session";

const allowedRoles = new Set<AskHeroRole>(["buyer", "seller", "realtor", "agent", "admin"]);

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    email?: string;
    role?: string;
    fullName?: string;
  } | null;

  const email = payload?.email?.trim().toLowerCase();
  const role = normalizeRole(payload?.role);

  if (!email || !role) {
    return NextResponse.json({ error: "Unable to create session." }, { status: 400 });
  }

  await setAskHeroSession({
    email,
    role,
    fullName: payload?.fullName?.trim() || null,
  });

  return NextResponse.json({ success: true });
}

function normalizeRole(role: string | undefined): AskHeroRole | null {
  const value = role === "agent" ? "realtor" : role;
  if (!value || !allowedRoles.has(value as AskHeroRole)) return null;
  return value as AskHeroRole;
}
