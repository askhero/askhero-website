import { NextResponse } from "next/server";
import { getFbiCrimeData } from "@/lib/hero/providers/fbiCrimeProvider";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const city = url.searchParams.get("city") || undefined;
  const state = url.searchParams.get("state") || undefined;
  const result = await getFbiCrimeData({ city, state });
  return NextResponse.json(result);
}