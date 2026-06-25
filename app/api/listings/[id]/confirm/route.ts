import { NextResponse } from "next/server";
import { POST as confirmBuilderListing } from "@/app/api/listings/builder/confirm/route";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  return confirmBuilderListing(
    new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, listingId: id }),
    }),
  ).catch((error) => {
    console.error("Listing confirm failed", error);
    return NextResponse.json({ error: "Unable to confirm listing." }, { status: 500 });
  });
}