import { Link } from "react-router-dom";

export default function AgentDealCard({ deal }) {
  const lastOffer = deal.offers?.[0];
  return (
    <Link to={`/deal/${deal.id}`} className="card block p-4 hover:border-gold">
      <p className="label">Active Deal</p>
      <h3 className="mt-2 font-semibold">{deal.property.address}</h3>
      <p className="text-sm text-text-muted">Buyer: {deal.buyer.name}</p>
      <p className="mt-3 text-sm">Stage: {deal.status.replaceAll("_", " ")}</p>
      {lastOffer && <p className="text-sm text-gold">Last offer: ${lastOffer.amount.toLocaleString()}</p>}
    </Link>
  );
}
