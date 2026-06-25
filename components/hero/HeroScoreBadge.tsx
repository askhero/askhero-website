export function HeroScoreBadge({ score, label }: { score: number; label?: string }) {
  const offset = Math.max(0, Math.min(100, score));

  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border border-gold-300/25 bg-[#050914] shadow-[0_0_70px_rgba(217,180,92,0.14)]">
      <div
        className="absolute inset-2 rounded-full"
        style={{
          background: `conic-gradient(rgba(217,180,92,0.95) ${offset}%, rgba(255,255,255,0.08) ${offset}% 100%)`,
        }}
      />
      <div className="absolute inset-4 rounded-full bg-[#07111f]" />
      <div className="relative text-center">
        <p className="text-3xl font-extrabold text-gold-200">{score}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">{label || "Hero"}</p>
      </div>
    </div>
  );
}