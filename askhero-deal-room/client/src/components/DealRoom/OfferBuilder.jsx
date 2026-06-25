import { useMemo, useState } from "react";
import { api } from "../../services/api";
import { useHeroAI } from "../../hooks/useHeroAI";
import ConfidenceBar from "../Shared/ConfidenceBar";
import ContingencyToggle from "./ContingencyToggle";
import HeroAIInsight from "./HeroAIInsight";
import OfferSlider from "./OfferSlider";

export default function OfferBuilder({ deal, onSubmitted }) {
  const property = deal.property;
  const [amount, setAmount] = useState(property.listPrice);
  const [contingencies, setContingencies] = useState({
    Inspection: true,
    Financing: true,
    Appraisal: true,
    "Sale of Home": false
  });
  const payload = useMemo(() => ({
    listPrice: property.listPrice,
    compValue: property.comparableValue,
    daysOnMarket: property.daysOnMarket,
    heroScore: property.heroScore,
    negotiationGrade: property.negotiationGrade,
    preQualLimit: deal.buyer?.preQualLimit
  }), [property, deal.buyer]);
  const { insight, loading } = useHeroAI("offer", payload);

  async function submitOffer() {
    await api.post("/offers", { dealId: deal.id, amount, submittedBy: "BUYER" });
    onSubmitted?.();
  }

  const belowAsk = property.listPrice - amount;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="card p-5">
        <p className="label">Offer Amount</p>
        <input className="input font-display mt-3 text-[28px]" value={amount} onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")))} />
        <div className="mt-4">
          <OfferSlider value={amount} min={Math.round(property.listPrice * 0.85)} max={Math.round(property.listPrice * 1.05)} onChange={setAmount} />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button className="btn-ghost" onClick={() => setAmount(insight?.suggestedOffer || amount)}>AI Suggested</button>
          <button className="btn-ghost" onClick={() => setAmount(property.comparableValue)}>Comparable Value</button>
          <button className="btn-ghost" onClick={() => setAmount(property.listPrice)}>List Price</button>
        </div>
        <div className="mt-6 space-y-3">
          {Object.entries(contingencies).map(([label, enabled]) => (
            <ContingencyToggle key={label} label={label} description={`${label} protection for this offer.`} enabled={enabled} onChange={(value) => setContingencies((old) => ({ ...old, [label]: value }))} />
          ))}
        </div>
        <button className="btn mt-6 w-full" onClick={submitOffer}>Submit Offer</button>
      </section>
      <aside className="space-y-4">
        <HeroAIInsight type="offer" data={insight} loading={loading} />
        <div className="card space-y-3 p-4 text-sm">
          {[
            ["List Price", property.listPrice],
            ["Comparable Value", property.comparableValue],
            ["Your Offer", amount],
            ["Below Ask", belowAsk],
            ["Days on Market", property.daysOnMarket]
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-border-default pb-2">
              <span className="text-text-muted">{label}</span>
              <span>{typeof value === "number" && label !== "Days on Market" ? `$${value.toLocaleString()}` : value}</span>
            </div>
          ))}
          <ConfidenceBar percentage={insight?.confidencePct || 60} label="Leverage score" />
        </div>
      </aside>
    </div>
  );
}
