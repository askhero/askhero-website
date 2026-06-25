import { BriefcaseBusiness, Car, GraduationCap, HeartHandshake, Landmark, ShieldCheck } from "lucide-react";

const intentGroups = [
  {
    label: "Budget Analysis",
    icon: Landmark,
    keywords: ["income", "budget", "$", "under", "payment", "afford", "salary", "safe budget"],
  },
  {
    label: "School Priority",
    icon: GraduationCap,
    keywords: ["school", "schools", "district", "education"],
  },
  {
    label: "Safety Priority",
    icon: ShieldCheck,
    keywords: ["safety", "safe", "crime", "risk"],
  },
  {
    label: "Family Fit",
    icon: HeartHandshake,
    keywords: ["family", "kids", "children", "bedroom", "bed", "room"],
  },
  {
    label: "Commute / Lifestyle",
    icon: Car,
    keywords: ["commute", "drive", "work", "grocery", "shopping", "walk", "lifestyle"],
  },
  {
    label: "Long-Term Value",
    icon: BriefcaseBusiness,
    keywords: ["long-term", "long term", "value", "investment", "resale", "equity", "outlook"],
  },
];

export function HeroIntentIndicators({ query }: { query: string }) {
  const normalized = query.toLowerCase();

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {intentGroups.map(({ label, icon: Icon, keywords }) => {
        const active = keywords.some((keyword) => normalized.includes(keyword));

        return (
          <div
            key={label}
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
              active
                ? "border-gold-300/45 bg-gold-400/12 text-gold-200 shadow-[0_0_30px_rgba(217,180,92,0.12)]"
                : "border-white/10 bg-white/[0.035] text-white/45"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${active ? "text-gold-300" : "text-white/35"}`} />
            {label}
          </div>
        );
      })}
    </div>
  );
}