import { Bath, BedDouble, Camera, ImageIcon, Ruler, ShieldCheck, Sparkles } from "lucide-react";
import { HeroFloodSignal } from "@/components/hero/HeroFloodSignal";
import { HeroFiveYearOutlook, HeroMissingData, HeroNearbyAmenities, HeroNearbyRoads, HeroNearbySchools } from "@/components/hero/HeroNearbySections";
import type { BuilderMediaFile, EditableListingFields, SavedBuilderMedia } from "@/components/hero/listing-builder/types";
import type { EnrichedListingDraft } from "@/lib/hero/enrichListing";
import { orderListingMedia } from "@/lib/hero/mediaTourOrder";

type PreviewProps = {
  fields: EditableListingFields;
  localMedia: BuilderMediaFile[];
  savedMedia: SavedBuilderMedia[];
  heroScore: number;
  providerData: EnrichedListingDraft["providerData"];
  enrichment: EnrichedListingDraft["enrichment"];
};

export function HeroListingPreview({ fields, localMedia, savedMedia, heroScore, providerData, enrichment }: PreviewProps) {
  const highlights = lines(fields.highlightsText).slice(0, 8);
  const missingData = Array.from(new Set([...lines(fields.missingDataText), ...enrichment.unavailable_data])).slice(0, 8);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#07111f] shadow-[0_30px_120px_rgba(0,0,0,0.48)]">
      <MediaStrip localMedia={localMedia} savedMedia={savedMedia} />

      <div className="space-y-6 p-5 sm:p-6">
        <header className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-200/80">Hero Listing Preview</p>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-3xl">{fields.title || "Untitled listing draft"}</h2>
            <p className="mt-2 text-sm text-white/58">{fields.address || "Address not provided"}</p>
            <p className="mt-4 text-3xl font-extrabold text-gold-200">{formatMoney(fields.asking_price)}</p>
          </div>
          <div className="w-full rounded-2xl border border-gold-300/25 bg-gold-400/8 px-5 py-4 text-center lg:w-32">
            <p className="text-xs uppercase tracking-[0.16em] text-white/45">Hero Score</p>
            <p className="mt-1 text-4xl font-extrabold text-gold-200">{heroScore}</p>
            <p className="text-xs text-white/45">Preliminary</p>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat icon={<BedDouble className="h-4 w-4" />} label="Beds" value={formatValue(fields.beds)} />
          <Stat icon={<Bath className="h-4 w-4" />} label="Baths" value={formatValue(fields.baths)} />
          <Stat icon={<Ruler className="h-4 w-4" />} label="Sqft" value={formatValue(fields.sqft)} />
        </div>

        <Panel title="Description">
          <p className="text-sm leading-7 text-white/70">{fields.description || "No description generated yet."}</p>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Highlights" icon={<Sparkles className="h-4 w-4 text-gold-300" />}>
            <ul className="space-y-2 text-sm leading-6 text-white/68">
              {highlights.length ? highlights.map((item) => <li key={item}>{item}</li>) : <li>No highlights provided yet.</li>}
            </ul>
          </Panel>
          <Panel title="Hero AI Summary" icon={<ShieldCheck className="h-4 w-4 text-gold-300" />}>
            <p className="text-sm leading-7 text-white/68">{fields.heroAiSummary || "Hero summary will appear after draft creation."}</p>
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SignalCard label="Crime" value={providerData.crimeData} />
          <SignalCard label="Insurance review" value={providerData.insuranceRisk} />
        </div>

        <HeroFloodSignal flood={enrichment.flood_data} />

        <Panel title="Property record details">
          <div className="grid gap-3 sm:grid-cols-2">
            <DataRow label="Property records" value={providerData.propertyHistory} />
            <DataRow label="Tax history" value={providerData.taxHistory.join(" ") || "Data not available yet."} />
            <DataRow label="Sale history" value={providerData.saleHistory.join(" ") || "Data not available yet."} />
            <DataRow label="Nearby summary" value={providerData.amenities} />
          </div>
        </Panel>

        <HeroNearbySchools schools={enrichment.nearby_schools} />
        <HeroNearbyAmenities grocery={enrichment.nearby_grocery} shopping={enrichment.nearby_shopping} hospitals={enrichment.nearby_hospitals} />
        <HeroNearbyRoads roads={enrichment.nearby_roads} highways={enrichment.nearby_highways} />
        <HeroFiveYearOutlook outlook={enrichment.appreciation_projection} />

        {enrichment.conflicts.length > 0 ? (
          <Panel title="Review needed">
            <div className="space-y-2 text-sm leading-6 text-white/70">
              {enrichment.conflicts.map((conflict) => (
                <p key={`${conflict.field}-${conflict.provider}`}>{conflict.message}</p>
              ))}
            </div>
          </Panel>
        ) : null}

        <HeroMissingData items={missingData} />
      </div>
    </section>
  );
}

