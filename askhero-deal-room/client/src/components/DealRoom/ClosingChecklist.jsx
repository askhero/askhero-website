import { isPast } from "date-fns";

export default function ClosingChecklist({ items = [] }) {
  const fallback = ["Schedule Inspection", "Upload Mortgage Docs", "Review Title Report", "Sign Disclosures", "Final Walkthrough", "Wire Closing Funds"].map((label, i) => ({
    id: label,
    label,
    dueDate: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
    priority: i < 2 ? "high" : "normal",
    completed: false
  }));
  const rows = items.length ? items : fallback;
  return (
    <div className="card p-4">
      <p className="label">Closing Checklist</p>
      <div className="mt-4 space-y-3">
        {rows.map((item) => {
          const overdue = !item.completed && item.dueDate && isPast(new Date(item.dueDate));
          return (
            <label key={item.id} className="flex items-center gap-3 rounded border border-border-default p-3">
              <input type="checkbox" defaultChecked={item.completed} className="rounded text-gold focus:ring-gold" />
              <span className={`flex-1 text-sm ${item.completed ? "text-text-muted line-through" : ""}`}>{item.label}</span>
              <span className={`rounded px-2 py-1 text-xs ${overdue ? "bg-orange-950 text-orange-300" : "bg-bg-dark text-text-muted"}`}>{item.priority}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
