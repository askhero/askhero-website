export default function AgentSidebar({ agent }) {
  return (
    <div className="card p-4">
      <p className="label">Agent</p>
      <h3 className="mt-2 text-lg font-semibold">{agent?.name || "Agent pending"}</h3>
      <p className="text-sm text-text-muted">{agent?.email || "AskHero will connect an agent when assigned."}</p>
      <button className="btn mt-4 w-full">Message</button>
    </div>
  );
}
