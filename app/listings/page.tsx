import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/listings",
  title: "Browse Homes | AskHero",
  description: "Browse all approved listings on AskHero. Every home includes a Hero Score with market value, neighborhood quality, school, risk, and growth analysis.",
});

export const dynamic = "force-dynamic";

type Listing = {
  id: string;
  address_line_1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  property_type: string | null;
  listing_photos: Array<{ storage_path: string; sort_order: number | null }>;
  hero_scores: Array<{ total_score: number | null; letter_grade: string | null }>;
};

async function fetchListings(): Promise<Listing[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("listings")
      .select("id,address_line_1,city,state,zip,price,beds,baths,sqft,property_type,listing_photos(storage_path,sort_order),hero_scores(total_score,letter_grade)")
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) return [];
    return (data ?? []) as Listing[];
  } catch {
    return [];
  }
}

function getCoverUrl(photos: Listing["listing_photos"]): string | null {
  const sorted = [...photos].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  const first = sorted[0];
  if (!first) return null;
  return first.storage_path.startsWith("https://") ? first.storage_path : null;
}

function formatMoney(value: number | null) {
  if (!value) return "--";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default async function ListingsPage() {
  const listings = await fetchListings();

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c]">AskHero</p>
        <h1 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">Browse homes</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/60">
          Every listing below is approved and scored by AskHero. Hero Score analyzes value, neighborhood, schools, risk, and growth potential.
        </p>
        <p className="mt-2 text-sm text-white/40">{listings.length} approved listing{listings.length === 1 ? "" : "s"}</p>
      </section>

      {listings.length === 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <Home className="mx-auto h-10 w-10 text-[#c9a84c]/50" />
            <h2 className="mt-4 text-xl font-bold text-white">No approved listings yet</h2>
            <p className="mt-2 text-sm text-white/50">Check back soon as Hero agents and sellers add inventory.</p>
            <Button asChild className="mt-6 rounded-xl">
              <Link href="/search">Try a Hero Search</Link>
            </Button>
          </div>
        </section>
      ) : (
        <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-20 pt-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
          {listings.map((listing) => {
            const coverUrl = getCoverUrl(listing.listing_photos);
            const score = listing.hero_scores?.[0] ?? null;
            const address = [listing.address_line_1, listing.city, listing.state].filter(Boolean).join(", ") || "Approved listing";

            return (
              <article key={listing.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111] transition hover:border-[#c9a84c]/30">
                {/* Photo */}
                <Link href={`/listings/${listing.id}`} className="block overflow-hidden">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverUrl}
                      alt={address}
                      className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-[#0d0d0d] text-white/20">
                      <Home className="h-10 w-10" />
                    </div>
                  )}
                </Link>

                <div className="p-4">
                  {/* Score badge */}
                  {score?.total_score != null && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/8 px-2.5 py-0.5 text-xs font-bold text-[#c9a84c]">
                        Hero Score {score.total_score}
                        {score.letter_grade ? ` · ${score.letter_grade}` : ""}
                      </span>
                    </div>
                  )}

                  <p className="text-xl font-extrabold text-[#c9a84c]">{formatMoney(listing.price)}</p>
                  <h2 className="mt-0.5 text-sm font-semibold leading-snug text-white">{address}</h2>

                  <div className="mt-3 flex gap-4 text-xs text-white/50">
                    {listing.beds != null && <span>{listing.beds} bd</span>}
                    {listing.baths != null && <span>{listing.baths} ba</span>}
                    {listing.sqft != null && <span>{Number(listing.sqft).toLocaleString()} sqft</span>}
                  </div>

                  <Button asChild size="sm" className="mt-4 w-full rounded-xl bg-[#c9a84c] font-bold text-black hover:bg-[#b8973b]">
                    <Link href={`/listings/${listing.id}`}>
                      View Listing
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </PageShell>
  );
}
