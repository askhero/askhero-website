import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroListingCard } from "@/components/hero/HeroListingCard";
import type { RankedHeroListing } from "@/lib/hero/types";

export function HeroSearchResults({ results, hasSearched }: { results: RankedHeroListing[]; hasSearched: boolean }) {
  if (!hasSearched) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.2em] text-gold-200/80">AskHero Search</p>
        <h2 className="mt-3 text-2xl font-bold text-white">Start with a full buyer story.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/54">
          Include income, city, family size, schools, safety, commute, and lifestyle preferences. AskHero will parse intent and rank only real approved listings.
        </p>
      </section>
    );
  }

  if (results.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-gold-300/22 bg-white/[0.04] p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-10">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-400/12 blur-[100px]" />
        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-300/25 bg-gold-400/10 text-gold-200">
          <SearchX className="h-7 w-7" />
        </div>
        <h2 className="relative mt-5 text-2xl font-bold text-white">No approved listings match this Hero Search yet.</h2>
        <p className="relative mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/58">
          AskHero only shows real approved listings. As sellers and agents add inventory, Hero will rank matches based on your budget, fit, risk signals, and available facts.
        </p>
        <div className="relative mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="rounded-xl font-bold">
            <Link href="/#waitlist">Join Buyer Alerts</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl font-bold">
            <Link href="/search">Try Another Search</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl font-bold">
            <Link href="/listings">Browse all listings</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold-200/80">Ranked approved listings</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Hero-ranked matches</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/52">
            Results are sorted by Hero Fit Score first, then Hero Score. AskHero highlights available facts and missing data so you can see why a home may or may not be worth deeper review.
          </p>
        </div>
        <p className="text-sm font-semibold text-white/48">{results.length} approved match{results.length === 1 ? "" : "es"}</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {results.map((result) => (
          <HeroListingCard key={result.listing.id} result={result} />
        ))}
      </div>
    </section>
  );
}