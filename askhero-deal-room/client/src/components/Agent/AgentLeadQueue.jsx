import AgentBuyerProfile from "./AgentBuyerProfile";

export default function AgentLeadQueue({ leads = [] }) {
  if (!leads.length) return <div className="card p-6 text-text-muted">No pre-qualified buyer leads are waiting.</div>;
  return (
    <div className="grid gap-4">
      {leads.map((lead) => (
        <div key={lead.id} className="card p-4">
          <AgentBuyerProfile lead={lead} />
          <button className="btn mt-4 w-full">Accept Lead</button>
        </div>
      ))}
    </div>
  );
}
