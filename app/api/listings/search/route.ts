import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculateDistance } from "@/lib/utils/distance";

const DEFAULT_RADIUS_MILES = 25;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = createSupabaseAdminClient();

  const lat = toFiniteNumber(searchParams.get("lat"));
  const lng = toFiniteNumber(searchParams.get("lng"));
  const radius = toFiniteNumber(searchParams.get("radius")) ?? DEFAULT_RADIUS_MILES;
  const hasLocation = lat !== null && lng !== null;

  let query = supabase
    .from("listings")
    .select("*, hero_scores(total_score,letter_grade,component_scores)")
    .eq("approval_status", "approved")
    .eq("status", "active")
    .limit(hasLocation ? 200 : 50); // fetch more when filtering by distance

  // Skip city filter when doing proximity search — distance does the narrowing
  if (!hasLocation) {
    const city = searchParams.get("city");
    if (city) query = query.ilike("city", city);
  }

  const minPrice = toFiniteNumber(searchParams.get("minPrice"));
  const maxPrice = toFiniteNumber(searchParams.get("maxPrice"));
  if (minPrice && minPrice > 0) query = query.gte("price", minPrice);
  if (maxPrice && maxPrice > 0) query = query.lte("price", maxPrice);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to search listings." }, { status: 500 });
  }

  if (!hasLocation) {
    return NextResponse.json({ listings: data ?? [] });
  }

  // Distance-filter and sort server-side
  type ListingRow = (typeof data)[number] & { latitude?: number | null; longitude?: number | null; distance?: number };
  const withDistance: ListingRow[] = (data ?? [])
    .map((listing) => {
      const listingLat = (listing as ListingRow).latitude;
      const listingLng = (listing as ListingRow).longitude;
      const distance =
        typeof listingLat === "number" && typeof listingLng === "number"
          ? calculateDistance(lat, lng, listingLat, listingLng)
          : undefined;
      return { ...listing, distance } as ListingRow;
    })
    .filter((l) => l.distance === undefined || l.distance <= radius)
    .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));

  return NextResponse.json({ listings: withDistance });
}

function toFiniteNumber(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
