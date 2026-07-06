import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Mail, MapPin, Navigation, ShieldQuestion, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroFloodBadge } from "@/components/hero/HeroFloodSignal";
import { HeroScoreBadge } from "@/components/hero/HeroScoreBadge";
import type { HeroFloodSignal as HeroFloodSignalValue } from "@/lib/hero/providers/types";
import type { RankedHeroListing } from "@/lib/hero/types";

export function HeroListingCard({ result }: { result: RankedHeroListing }) {
  const { listing, heroScore, fitScore, summary, distance } = result;
  const address = [listing.address_line_1, listing.city, listing.state].filter(Boolean).join(", ") || [listing.city, listing.state].filter(Boolean).join(", ") || "Approved listing";
  const contactHref = listing.listing_agent_email
    ? `mailto:${listing.listing_agent_email}?subject=${encodeURIComponent("AskHero buyer inquiry")}`
    : "/contact";
  const missingData = unique([...fitScore.missingData, ...heroScore.missingData]);
  const floodSignal = getFloodSignal(listing.hero_scores?.[0]?.component_scores);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl transition hover:border-gold-300/35">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="flex items-center gap-1.5 text-sm text-white/48">
              <MapPin className="h-4 w-4 text-gold-300" />
              {listing.status || "approved"}
            </p>
            {distance !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/8 px-2.5 py-0.5 text-xs font-semibold text-[#c9a84c]">
                <Navigation className="h-3 w-3" />
                {distance < 1 ? `${(distance * 5280).toFixed(0)} ft` : `${distance.toFixed(1)} mi`} away
              </span>
            )}
          </div>
          <h3 className="mt-2 text-xl font-bold leading-tight text-white">{address}</h3>
          <p className="mt-2 text-2xl font-extrabold text-gold-200">{formatMoney(listing.price)}</p>
        </div>
        <HeroScoreBadge score={heroScore.score} label="Score" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
        <Stat label="Beds" value={formatNumber(listing.beds)} />
        <Stat label="Baths" value={formatNumber(listing.baths)} />
        <Stat label="Sqft" value={formatNumber(listing.sqft)} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Score label="Hero Score" value={`${heroScore.score}/100`} sub={heroScore.usedExistingScore ? "Stored approved score" : "Based on available listing facts"} />
        <Score label="Hero Fit Score" value={`${fitScore.score}/100`} sub="Match to your buyer profile" />
      </div>

      <div className="mt-5 rounded-2xl border border-white/8 bg-[#070a10]/72 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/38">Hero AI Summary</p>
        <p className="mt-2 text-sm leading-6 text-white/68">{summary}</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <ListBlock title="Why Hero likes it" items={fitScore.reasons.length ? fitScore.reasons : ["Approved listing available for review."]} />
        <ListBlock title="Risks / missing data" items={missingData.length ? missingData : ["No additional missing data flagged from available listing fields."]} icon={<AlertTriangle className="h-4 w-4" />} muted />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Insight label="Hero 5-Year Outlook" value="Not available yet" detail="Requires real market data." icon={<TrendingUp className="h-4 w-4" />} />
        <Insight label="School rating" value="Not available yet" detail="Verified data not connected." icon={<ShieldQuestion className="h-4 w-4" />} />
        <Insight label="Crime data" value="Not available yet" detail="Verified data not connected." icon={<ShieldQuestion className="h-4 w-4" />} />
      </div>
      <div className="mt-3">
        <HeroFloodBadge flood={floodSignal ? { unavailable: false, heroFloodSignal: floodSignal } : { unavailable: true }} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="rounded-xl font-bold">
          <Link href={`/listings/${listing.id}`}>
            View Hero Analysis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl font-bold">
          <Link href={contactHref}>
            <Mail className="h-4 w-4" />
            Contact Agent
          </Link>
        </Button>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#070a10]/60 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function Score({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-gold-200">{value}</p>
      <p className="mt-1 text-xs text-white/42">{sub}</p>
    </div>
  );
}

function ListBlock({ title, items, icon, muted }: { title: string; items: string[]; icon?: ReactNode; muted?: boolean }) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#070a10]/55 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/38">
        {icon}
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-5 text-white/64">
        {items.slice(0, 5).map((item) => (
          <li key={item} className={muted ? "text-white/46" : "text-white/68"}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Insight({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#070a10]/55 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/38">
        {icon}
        {label}
      </p>
      <p className="mt-2 font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-white/42">{detail}</p>
    </div>
  );
}

function formatMoney(value: number | null) {
  if (typeof value !== "number") return "Price unavailable";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number | null) {
  if (typeof value !== "number") return "--";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function getFloodSignal(componentScores?: Record<string, unknown> | null) {
  const flood = componentScores?.flood_signal;
  if (typeof flood !== "object" || flood === null || Array.isArray(flood)) return null;
  const floodRecord = flood as Record<string, unknown>;
  const explanation = typeof floodRecord.explanation === "string" ? floodRecord.explanation : "";
  const match = explanation.match(/\b(Minimal|Moderate|Elevated|High|Unknown)\b/);
  return (match?.[1] as HeroFloodSignalValue | undefined) ?? null;
}
