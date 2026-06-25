export default function ContingencyToggle({ label, description, enabled, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-border-default bg-bg-dark p-3">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="text-xs text-text-muted">{description}</span>
      </span>
      <input type="checkbox" checked={enabled} onChange={(e) => onChange(e.target.checked)} className="rounded border-border-default bg-bg-primary text-gold focus:ring-gold" />
    </label>
  );
}
