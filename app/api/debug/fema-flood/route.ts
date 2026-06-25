import { NextResponse } from "next/server";
import { getFemaFloodData } from "@/lib/hero/providers/femaFloodProvider";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const latitude = numberOrNull(searchParams.get("lat"));
  const longitude = numberOrNull(searchParams.get("lng"));

  if (!address && (latitude === null || longitude === null)) {
    return NextResponse.json({ error: "Provide address= or lat= and lng=." }, { status: 400 });
  }

  const data = await getFemaFloodData({
    address,
    latitude,
    longitude,
  });

  return NextResponse.json(data);
}

function numberOrNull(value: string | null) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
