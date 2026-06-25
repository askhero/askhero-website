import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Shared/Navbar";
import HeroScoreBadge from "../components/Shared/HeroScoreBadge";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    if (user?.id) api.get(`/deals/buyer/${user.id}`).then((res) => setDeals(res.data.deals || [])).catch(() => setDeals([]));
  }, [user?.id]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl p-4">
        <div className="mb-5 flex items-center justify-between">
          <div><p className="label">Buyer Dashboard</p><h1 className="font-display mt-2 text-4xl">Your active deals</h1></div>
          <Link className="btn" to="/dashboard">Start New Deal</Link>
        </div>
        {deals.length === 0 ? (
          <div className="card p-8 text-text-muted">No active deals yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {deals.map((deal) => (
              <Link key={deal.id} to={`/deal/${deal.id}`} className="card block p-4">
                <div className="mb-3 flex aspect-video items-center justify-center rounded border border-border-default text-text-muted">Property photo placeholder</div>
                <div className="flex items-center justify-between"><div><h2 className="font-semibold">{deal.property.address}</h2><p className="text-sm text-text-muted">{deal.status}</p></div><HeroScoreBadge score={deal.property.heroScore} /></div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
