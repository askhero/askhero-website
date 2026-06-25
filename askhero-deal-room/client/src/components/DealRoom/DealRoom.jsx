import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useDeal } from "../../hooks/useDeal";
import { useSocket } from "../../hooks/useSocket";
import LoadingPulse from "../Shared/LoadingPulse";
import Navbar from "../Shared/Navbar";
import PropertyHeader from "../Shared/PropertyHeader";
import DealDashboard from "./DealDashboard";
import NegotiationRoom from "./NegotiationRoom";
import OfferBuilder from "./OfferBuilder";

const tabs = ["01 Offer Builder", "02 Negotiation Room", "03 Deal Dashboard"];

export default function DealRoom() {
  const { dealId } = useParams();
  const { user } = useAuth();
  const { deal, offers, loading, error, refetch } = useDeal(dealId);
  const [active, setActive] = useState(tabs[0]);
  useSocket(dealId, user?.id, {
    offer_received: refetch,
    message: refetch,
    status_changed: refetch
  });

  if (loading) return <><Navbar /><main className="mx-auto max-w-7xl p-4"><LoadingPulse /></main></>;
  if (error || !deal) return <><Navbar /><main className="p-4 text-red-300">{error || "Deal not found"}</main></>;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-5 p-4">
        <PropertyHeader property={deal.property} />
        <nav className="flex gap-4 overflow-x-auto border-b border-border-default">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActive(tab)} className={`whitespace-nowrap px-1 py-3 text-sm ${active === tab ? "border-b-2 border-gold text-gold" : "text-text-muted"}`}>{tab}</button>
          ))}
        </nav>
        {active === tabs[0] && <OfferBuilder deal={deal} onSubmitted={() => { setActive(tabs[1]); refetch(); }} />}
        {active === tabs[1] && <NegotiationRoom deal={deal} offers={offers} refetch={refetch} />}
        {active === tabs[2] && <DealDashboard deal={deal} />}
      </main>
    </>
  );
}
