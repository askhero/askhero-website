import { useMemo, useState } from "react";
import { api } from "../../services/api";
import { useHeroAI } from "../../hooks/useHeroAI";
import AgentSidebar from "./AgentSidebar";
import HeroAIInsight from "./HeroAIInsight";
import NegotiationTimeline from "./NegotiationTimeline";
import ConfidenceBar from "../Shared/ConfidenceBar";

export default function NegotiationRoom({ deal, offers, refetch }) {
  const [counterAmount, setCounterAmount] = useState("");
  const buyerLast = [...offers].reverse().find((offer) => offer.submittedBy === "BUYER");
  const sellerLast = [...offers].reverse().find((offer) => offer.submittedBy === "SELLER");
  const gap = sellerLast && buyerLast ? Math.abs(sellerLast.amount - buyerLast.amount) : 0;
  const payload = useMemo(() => ({
    buyerOffer: buyerLast?.amount || 0,
    sellerCounter: sellerLast?.amount || 0,
    compValue: deal.property.comparableValue,
    daysOnMarket: deal.property.daysOnMarket,
    gap
  }), [buyerLast, sellerLast, deal.property, gap]);
  const { insight, loading } = useHeroAI(sellerLast ? "counter" : null, payload);

  async function submitCounter(amount) {
    await api.post("/negotiations/counter", { dealId: deal.id, amount: Number(amount) });
    setCounterAmount("");
    refetch?.();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="space-y-5">
        <NegotiationTimeline offers={offers} />
        <HeroAIInsight type="counter" data={insight} loading={loading} />
        {sellerLast && (
          <div className="card p-4">
            <p className="label">Response</p>
            <p className="font-display mt-2 text-3xl text-info">${gap.toLocaleString()} gap</p>
            <p className="mt-2 text-sm text-text-muted">{insight?.recommendation || "Review the counter and choose your next move."}</p>
            <ConfidenceBar percentage={insight?.acceptanceProbability || 50} label="Acceptance probability" />
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button className="btn" onClick={() => submitCounter(insight?.suggestedCounter || buyerLast.amount)}>Accept AI Suggestion</button>
              <button className="btn-ghost" onClick={() => setCounterAmount(insight?.suggestedCounter || "")}>Counter Manually</button>
              <button className="btn-ghost text-red-300">Walk Away</button>
            </div>
            <div className="mt-4 flex gap-2">
              <input className="input" value={counterAmount} onChange={(e) => setCounterAmount(e.target.value)} placeholder="Counter amount" />
              <button className="btn" onClick={() => submitCounter(counterAmount)}>Submit</button>
            </div>
          </div>
        )}
      </section>
      <aside className="space-y-4">
        <div className="card p-4">
          <p className="label">Deal Gap</p>
          <p className="font-display mt-2 text-4xl text-info">${gap.toLocaleString()}</p>
          <p className="text-sm text-text-muted">Your last offer vs seller ask</p>
        </div>
        <AgentSidebar agent={deal.agent} />
        <div className="card p-4">
          <p className="label">Mortgage Pre-qual</p>
          <p className="mt-2 text-sm">Limit: ${Number(deal.buyer?.preQualLimit || 0).toLocaleString()}</p>
          <p className="text-sm text-text-muted">Rate: {deal.buyer?.preQualRate || 6.5}%</p>
        </div>
      </aside>
    </div>
  );
}
