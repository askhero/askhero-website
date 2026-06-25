import { CheckCircle2, Loader2 } from "lucide-react";

const loadingSteps = [
  "Reading your request",
  "Detecting buyer profile",
  "Estimating Hero Safe Budget",
  "Checking approved listings",
  "Ranking matches",
  "Building Hero AI Summary",
];

export function HeroSearchLoading({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-gold-300/20 bg-[#050914]/92 p-4 text-left shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        <Loader2 className="h-4 w-4 animate-spin text-gold-300" />
        Hero is analyzing your search
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {loadingSteps.map((step) => (
          <div key={step} className="flex items-center gap-2 text-xs text-white/60">
            <CheckCircle2 className="h-3.5 w-3.5 text-gold-300" />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}