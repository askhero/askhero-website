import { Building2, GraduationCap, Hospital, Map, ShoppingBag, Store } from "lucide-react";
import type React from "react";
import type { MarketOutlookData, NearbyAmenity, SchoolData } from "@/lib/hero/providers/types";

type SectionProps = {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export function HeroNearbySchools({ schools }: { schools: SchoolData[] }) {
  return (
    <NearbySection title="Nearby Schools" icon={<GraduationCap className="h-4 w-4" />} description="Shown only when school data is available for this location.">
      {schools.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {schools.slice(0, 6).map((school, index) => (
            <DataTile key={`${school.name}-${index}`} title={school.name} lines={[
              school.level ? `${school.level} school` : null,
              school.rating ? `Rating: ${school.rating}` : school.ratingBand ? `Rating band: ${school.ratingBand}` : null,
              typeof school.distanceMiles === "number" ? `${school.distanceMiles.toFixed(1)} miles away` : null,
            ]} />
          ))}
        </div>
      ) : <EmptyState />}
    </NearbySection>
  );
}

export function HeroNearbyAmenities({
  grocery,
  shopping,
  hospitals,
}: {
  grocery: NearbyAmenity[];
  shopping: NearbyAmenity[];
  hospitals: NearbyAmenity[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <AmenityGroup title="Nearby Grocery" icon={<Store className="h-4 w-4" />} items={grocery} />
      <AmenityGroup title="Nearby Shopping" icon={<ShoppingBag className="h-4 w-4" />} items={shopping} />
      <AmenityGroup title="Nearby Hospitals" icon={<Hospital className="h-4 w-4" />} items={hospitals} />
    </div>
  );
}

export function HeroNearbyRoads({ roads, highways = [] }: { roads: NearbyAmenity[]; highways?: NearbyAmenity[] }) {
  const items = [...roads, ...highways];
  return (
    <NearbySection title="Roads and Highways" icon={<Map className="h-4 w-4" />} description="Major access points appear here when map data returns them.">
      {items.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.slice(0, 6).map((road, index) => (
            <DataTile key={`${road.name}-${index}`} title={road.name} lines={[road.address, road.rating ? `Map rating: ${road.rating}` : null]} />
          ))}
        </div>
      ) : <EmptyState />}
    </NearbySection>
  );
}

export function HeroFiveYearOutlook({ outlook }: { outlook: MarketOutlookData | Record<string, never> }) {
  const text = isMarketOutlook(outlook) ? outlook.fiveYearOutlook : null;
  return (
    <NearbySection title="Hero 5-Year Outlook" icon={<Building2 className="h-4 w-4" />} description="Shown only when configured market data is available.">
      {text ? <p className="text-sm leading-7 text-white/68">{text}</p> : <EmptyState />}
    </NearbySection>
  );
}

export function HeroMissingData({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <NearbySection title="Missing or unavailable data" icon={<Map className="h-4 w-4" />}>
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from(new Set(items)).slice(0, 12).map((item) => (
          <div key={item} className="rounded-xl border border-white/8 bg-[#050914]/70 p-3 text-sm leading-6 text-white/62">
            {publicLabel(item)}
          </div>
        ))}
      </div>
    </NearbySection>
  );
}

function AmenityGroup({ title, icon, items }: { title: string; icon: React.ReactNode; items: NearbyAmenity[] }) {
  return (
    <NearbySection title={title} icon={icon}>
      {items.length ? (
        <div className="space-y-3">
          {items.slice(0, 5).map((item, index) => (
            <DataTile key={`${item.name}-${index}`} title={item.name} lines={[item.address, item.rating ? `Rating: ${item.rating}` : null]} />
          ))}
        </div>
      ) : <EmptyState />}
    </NearbySection>
  );
}

function NearbySection({ title, description, icon, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.035] p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gold-300/25 bg-gold-400/10 text-gold-200">
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white/48">{title}</h3>
          {description ? <p className="mt-1 text-xs leading-5 text-white/42">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function DataTile({ title, lines }: { title: string; lines: Array<string | null | undefined> }) {
  const cleanLines = lines.filter((line): line is string => Boolean(line));
  return (
    <div className="rounded-xl border border-white/8 bg-[#050914]/70 p-4">
      <p className="text-sm font-bold leading-5 text-white">{title}</p>
      {cleanLines.length ? (
        <div className="mt-2 space-y-1 text-xs leading-5 text-white/52">
          {cleanLines.map((line) => <p key={line}>{line}</p>)}
        </div>
      ) : (
        <p className="mt-2 text-xs text-white/42">Data not available yet.</p>
      )}
    </div>
  );
}

function EmptyState() {
  return <p className="rounded-xl border border-white/8 bg-[#050914]/70 p-4 text-sm text-white/52">Data not available yet.</p>;
}

function isMarketOutlook(value: MarketOutlookData | Record<string, never>): value is MarketOutlookData {
  return typeof (value as MarketOutlookData).fiveYearOutlook === "string";
}

function publicLabel(value: string) {
  return value
    .replace(/ATTOM/gi, "Property records")
    .replace(/Google Maps(?: Platform)?/gi, "Map data")
    .replace(/GreatSchools/gi, "School data")
    .replace(/Crimeometer|FBI Crime Data Explorer|FBI CDE/gi, "Crime data")
    .replace(/FEMA National Flood Hazard Layer|FEMA|NFHL/gi, "Flood data")
    .replace(/\s*-\s*/g, ": ");
}
