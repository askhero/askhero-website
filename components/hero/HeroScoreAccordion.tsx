"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const COMPONENTS = [
  {
    name: "Market Value Score",
    weight: "25%",
    summary: "Compares list price to recent comparable sales.",
    uses: "Recent comps, price/sqft trends, days on market.",
    whyItMatters: "Tells you if you're overpaying before you offer.",
  },
  {
    name: "Negotiation Power Score",
    weight: "15%",
    summary: "Signals how much leverage a buyer has.",
    uses: "Days on market, price reductions, local inventory.",
    whyItMatters: "Know whether to offer under or at asking.",
  },
  {
    name: "Neighborhood Quality Score",
    weight: "20%",
    summary: "Rates the surrounding area holistically.",
    uses: "School ratings, crime index, walkability, amenities proximity.",
    whyItMatters: "Neighborhood quality drives long-term resale value.",
  },
  {
    name: "Insurance Risk Score",
    weight: "15%",
    summary: "Flags known environmental and weather risks.",
    uses: "Flood zone, wildfire risk, hail frequency, wind exposure.",
    whyItMatters: "Insurance costs can add hundreds per month you didn't budget for.",
  },
  {
    name: "Property Condition Score",
    weight: "10%",
    summary: "Estimates the physical state of the home.",
    uses: "Age, listing disclosures, permit history, roof/HVAC age when provided.",
    whyItMatters: "Identifies likely repair costs before inspection.",
  },
  {
    name: "Growth Potential Score",
    weight: "15%",
    summary: "Projects 5-year appreciation likelihood.",
    uses: "Local development plans, job growth, population trends, school trajectory.",
    whyItMatters: "Tells you if this is a good long-term investment.",
  },
];

function AccordionCard({ name, weight, summary, uses, whyItMatters }: (typeof COMPONENTS)[number]) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111]">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03]"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-white">{name}</span>
            <span className="rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-2 py-0.5 text-xs font-bold text-[#c9a84c]">
              {weight}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-white/50">{summary}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#c9a84c] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-white/8 px-5 pb-5 pt-4">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">Data used</dt>
              <dd className="mt-1 text-sm leading-6 text-white/70">{uses}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">Why it matters</dt>
              <dd className="mt-1 text-sm leading-6 text-white/70">{whyItMatters}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

export function HeroScoreAccordion() {
  return (
    <div className="space-y-3">
      {COMPONENTS.map((c) => (
        <AccordionCard key={c.name} {...c} />
      ))}
    </div>
  );
}
