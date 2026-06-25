import HeroScoreBadge from "../Shared/HeroScoreBadge";

export default function AgentBuyerProfile({ lead }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{lead.buyer?.name}</h3>
          <p className="text-sm text-text-muted">Pre-qual: ${Number(lead.buyer?.preQualLimit || 0).toLocaleString()}</p>
        </div>
        <HeroScoreBadge score={lead.property?.heroScore || 0} size="sm" />
      </div>
      <p className="mt-3 text-sm text-text-muted">Target: {lead.property?.city}</p>
    </div>
  );
}
