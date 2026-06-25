import HeroScoreBadge from "./HeroScoreBadge";
import GradePill from "./GradePill";

export default function PropertyHeader({ property }) {
  if (!property) return null;
  return (
    <div className="card p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="label">Property</p>
          <h1 className="font-display mt-2 text-3xl">{property.address}</h1>
          <p className="text-sm text-text-muted">{property.city}, {property.state} {property.zip}</p>
        </div>
        <div className="flex items-center gap-3">
          <HeroScoreBadge score={property.heroScore} size="lg" />
          <div className="space-y-2">
            <GradePill label="Value" grade={property.valueGrade} />
            <GradePill label="Negotiation" grade={property.negotiationGrade} />
          </div>
        </div>
      </div>
    </div>
  );
}
