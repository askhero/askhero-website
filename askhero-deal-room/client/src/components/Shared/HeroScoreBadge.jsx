export default function HeroScoreBadge({ score = 0, size = "md" }) {
  const sizes = { sm: "text-base", md: "text-2xl", lg: "text-4xl" };
  return (
    <div className="text-center">
      <div className={`font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-light ${sizes[size]}`}>{score}</div>
      <div className="font-label text-[10px] uppercase tracking-[0.12em] text-text-muted">Hero Score</div>
    </div>
  );
}
