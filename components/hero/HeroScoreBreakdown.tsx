type ScoreBreakdownItem = {
  factor?: string;
  status?: string;
  impact?: string;
  explanation?: string;
};

export function HeroScoreBreakdown({ items }: { items: ScoreBreakdownItem[] }) {
  if (!items.length) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/42">Hero Score Breakdown</p>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <div key={item.factor} className="rounded-xl border border-white/8 bg-[#050914]/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-white">{item.factor}</p>
              <span className="rounded-full border border-gold-300/30 px-3 py-1 text-xs font-semibold text-gold-100">
                {item.impact || "neutral"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/62">{item.explanation || "Based on available facts only."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
