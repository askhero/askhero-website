import { Brain, LockKeyhole, MapPin, Search } from "lucide-react";
import { Suspense } from "react";
import { createPageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/site-shell";
import { HeroBuyerProfileCard } from "@/components/hero/HeroBuyerProfileCard";
import { HeroSafeBudgetCard } from "@/components/hero/HeroSafeBudgetCard";
import { HeroSearchBox } from "@/components/hero/HeroSearchBox";
import { HeroSearchResults } from "@/components/hero/HeroSearchResults";
import { HeroLocationButton } from "@/components/hero/HeroLocationButton";
import { calculateHeroFitScore, listingMatchesBuyerProfile } from "@/lib/hero/calculateHeroFitScore";
import { calculateHeroSafeBudget } from "@/lib/hero/calculateHeroSafeBudget";
import { calculateHeroScore } from "@/lib/hero/calculateHeroScore";
import { generateHeroAISummary } from "@/lib/hero/generateHeroAISummary";
import { parseBuyerSearch } from "@/lib/hero/parseBuyerSearch";
import { calculateDistance } from "@/lib/utils/distance";
import type { BuyerProfile, HeroListing, RankedHeroListing } from "@/lib/hero/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const CHARLOTTE = { lat: 35.2271, lng: -80.8431 };
const LOCATION_RADIUS_MILES = 25;
const CHARLOTTE_WARNING_MILES = 60;

export const metadata = createPageMetadata({
  path: "/search",
  title: "Find Homes Worth Buying | AskHero",
  description: "AskHero analyzes budget, schools, crime, neighborhood quality, commute, and long-term potential across approved listings.",
});
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SearchPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = await searchParams;
  const query = normalizeParam(params?.q);
  const hasSearched = query.length > 0;
  const profile = parseBuyerSearch(query);
  const safeBudget = calculateHeroSafeBudget(profile);

  const userLat = toFiniteNumber(normalizeParam(params?.lat));
  const userLng = toFiniteNumber(normalizeParam(params?.lng));
  const hasLocation = userLat !== null && userLng !== null;

  const outsideCharlotte =
    hasLocation &&
    calculateDistance(userLat!, userLng!, CHARLOTTE.lat, CHARLOTTE.lng) > CHARLOTTE_WARNING_MILES;

  const listings = hasSearched
    ? await fetchApprovedListings(profile.city, userLat, userLng)
    : [];
  const results = hasSearched ? rankListings(listings, profile) : [];

  if (hasSearched) {
    await persistHeroSearch(query, profile, safeBudget, results.length);
  }

  return (
    <PageShell>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-16 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-[150px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,#050505_0%,#030303_60%,#050505_100%)]" />

        <section className="relative mx-auto flex min-h-[720px] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/8 px-4 py-2 text-sm font-semibold text-[#f2cf68]">
            <Brain className="h-4 w-4" />
            AI buyer intent search for real approved listings
          </div>
          <h1 className="mt-8 max-w-5xl text-5xl font-extrabold leading-[0.96] tracking-normal text-white sm:text-6xl lg:text-7xl">
            Find the homes actually worth buying.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/62 sm:text-xl">
            AskHero analyzes budget, schools, crime, neighborhood quality, commute, and long-term potential so buyers can make smarter decisions before making an offer.
          </p>
          <div className="mt-10 w-full">
            <HeroSearchBox defaultQuery={query} />
          </div>
          <div className="mt-5">
            <Suspense>
              <HeroLocationButton />
            </Suspense>
          </div>
          {outsideCharlotte && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/8 px-5 py-2 text-sm text-amber-300">
              <MapPin className="h-4 w-4 shrink-0" />
              AskHero specializes in Charlotte area homes. Showing results near Charlotte.
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-white/42">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2">
              <LockKeyhole className="h-3.5 w-3.5 text-[#D4AF37]" />
              No demo listings
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2">
              <Search className="h-3.5 w-3.5 text-[#D4AF37]" />
              Approved inventory only
            </span>
          </div>
        </section>
      </div>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:px-6 lg:px-8">
        {hasSearched && (
          <>
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <HeroBuyerProfileCard profile={profile} />
              <HeroSafeBudgetCard budget={safeBudget} />
            </div>
            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.18em] text-gold-200/80">Ranking Explanation</p>
              <h2 className="mt-2 text-xl font-bold text-white">How Hero ranked this search</h2>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/58">
                AskHero parses your buyer profile, estimates a planning budget when income is provided, filters only approved listings, then ranks matches by buyer fit, available property facts, risk signals, and missing data.
              </p>
            </section>
          </>
        )}
        <HeroSearchResults results={results} hasSearched={hasSearched} hasLocation={hasLocation} />
      </section>
    </PageShell>
  );
}

async function fetchApprovedListings(
  city: string | null,
  userLat: number | null,
  userLng: number | null,
) {
  try {
    const supabase = createSupabaseAdminClient();
    const hasLocation = userLat !== null && userLng !== null;

    let query = supabase
      .from("listings")
      .select(
        "id,address_line_1,address_line_2,city,state,zip,price,beds,baths,sqft,lot_size,year_built,property_type,status,description,listing_agent_name,listing_agent_email,listing_agent_phone,brokerage_name,latitude,longitude,hero_scores(total_score,letter_grade,explanation,buyer_recommendation,component_scores)",
      )
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false })
      .limit(hasLocation ? 200 : 50);

    // Skip city filter when doing proximity search
    if (!hasLocation && city) {
      query = query.ilike("city", city);
    }

    const { data, error } = await query;
    if (error) {
      console.error("AskHero search listings error", error);
      return [];
    }

    let listings = (data ?? []) as HeroListing[];

    if (hasLocation) {
      listings = listings
        .map((l) => ({
          ...l,
          distance:
            typeof l.latitude === "number" && typeof l.longitude === "number"
              ? calculateDistance(userLat!, userLng!, l.latitude, l.longitude)
              : undefined,
        }))
        .filter((l) => l.distance === undefined || l.distance <= LOCATION_RADIUS_MILES)
        .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
    }

    return listings;
  } catch (error) {
    console.error("AskHero search unavailable", error);
    return [];
  }
}

function rankListings(listings: HeroListing[], profile: BuyerProfile): RankedHeroListing[] {
  const hasDistanceData = listings.some((l) => l.distance !== undefined);
  return listings
    .filter((listing) => listingMatchesBuyerProfile(listing, profile))
    .map((listing) => {
      const heroScore = calculateHeroScore(listing);
      const fitScore = calculateHeroFitScore(listing, profile);
      const summary = generateHeroAISummary(listing, profile, { heroScore, fitScore });
      return { listing, heroScore, fitScore, summary, distance: listing.distance };
    })
    .sort((left, right) => {
      if (hasDistanceData) {
        return (left.distance ?? 9999) - (right.distance ?? 9999) || right.fitScore.score - left.fitScore.score;
      }
      return right.fitScore.score - left.fitScore.score || right.heroScore.score - left.heroScore.score;
    });
}

async function persistHeroSearch(
  query: string,
  profile: BuyerProfile,
  safeBudget: ReturnType<typeof calculateHeroSafeBudget>,
  resultCount: number,
) {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("hero_searches").insert({
      query,
      parsed_profile: profile,
      estimated_safe_budget: safeBudget?.estimatedPurchasePrice ?? null,
      result_count: resultCount,
    });

    if (error) {
      console.warn("hero_searches insert skipped", error.message);
    }
  } catch (error) {
    console.warn("hero_searches insert unavailable", error);
  }
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

function toFiniteNumber(value: string): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}