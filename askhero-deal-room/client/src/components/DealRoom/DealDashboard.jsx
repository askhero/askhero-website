import { useHeroAI } from "../../hooks/useHeroAI";
import ClosingChecklist from "./ClosingChecklist";
import DealProgressBar from "./DealProgressBar";
import HeroAIInsight from "./HeroAIInsight";

export default function DealDashboard({ deal }) {
  const agreed = deal.agreedPrice || deal.offers?.at(-1)?.amount || deal.property.listPrice;
  const monthly = Math.round((agreed * 0.935 * (0.065 / 12)) / (1 - Math.pow(1 + 0.065 / 12, -360)));
  const { insight, loading } = useHeroAI("closing", {
    stage: deal.status,
    agreedPrice: agreed,
    closingDate: deal.closingDate,
    nextDeadline: deal.checklistItems?.[0]?.dueDate,
    nextDeadlineLabel: deal.checklistItems?.[0]?.label
  });

  return (
    <div className="space-y-5">
      <DealProgressBar status={deal.status} />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="card p-4">
            <p className="label">Final Terms</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Stat label="Agreed Price" value={`$${agreed.toLocaleString()}`} />
              <Stat label="Saved vs List" value={`$${Math.max(0, deal.property.listPrice - agreed).toLocaleString()}`} />
              <Stat label="Closing Date" value={deal.closingDate ? new Date(deal.closingDate).toLocaleDateString() : "Pending"} />
              <Stat label="Est Monthly Payment" value={`$${monthly.toLocaleString()}`} />
            </div>
          </div>
          <HeroAIInsight type="closing" data={insight} loading={loading} />
        </section>
        <ClosingChecklist items={deal.checklistItems} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded border border-border-default p-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="font-display mt-1 text-2xl">{value}</p>
    </div>
  );
}
