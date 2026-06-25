import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../Shared/Navbar";
import Sidebar from "../Shared/Sidebar";
import AgentDealCard from "./AgentDealCard";
import AgentLeadQueue from "./AgentLeadQueue";
import AgentMessageThread from "./AgentMessageThread";

const tabs = ["Lead Queue", "Active Deals", "Messages", "Performance"];

export default function AgentPortal() {
  const { user } = useAuth();
  const [active, setActive] = useState(tabs[0]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    api.get("/agents/leads").then((res) => setLeads(res.data.leads || [])).catch(() => setLeads([]));
    if (user?.id) api.get(`/agents/${user.id}/deals`).then((res) => setDeals(res.data.deals || [])).catch(() => setDeals([]));
  }, [user?.id]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl p-4">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label">Hero Agent Portal</p>
            <h1 className="font-display mt-2 text-4xl">{user?.name}</h1>
          </div>
          <p className="text-sm text-text-muted">Rating pending · {deals.length} active deals</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <Sidebar items={tabs} active={active} onChange={setActive} />
          <section>
            {active === "Lead Queue" && <AgentLeadQueue leads={leads} />}
            {active === "Active Deals" && <div className="grid gap-4 md:grid-cols-2">{deals.map((deal) => <AgentDealCard key={deal.id} deal={deal} />)}</div>}
            {active === "Messages" && <AgentMessageThread deal={deals[0]} />}
            {active === "Performance" && (
              <div className="grid gap-4 md:grid-cols-4">
                {["Deals closed", "Avg savings", "Rating", "Success fee earned"].map((label) => <div key={label} className="card p-4"><p className="label">{label}</p><p className="font-display mt-3 text-3xl">0</p></div>)}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
