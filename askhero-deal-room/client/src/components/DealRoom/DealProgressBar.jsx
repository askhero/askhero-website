import { CheckCircle, Circle, CircleDot } from "lucide-react";

const stages = ["OFFER_ACCEPTED", "INSPECTION", "APPRAISAL", "FINANCING", "CLOSING"];

export default function DealProgressBar({ status }) {
  const current = Math.max(0, stages.indexOf(status));
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {stages.map((stage, index) => {
        const Icon = index < current ? CheckCircle : index === current ? CircleDot : Circle;
        return (
          <div key={stage} className={`rounded-lg border p-3 ${index <= current ? "border-gold text-gold" : "border-border-default text-text-muted"}`}>
            <Icon size={20} />
            <p className="mt-2 text-xs">{stage.replaceAll("_", " ")}</p>
          </div>
        );
      })}
    </div>
  );
}
