export default function ConfidenceBar({ percentage = 0, label = "Confidence" }) {
  const value = Math.max(0, Math.min(100, percentage));
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-text-muted">{label}</span>
        <span className="text-gold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-bg-dark">
        <div className="h-2 rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-700" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
