import { notFound } from "next/navigation";
import { BarChart3, Heart, MapPinned, Scale, Send } from "lucide-react";
import { HeroFloodBadge, HeroFloodSignal } from "@/components/hero/HeroFloodSignal";
import { HeroFiveYearOutlook, HeroMissingData, HeroNearbyAmenities, HeroNearbyRoads, HeroNearbySchools } from "@/components/hero/HeroNearbySections";
import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import type { HeroFloodData, MarketOutlookData, NearbyAmenity, SchoolData } from "@/lib/hero/providers/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("*, listing_photos(*), hero_scores(*)")
    .eq("id", id)
    .eq("approval_status", "approved")
    .single();

  if (!listing) {
    notFound();
  }

  const score = Array.isArray(listing.hero_scores) ? listing.hero_scores[0] : null;
  const { data: enrichment } = await supabase
    .from("listing_enrichment")
    .select("crime_data,flood_data,nearby_schools,nearby_grocery,nearby_shopping,nearby_hospitals,nearby_roads,nearby_highways,appreciation_projection,unavailable_data,updated_at")
    .eq("listing_id", id)
    .maybeSingle();
  const crimeData = normalizeCrimeData(enrichment?.crime_data);
  const floodData = normalizeFloodData(enrichment?.flood_data);
  const schools = normalizeArray<SchoolData>(enrichment?.nearby_schools);
  const grocery = normalizeArray<NearbyAmenity>(enrichment?.nearby_grocery);
  const shopping = normalizeArray<NearbyAmenity>(enrichment?.nearby_shopping);
  const hospitals = normalizeArray<NearbyAmenity>(enrichment?.nearby_hospitals);
  const roads = normalizeArray<NearbyAmenity>(enrichment?.nearby_roads);
  const highways = normalizeArray<NearbyAmenity>(enrichment?.nearby_highways);
  const missingData = normalizeStringArray(enrichment?.unavailable_data);
  const outlook = normalizeOutlook(enrichment?.appreciation_projection);
  const photos = orderPhotos(listing.listing_photos ?? []).map((photo) => ({
    ...photo,
    publicUrl: supabase.storage.from("listing-photos").getPublicUrl(photo.storage_path).data.publicUrl,
  }));

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <PhotoGallery photos={photos} />
          <aside className="rounded-lg border border-gold-400/20 bg-gold-400/8 p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-gold-300">
              Hero Score
            </p>
            <p className="mt-3 text-6xl font-semibold">
              {score?.total_score || "--"}
              <span className="text-2xl text-white/46">/100</span>
            </p>
            <p className="mt-3 text-white/68">
              {score?.buyer_recommendation ||
                "Hero Score will calculate after enough listing data is available."}
            </p>
          </aside>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-gold-300">
              Approved Listing
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">
              {listing.address_line_1}
            </h1>
            <p className="mt-2 text-white/64">
              {listing.city}, {listing.state} {listing.zip}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <HeroFloodBadge flood={floodData} />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <Fact label="Price" value={formatMoney(listing.price)} />
              <Fact label="Beds" value={listing.beds || "--"} />
              <Fact label="Baths" value={listing.baths || "--"} />
              <Fact label="Sqft" value={listing.sqft || "--"} />
            </div>
            <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-semibold">AskHero Insight</h2>
              <p className="mt-3 leading-7 text-white/66">
                {score?.explanation ||
                  "This listing is approved, but a complete score explanation is still being prepared."}
              </p>
            </div>
            <HeroCrimeSignal crime={crimeData} />
            <HeroFloodSignal flood={floodData} />
            <div className="mt-6 space-y-4">
              <HeroNearbySchools schools={schools} />
              <HeroNearbyAmenities grocery={grocery} shopping={shopping} hospitals={hospitals} />
              <HeroNearbyRoads roads={roads} highways={highways} />
              <HeroFiveYearOutlook outlook={outlook} />
              <HeroMissingData items={missingData} />
            </div>

            <div className="mt-6 rounded-lg border border-white/10 bg-navy-850 p-5">
              <div className="mb-3 flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-gold-300" />
                <h2 className="text-xl font-semibold">Map Placeholder</h2>
              </div>
              <p className="text-white/62">
                Map rendering is ready for latitude and longitude once approved
                listing data is connected.
              </p>
            </div>
            <p className="mt-5 text-sm leading-6 text-white/52">
              Hero Score is informational only and does not represent financial,
              legal, tax, mortgage, insurance, or real estate advice.
            </p>
          </div>

          <aside className="space-y-3">
            <Button className="w-full">
              <Heart className="h-4 w-4" />
              Save Home
            </Button>
            <Button className="w-full" variant="secondary">
              <Scale className="h-4 w-4" />
              Compare
            </Button>
            <Button className="w-full" variant="outline">
              <Send className="h-4 w-4" />
              Contact Agent
            </Button>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gold-300" />
                <h2 className="font-semibold">Component Breakdown</h2>
              </div>
              {score?.component_scores ? (
                Object.entries(score.component_scores as Record<string, unknown>).map(
                  ([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between border-t border-white/8 py-3 text-sm"
                    >
                      <span className="capitalize text-white/62">
                        {label.replaceAll("_", " ")}
                      </span>
                      <span className="text-gold-300">{formatScoreComponent(value)}</span>
                    </div>
                  ),
                )
              ) : (
                <p className="text-sm text-white/56">Pending score components.</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-white/44">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function formatMoney(value: number | null) {
  if (!value) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

type ListingPhoto = {
  storage_path: string;
  alt_text?: string | null;
  sort_order?: number | null;
  category?: string | null;
  category_slug?: string | null;
  is_cover?: boolean | null;
  publicUrl: string;
};

function PhotoGallery({ photos }: { photos: ListingPhoto[] }) {
  if (!photos.length) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-white/10 bg-navy-850 text-white/48 sm:col-span-2">
          Photo gallery will appear when listing media is available.
        </div>
      </div>
    );
  }

  const [cover, ...rest] = photos;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <figure className="relative overflow-hidden rounded-lg border border-white/10 bg-navy-850 sm:col-span-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover.publicUrl} alt={cover.alt_text || cover.category || "Listing photo"} className="aspect-[16/9] w-full object-cover" />
        {cover.category ? <figcaption className="absolute left-3 top-3 rounded-full bg-[#030712]/82 px-3 py-1 text-xs font-bold text-gold-100 backdrop-blur">{cover.category}</figcaption> : null}
      </figure>
      {rest.slice(0, 4).map((photo) => (
        <figure key={photo.storage_path} className="relative overflow-hidden rounded-lg border border-white/10 bg-navy-850">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.publicUrl} alt={photo.alt_text || photo.category || "Listing photo"} className="aspect-[4/3] w-full object-cover" />
          {photo.category ? <figcaption className="absolute left-2 top-2 rounded-full bg-[#030712]/82 px-2 py-1 text-xs font-bold text-gold-100 backdrop-blur">{photo.category}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}
type PublicCrimeData = {
  provider?: "crimeometer" | "fbi_cde" | "none";
  unavailable?: boolean;
  unavailableReason?: string;
  heroCrimeSignal?: string;
  overallRiskScore?: number | null;
  violentCrimeRate?: number | null;
  propertyCrimeRate?: number | null;
  source?: string | null;
  lastUpdated?: string | null;
};

function HeroCrimeSignal({ crime }: { crime: PublicCrimeData }) {
  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-xl font-semibold">Hero Crime Signal</h2>
      {crime.unavailable !== false ? (
        <p className="mt-3 text-sm leading-6 text-white/64">
          Crime data is not available yet for this location.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Fact label="Signal" value={crime.heroCrimeSignal || "Available"} />
          <Fact label="Updated" value={crime.lastUpdated || "--"} />
          <Fact label="Violent crime metric" value={formatOptionalNumber(crime.violentCrimeRate)} />
          <Fact label="Property crime metric" value={formatOptionalNumber(crime.propertyCrimeRate)} />
        </div>
      )}
      {crime.lastUpdated ? <p className="mt-3 text-xs text-white/46">Last updated {crime.lastUpdated}</p> : null}
      <p className="mt-3 text-xs leading-5 text-white/46">
        Crime information depends on available public reporting data and may not reflect real-time conditions.
      </p>
    </div>
  );
}

function normalizeCrimeData(value: unknown): PublicCrimeData {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { provider: "none", unavailable: true, unavailableReason: "Crime data unavailable for this location." };
  }
  return value as PublicCrimeData;
}

function normalizeFloodData(value: unknown): HeroFloodData {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { provider: "none", unavailable: true, unavailableReason: "Flood data unavailable for this location." };
  }
  return value as HeroFloodData;
}

function normalizeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function normalizeOutlook(value: unknown): MarketOutlookData | Record<string, never> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as MarketOutlookData;
  }
  return {};
}

function orderPhotos(photos: Omit<ListingPhoto, "publicUrl">[]) {
  return [...photos].sort((left, right) => {
    if (Boolean(left.is_cover) !== Boolean(right.is_cover)) return left.is_cover ? -1 : 1;
    return (left.sort_order ?? 999) - (right.sort_order ?? 999);
  });
}

function formatOptionalNumber(value: number | null | undefined) {
  if (typeof value !== "number") return "--";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function formatScoreComponent(value: unknown) {
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (Array.isArray(value)) return `${value.length} items`;
  if (typeof value === "object" && value !== null) return "Available";
  return "--";
}
