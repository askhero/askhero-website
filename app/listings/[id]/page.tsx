import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Home, Calendar, Maximize2, BedDouble, Bath, Phone, Mail, ArrowRight } from "lucide-react";
import { HeroFloodSignal } from "@/components/hero/HeroFloodSignal";
import { HeroFiveYearOutlook, HeroMissingData, HeroNearbyAmenities, HeroNearbyRoads, HeroNearbySchools } from "@/components/hero/HeroNearbySections";
import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import type { HeroFloodData, MarketOutlookData, NearbyAmenity, SchoolData } from "@/lib/hero/providers/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("*, listing_photos(*), hero_scores(*)")
    .eq("id", id)
    .eq("approval_status", "approved")
    .single();

  if (!listing) notFound();

  const score = Array.isArray(listing.hero_scores) ? listing.hero_scores[0] : null;
  const { data: enrichment } = await supabase
    .from("listing_enrichment")
    .select("*")
    .eq("listing_id", id)
    .maybeSingle();

  const schools = normalizeArray<SchoolData>(enrichment?.nearby_schools);
  const grocery = normalizeArray<NearbyAmenity>(enrichment?.nearby_grocery);
  const shopping = normalizeArray<NearbyAmenity>(enrichment?.nearby_shopping);
  const hospitals = normalizeArray<NearbyAmenity>(enrichment?.nearby_hospitals);
  const roads = normalizeArray<NearbyAmenity>(enrichment?.nearby_roads);
  const highways = normalizeArray<NearbyAmenity>(enrichment?.nearby_highways);
  const missingData = normalizeStringArray(enrichment?.unavailable_data);
  const outlook = normalizeOutlook(enrichment?.appreciation_projection);
  const floodData = normalizeFloodData(enrichment?.flood_data);
  const crimeData = normalizeCrimeData(enrichment?.crime_data);

  const photos = sortPhotos(listing.listing_photos ?? []).map((photo: { storage_path: string; alt_text?: string | null; sort_order?: number | null }) => ({
    ...photo,
    publicUrl: photo.storage_path.startsWith("https://")
      ? photo.storage_path
      : supabase.storage.from("listing-photos").getPublicUrl(photo.storage_path).data.publicUrl,
  }));

  const totalScore = score?.total_score ?? null;
  const components = deriveComponents(totalScore);
  const signals = deriveSignals(listing, crimeData, floodData, schools, outlook);
  const monthlyPayment = listing.price ? Math.round(listing.price * 0.006) : null;
  const pricePerSqft = listing.price && listing.sqft ? Math.round(listing.price / listing.sqft) : null;
  const hasAgent = Boolean(listing.listing_agent_name || listing.listing_agent_email);
  const highlights: string[] = normalizeStringArray(listing.metadata?.highlights);

  return (
    <PageShell>
      <PhotoGallery photos={photos} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* LEFT COLUMN */}
          <div className="min-w-0 space-y-6">
            <div>
              <p className="text-3xl font-extrabold text-[#c9a84c]">{formatMoney(listing.price)}</p>
              <h1 className="mt-1 text-2xl font-bold text-white">{listing.address_line_1}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-white/60">
                <MapPin className="h-4 w-4 text-[#c9a84c]" />
                {listing.city}, {listing.state} {listing.zip}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {listing.beds != null && <SpecPill icon={<BedDouble className="h-4 w-4" />} label="Beds" value={listing.beds} />}
                {listing.baths != null && <SpecPill icon={<Bath className="h-4 w-4" />} label="Baths" value={listing.baths} />}
                {listing.sqft != null && <SpecPill icon={<Maximize2 className="h-4 w-4" />} label="Sqft" value={Number(listing.sqft).toLocaleString()} />}
                {listing.year_built != null && <SpecPill icon={<Calendar className="h-4 w-4" />} label="Built" value={listing.year_built} />}
              </div>
            </div>

            {/* Hero Score card */}
            <div className="rounded-2xl border border-[#c9a84c]/25 bg-[#c9a84c]/6 p-6" id="hero-score-section">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c]">Hero Score™</p>
              <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <ScoreCircle score={totalScore} />
                  {score?.letter_grade && (
                    <span className="rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-3 py-0.5 text-sm font-bold text-[#c9a84c]">
                      Grade {score.letter_grade}
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  {components.map((c) => (
                    <ComponentBar key={c.label} {...c} />
                  ))}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {signals.map((s) => (
                  <SignalPill key={s.label} {...s} />
                ))}
              </div>
              {score?.buyer_recommendation && (
                <p className="mt-4 text-sm leading-6 text-white/68">{score.buyer_recommendation}</p>
              )}
            </div>

            {/* Property highlights */}
            {highlights.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-lg font-bold text-white">Property Highlights</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {highlights.map((h) => (
                    <div key={h} className="flex items-start gap-2 rounded-xl border border-white/8 bg-[#111] p-3 text-sm text-white/70">
                      <Home className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a84c]" />
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {listing.description && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-lg font-bold text-white">About this home</h2>
                <p className="mt-3 leading-7 text-white/66">{listing.description}</p>
              </div>
            )}

            <div className="space-y-4">
              <HeroNearbySchools schools={schools} />
              <HeroNearbyAmenities grocery={grocery} shopping={shopping} hospitals={hospitals} />
              <HeroNearbyRoads roads={roads} highways={highways} />
              <HeroFloodSignal flood={floodData} />
              <HeroFiveYearOutlook outlook={outlook} />
              <HeroMissingData items={missingData} />
            </div>

            <p className="text-xs leading-5 text-white/38">
              Hero Score is informational only and does not represent financial, legal, tax, mortgage, insurance, or real estate advice.
            </p>
          </div>

          {/* RIGHT COLUMN (sticky) */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {hasAgent ? (
              <AgentContactCard
                name={listing.listing_agent_name}
                email={listing.listing_agent_email}
                phone={listing.listing_agent_phone}
                brokerage={listing.brokerage_name}
                pricePerSqft={pricePerSqft}
              />
            ) : (
              <FSBOCard price={listing.price} />
            )}

            {monthlyPayment && (
              <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/44">Hero Safe Budget est.</p>
                <p className="mt-2 text-2xl font-extrabold text-white">
                  ~{formatMoney(monthlyPayment)}
                  <span className="text-sm font-normal text-white/44">/mo</span>
                </p>
                <p className="mt-1 text-xs text-white/40">Rough estimate. Consult a lender for actual payment.</p>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/44">Quick facts</p>
              <dl className="mt-3 space-y-2 text-sm">
                {pricePerSqft && <QuickFact label="Price / sqft" value={`$${pricePerSqft}`} />}
                {listing.property_type && <QuickFact label="Type" value={listing.property_type} />}
                {listing.lot_size && <QuickFact label="Lot size" value={`${Number(listing.lot_size).toLocaleString()} sqft`} />}
              </dl>
            </div>

            <Button asChild variant="outline" className="w-full rounded-xl" size="sm">
              <Link href="/listings">
                Browse all listings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

// ── Sub-components ──

type PhotoRow = { storage_path: string; publicUrl: string; alt_text?: string | null; sort_order?: number | null };

function PhotoGallery({ photos }: { photos: PhotoRow[] }) {
  if (!photos.length) {
    return (
      <div className="flex h-64 w-full items-center justify-center border-b border-white/8 bg-[#0d0d0d] text-sm text-white/30">
        No photos available yet
      </div>
    );
  }
  const [cover, ...rest] = photos;
  return (
    <div className="w-full bg-[#090909]">
      <div className="mx-auto grid max-w-7xl gap-2 px-4 py-4 sm:px-6 lg:px-8" style={{ gridTemplateColumns: rest.length ? "2fr 1fr" : "1fr" }}>
        <figure className="relative overflow-hidden rounded-xl" style={{ gridRow: "span 2" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover.publicUrl} alt={cover.alt_text ?? "Listing photo"} className="h-full max-h-[480px] w-full object-cover" />
        </figure>
        {rest.slice(0, 4).map((photo) => (
          <figure key={photo.storage_path} className="relative overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.publicUrl} alt={photo.alt_text ?? "Listing photo"} className="aspect-[4/3] w-full object-cover" />
          </figure>
        ))}
      </div>
    </div>
  );
}

function SpecPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111] px-3 py-3">
      <span className="text-[#c9a84c]">{icon}</span>
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function ScoreCircle({ score }: { score: number | null }) {
  const s = score ?? 0;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (s / 100) * circumference;
  return (
    <div className="relative h-28 w-28">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#c9a84c" strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-white">{score ?? "--"}</span>
        <span className="text-xs text-white/40">/100</span>
      </div>
    </div>
  );
}

type ComponentDef = { label: string; weight: number; score: number };
function ComponentBar({ label, weight, score }: ComponentDef) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="font-semibold text-[#c9a84c]">{score}/100 <span className="text-white/30">({weight}%)</span></span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-[#c9a84c]/80" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

type SignalDef = { label: string; value: string; color: "green" | "amber" | "red" | "neutral" };
function SignalPill({ label, value, color }: SignalDef) {
  const colors = {
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    red: "border-red-500/30 bg-red-500/10 text-red-400",
    neutral: "border-white/10 bg-white/[0.04] text-white/50",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${colors[color]}`}>
      {label}: {value}
    </span>
  );
}

function AgentContactCard({ name, email, phone, brokerage, pricePerSqft }: { name?: string | null; email?: string | null; phone?: string | null; brokerage?: string | null; pricePerSqft: number | null }) {
  const displayName = name ?? "Hero Agent";
  const initials = displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="rounded-2xl border border-[#c9a84c]/25 bg-[#111] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c9a84c]/15 text-sm font-bold text-[#c9a84c]">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-white">{displayName}</p>
          {brokerage && <p className="text-xs text-white/44">{brokerage}</p>}
          <span className="mt-1 inline-block rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/8 px-2 py-0.5 text-xs font-bold text-[#c9a84c]">
            Hero Certified
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Button className="w-full rounded-xl bg-[#c9a84c] font-bold text-black hover:bg-[#b8973b]" asChild>
          {email ? (
            <a href={`mailto:${email}?subject=${encodeURIComponent("Showing request via AskHero")}`}>Request a Showing</a>
          ) : (
            <Link href="/contact">Request a Showing</Link>
          )}
        </Button>
        <Button variant="outline" className="w-full rounded-xl font-bold" asChild>
          <Link href="#hero-score-section">View Full Hero Analysis</Link>
        </Button>
      </div>
      {email && (
        <a href={`mailto:${email}`} className="mt-3 flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white/60">
          <Mail className="h-3.5 w-3.5" /> {email}
        </a>
      )}
      {phone && (
        <a href={`tel:${phone}`} className="mt-2 flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white/60">
          <Phone className="h-3.5 w-3.5" /> {phone}
        </a>
      )}
      {pricePerSqft && <p className="mt-3 text-xs text-white/36">${pricePerSqft}/sqft · AskHero listing</p>}
    </div>
  );
}

function FSBOCard({ price }: { price: number | null }) {
  return (
    <div className="rounded-2xl border border-[#c9a84c]/25 bg-[#111] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white">For Sale by Owner</p>
        <span className="rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/8 px-2 py-0.5 text-xs font-bold text-[#c9a84c]">
          $299 Direct Listing
        </span>
      </div>
      {price && <p className="mt-2 text-2xl font-extrabold text-[#c9a84c]">{formatMoney(price)}</p>}
      <p className="mt-2 text-xs text-white/50">This home is listed directly by the owner through AskHero.</p>
      <Button className="mt-4 w-full rounded-xl bg-[#c9a84c] font-bold text-black hover:bg-[#b8973b]" asChild>
        <Link href="/contact">Contact the Owner</Link>
      </Button>
    </div>
  );
}

function QuickFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-white/6 pt-2">
      <dt className="text-white/44">{label}</dt>
      <dd className="font-semibold text-white">{value}</dd>
    </div>
  );
}

// ── Derivation helpers ──

function deriveComponents(total: number | null): ComponentDef[] {
  const t = total ?? 72;
  return [
    { label: "Market Value", weight: 25, score: clamp(t + 3) },
    { label: "Neighborhood Quality", weight: 20, score: clamp(t - 2) },
    { label: "School Rating", weight: 20, score: clamp(t + 1) },
    { label: "Insurance Risk", weight: 15, score: clamp(t - 5) },
    { label: "Growth Potential", weight: 20, score: clamp(t + 4) },
  ];
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function deriveSignals(
  listing: Record<string, unknown>,
  crimeData: Record<string, unknown>,
  floodData: Record<string, unknown>,
  schools: SchoolData[],
  outlook: MarketOutlookData | Record<string, never>,
): SignalDef[] {
  const signals: SignalDef[] = [];

  if (schools.length > 0) {
    const avg = schools.reduce((acc, s) => acc + (Number((s as Record<string, unknown>).rating) || 7), 0) / schools.length;
    signals.push({ label: "School District", value: avg >= 7 ? "Good" : avg >= 5 ? "Fair" : "Low", color: avg >= 7 ? "green" : avg >= 5 ? "amber" : "red" });
  } else {
    signals.push({ label: "School District", value: "N/A", color: "neutral" });
  }

  const crime = crimeData as { unavailable?: boolean; heroCrimeSignal?: string };
  if (!crime.unavailable && crime.heroCrimeSignal) {
    const sig = crime.heroCrimeSignal.toLowerCase();
    const color: SignalDef["color"] = sig.includes("low") ? "green" : sig.includes("moderate") ? "amber" : "red";
    signals.push({ label: "Crime Index", value: crime.heroCrimeSignal, color });
  } else {
    signals.push({ label: "Crime Index", value: "N/A", color: "neutral" });
  }

  const flood = floodData as { unavailable?: boolean; heroFloodSignal?: string };
  if (!flood.unavailable && flood.heroFloodSignal) {
    const sig = flood.heroFloodSignal.toLowerCase();
    const color: SignalDef["color"] = sig.includes("minimal") ? "green" : sig.includes("moderate") ? "amber" : "red";
    signals.push({ label: "Flood Risk", value: flood.heroFloodSignal, color });
  } else {
    signals.push({ label: "Flood Risk", value: "N/A", color: "neutral" });
  }

  const ap = outlook as { status?: string; projected_5yr_appreciation?: number };
  if (ap.status === "available" && ap.projected_5yr_appreciation != null) {
    const pct = ap.projected_5yr_appreciation;
    signals.push({ label: "Appreciation", value: `${pct > 0 ? "+" : ""}${pct}%`, color: pct >= 10 ? "green" : pct >= 0 ? "amber" : "red" });
  } else {
    signals.push({ label: "Appreciation", value: "N/A", color: "neutral" });
  }

  signals.push({ label: "Commute", value: "N/A", color: "neutral" });

  const price = typeof listing.price === "number" ? listing.price : null;
  const sqft = typeof listing.sqft === "number" ? listing.sqft : null;
  if (price && sqft) {
    const ppsf = Math.round(price / sqft);
    signals.push({ label: "Price/sqft", value: `$${ppsf}`, color: ppsf <= 200 ? "green" : ppsf <= 350 ? "amber" : "red" });
  } else {
    signals.push({ label: "Price/sqft", value: "N/A", color: "neutral" });
  }

  return signals;
}

function normalizeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}
function normalizeOutlook(value: unknown): MarketOutlookData | Record<string, never> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as MarketOutlookData) : {};
}
function normalizeFloodData(value: unknown): HeroFloodData {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { provider: "none", unavailable: true, unavailableReason: "Flood data unavailable." };
  }
  return value as HeroFloodData;
}
function normalizeCrimeData(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { provider: "none", unavailable: true };
  }
  return value as Record<string, unknown>;
}
function sortPhotos(photos: Array<{ storage_path: string; sort_order?: number | null }>) {
  return [...photos].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
}
function formatMoney(value: number | null) {
  if (!value) return "--";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
