import type { ReactNode } from "react";
import { Car, Landmark, MapPin, ShieldCheck, ShoppingBag, Users } from "lucide-react";
import type { BuyerProfile } from "@/lib/hero/types";

export function HeroBuyerProfileCard({ profile }: { profile: BuyerProfile }) {
  const location = [profile.city, profile.state].filter(Boolean).join(", ") || "Not provided";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-gold-300">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-white/42">Hero Buyer Profile</p>
          <h2 className="text-xl font-bold text-white">Detected buyer intent</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Fact label="Family size" value={profile.familySize ? String(profile.familySize) : "Not provided"} icon={<Users className="h-4 w-4" />} />
        <Fact label="Income" value={profile.income ? formatMoney(profile.income) : "Not provided"} icon={<Landmark className="h-4 w-4" />} />
        <Fact label="City / location" value={location} icon={<MapPin className="h-4 w-4" />} />
        <Fact label="Budget intent" value={profile.budgetIntent === "unknown" ? "Not provided" : titleCase(profile.budgetIntent)} />
        <Fact label="School priority" value={profile.schoolImportance ? "Detected" : "Not provided"} />
        <Fact label="Safety priority" value={profile.safetyImportance ? "Detected" : "Not provided"} icon={<ShieldCheck className="h-4 w-4" />} />
        <Fact label="Grocery / shopping priority" value={profile.groceryImportance ? "Detected" : "Not provided"} icon={<ShoppingBag className="h-4 w-4" />} />
        <Fact label="Commute / lifestyle priority" value={profile.commuteImportance ? "Detected" : "Not provided"} icon={<Car className="h-4 w-4" />} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {profile.priorities.length > 0 ? (
          profile.priorities.map((priority) => (
            <span key={priority} className="rounded-full border border-gold-300/25 bg-gold-400/8 px-3 py-1 text-xs font-semibold text-gold-200">
              {priority}
            </span>
          ))
        ) : (
          <span className="text-sm text-white/48">Add budget, schools, safety, commute, lifestyle, or family details for sharper ranking.</span>
        )}
      </div>
    </section>
  );
}

function Fact({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#070a10]/70 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/38">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}