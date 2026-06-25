export default function HeroAIInsight({ type = "offer", data, loading }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-gold/40 bg-[#0f1a14] p-4 shadow-[0_0_40px_rgba(200,169,110,0.12)]">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-gold/10 blur-2xl" />
      <p className="label">⚡ Hero AI</p>
      {loading ? (
        <div className="mt-4 space-y-2">
          <div className="h-4 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
        </div>
      ) : (
        <div className="relative mt-3 text-sm leading-6">
          {type === "offer" && (
            <>
              <p className="font-display text-2xl text-gold">${Number(data?.suggestedOffer || 0).toLocaleString()}</p>
              <p className="text-text-muted">{data?.reasoning || "AI suggestion unavailable."}</p>
              <p className="mt-2 text-gold-light">Leverage: {data?.leverageLevel || "Medium"}</p>
            </>
          )}
          {type === "counter" && (
            <>
              <p className="font-display text-2xl text-info">{data?.acceptanceProbability || 0}%</p>
              <p className="text-text-muted">{data?.plainEnglishSummary || data?.recommendation || "No counter analysis yet."}</p>
            </>
          )}
          {type === "closing" && <p className="text-text-muted">{data?.advice || "No closing advice yet."}</p>}
        </div>
      )}
    </div>
  );
}
