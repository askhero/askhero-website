import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export type AskHeroRole = "buyer" | "seller" | "realtor" | "agent" | "admin";

export type AskHeroSession = {
  email: string;
  role: AskHeroRole;
  fullName?: string | null;
  createdAt: number;
};

const cookieName = "askhero_session";

export async function getAskHeroSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(cookieName)?.value;
  return verifySessionCookie(value);
}

export async function setAskHeroSession(session: Omit<AskHeroSession, "createdAt">) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, signSessionCookie({ ...session, createdAt: Date.now() }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAskHeroSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export function canCreateListing(role: AskHeroRole | undefined) {
  return role === "seller" || role === "realtor" || role === "agent" || role === "admin";
}

function signSessionCookie(session: AskHeroSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = hmac(payload);
  return `${payload}.${signature}`;
}

function verifySessionCookie(value: string | undefined): AskHeroSession | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = hmac(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AskHeroSession;
    if (!session.email || !session.role) return null;
    return session;
  } catch {
    return null;
  }
}

function hmac(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function sessionSecret() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ADMIN_PASSWORD || "askhero-dev-session";
}
