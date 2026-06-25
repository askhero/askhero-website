import type { HeroFloodData } from "@/lib/hero/providers/types";

const disclaimer =
  "Flood information depends on available public hazard data and may not reflect all insurance, lender, or local conditions. Verify with your lender and an insurance professional.";

export function HeroFloodSignal({ flood, compact = false }: { flood?: Partial<HeroFloodData> | null; compact?: boolean }) {
  const unavailable = !flood || flood.unavailable !== false;
  const signal = unavailable ? "Data unavailable" : flood.heroFloodSignal || "Unknown";

  if (compact) {
    return (
      <div className="rounded-xl border border-white/8 bg-[#070a10]/55 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/38">Flood</p>
        <p className="mt-2 font-semibold text-white">{signal}</p>
      </div>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-white/8 bg-[#050914]/70 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-200">Hero Flood Signal</p>
      {unavailable ? (
        <p className="mt-3 text-sm leading-6 text-white/64">Flood data is not available yet for this location.</p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <FloodFact label="Signal" value={signal} />
          <FloodFact label="Flood zone" value={flood.floodZone || "Data not available yet."} />
          <FloodFact label="Special flood hazard area" value={formatBoolean(flood.specialFloodHazardArea)} />
          {flood.floodZoneDescription ? (
            <div className="rounded-xl border border-white/8 bg-[#050914]/70 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.14em] text-white/35">Interpretation</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/64">{flood.floodZoneDescription}</p>
            </div>
          ) : null}
        </div>
      )}
      <p className="mt-4 text-xs leading-5 text-white/46">{disclaimer}</p>
    </section>
  );
}

export function HeroFloodBadge({ flood }: { flood?: Partial<HeroFloodData> | null }) {
  const label = !flood || flood.unavailable !== false ? "Data unavailable" : flood.heroFloodSignal || "Unknown";
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-semibold text-white/68">
      Flood: {label}
    </span>
  );
}

function FloodFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#050914]/70 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold leading-6 text-white/64">{value}</p>
    </div>
  );
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Data not available yet.";
}
