"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroIntentIndicators } from "@/components/hero/HeroIntentIndicators";
import { HeroSearchLoading } from "@/components/hero/HeroSearchLoading";

const samples = [
  "Family of 4, $200k income, Charlotte NC, school priority, safety signals, groceries nearby",
  "Raleigh home under my safe budget with risk data and room for two kids",
  "Atlanta investment search with value opportunity and available facts",
];

export function HeroSearchBox({ defaultQuery }: { defaultQuery?: string }) {
  const [query, setQuery] = useState(defaultQuery ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!query.trim()) {
      event.preventDefault();
      return;
    }

    setIsSubmitting(true);
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <form
        action="/search"
        onSubmit={handleSubmit}
        className="group rounded-[2rem] border border-white/12 bg-white/[0.055] p-2 shadow-[0_30px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition focus-within:border-gold-300/65 focus-within:shadow-[0_0_0_1px_rgba(217,180,92,0.35),0_0_90px_rgba(217,180,92,0.16)]"
      >
        {lat && <input type="hidden" name="lat" value={lat} />}
        {lng && <input type="hidden" name="lng" value={lng} />}
        <div className="rounded-[1.55rem] border border-white/8 bg-[#070a10]/90 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold-400 text-[#030303] shadow-[0_0_40px_rgba(217,180,92,0.24)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <textarea
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              rows={5}
              className="min-h-40 flex-1 resize-none rounded-2xl border border-gold-400/30 bg-navy-900/80 px-4 py-3 text-base leading-7 text-white outline-none placeholder:text-white/40 focus:border-gold-400/70 sm:text-lg"
              placeholder="Tell Hero what you're looking for... family size, income, city, schools, safety, commute, budget, lifestyle"
            />
          </div>

          <div className="mt-4 border-t border-white/8 pt-4">
            <HeroIntentIndicators query={query} />
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/48">Ask in plain English. Hero ranks approved homes against your real buyer intent.</p>
            <Button className="h-12 rounded-2xl px-6 font-bold" disabled={isSubmitting}>
              {isSubmitting ? "Asking Hero..." : "Ask Hero"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>

      <HeroSearchLoading active={isSubmitting} />

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {samples.map((sample) => (
          <Link
            key={sample}
            href={`/search?q=${encodeURIComponent(sample)}`}
            className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-medium text-white/62 transition hover:border-gold-300/45 hover:text-white"
          >
            {sample}
          </Link>
        ))}
      </div>
    </div>
  );
}