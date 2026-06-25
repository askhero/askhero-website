import { Calculator } from "lucide-react";
import type { HeroSafeBudget } from "@/lib/hero/types";

export function HeroSafeBudgetCard({ budget }: { budget: HeroSafeBudget | null }) {
  return (
    <section className="rounded-2xl border border-gold-300/20 bg-gold-400/[0.055] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400 text-[#030303]">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-gold-200/80">Hero Safe Budget</p>
          <h2 className="text-xl font-bold text-white">Estimated safe budget</h2>
        </div>
      </div>

      {budget ? (
        <>
          <p className="mt-6 text-4xl font-extrabold text-gold-200">{formatMoney(budget.estimatedPurchasePrice)}</p>
          <div className="mt-5 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
            <Metric label="Monthly gross income" value={formatMoney(budget.monthlyGrossIncome)} />
            <Metric label="Safe payment target" value={formatMoney(budget.monthlyHousingTarget)} />
            <Metric label="Housing target" value={`${Math.round(budget.debtToIncomeTarget * 100)}% of gross income`} />
            <Metric label="Mortgage assumption" value={`${(budget.assumedAnnualRate * 100).toFixed(2)}% configurable default`} />
          </div>
          <p className="mt-4 text-xs leading-5 text-white/48">
            Estimate only. Not mortgage, tax, insurance, or lending advice.
          </p>
        </>
      ) : (
        <p className="mt-6 text-sm leading-6 text-white/58">
          Add household income to estimate a safe purchase budget. AskHero will not guess your income or affordability.
        </p>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#070a10]/60 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}