function MediaStrip({ localMedia, savedMedia }: { localMedia: BuilderMediaFile[]; savedMedia: SavedBuilderMedia[] }) {
  const media = localMedia.length
    ? orderListingMedia(localMedia, (item) => item.file.name, (item) => item.kind)
    : orderListingMedia(savedMedia, (item) => item.name, (item) => item.kind);

  if (media.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center border-b border-white/8 bg-[#050914] text-white/42">
        <div className="text-center">
          <ImageIcon className="mx-auto h-9 w-9 text-gold-300/70" />
          <p className="mt-3 text-sm">Photo and video previews appear here.</p>
        </div>
      </div>
    );
  }

  const [hero, ...rest] = media;
  return (
    <div className="grid border-b border-white/8 bg-[#050914] lg:grid-cols-[1.25fr_0.75fr]">
      <MediaItem item={hero} className="h-80 lg:h-[28rem]" priority />
      <div className="grid grid-cols-2">
        {rest.slice(0, 4).map((item) => (
          <MediaItem key={mediaKey(item)} item={item} className="h-40 lg:h-56" />
        ))}
      </div>
    </div>
  );
}

function MediaItem({ item, className, priority }: { item: BuilderMediaFile | SavedBuilderMedia; className: string; priority?: boolean }) {
  const src = "previewUrl" in item ? item.previewUrl : "";
  const name = "file" in item ? item.file.name : item.name;
  return (
    <div className="relative overflow-hidden border-white/8">
      {item.kind === "image" && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className={`w-full object-cover ${className}`} />
      ) : item.kind === "video" && src ? (
        <video src={src} className={`w-full object-cover ${className}`} controls />
      ) : (
        <div className={`flex w-full items-center justify-center bg-white/[0.035] text-white/42 ${className}`}>
          <Camera className="h-8 w-8" />
        </div>
      )}
      {item.category || item.tourLabel ? (
        <span className={`absolute left-3 top-3 rounded-full border border-gold-300/40 bg-[#030712]/82 px-3 py-1 font-bold text-gold-100 backdrop-blur ${priority ? "text-sm" : "text-xs"}`}>
          {item.category || item.tourLabel}
        </span>
      ) : null}
      {item.isCover ? (
        <span className="absolute right-3 top-3 rounded-full bg-gold-400 px-3 py-1 text-xs font-bold text-[#030712]">Cover</span>
      ) : null}
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.035] p-5">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white/44">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function SignalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#050914]/70 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/38">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#050914]/70 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-white/64">{value || "Data not available yet."}</p>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.035] p-4">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/38">{icon}{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function mediaKey(item: BuilderMediaFile | SavedBuilderMedia) {
  if ("file" in item) return `${item.file.name}-${item.file.size}`;
  return `${item.storage_path}-${item.size}`;
}

function formatMoney(value: number | null) {
  if (typeof value !== "number") return "Price not provided";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatValue(value: number | null) {
  if (typeof value !== "number") return "Not provided";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}
