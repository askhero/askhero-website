import { formatDistanceToNow } from "date-fns";

export default function NegotiationTimeline({ offers = [] }) {
  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const buyer = offer.submittedBy === "BUYER";
        return (
          <div key={offer.id} className="flex gap-3">
            <span className={`mt-2 h-3 w-3 rounded-full ${buyer ? "bg-gold" : "bg-info"} ${offer.status === "PENDING" ? "animate-pulse" : ""}`} />
            <div className="card flex-1 p-4">
              <div className="flex items-center justify-between">
                <span className={`rounded px-2 py-1 text-xs ${buyer ? "bg-gold text-bg-primary" : "bg-info text-bg-primary"}`}>{buyer ? "You" : "Seller"}</span>
                <span className="text-xs text-text-muted">{formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}</span>
              </div>
              <p className="font-display mt-3 text-2xl">${Number(offer.amount).toLocaleString()}</p>
              <p className="text-sm text-text-muted">{offer.status}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
