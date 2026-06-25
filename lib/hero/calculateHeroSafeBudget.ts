import type { BuyerProfile, HeroSafeBudget } from "@/lib/hero/types";

const DEFAULT_ANNUAL_RATE = Number(process.env.HERO_DEFAULT_MORTGAGE_RATE ?? "0.0675");
const DEFAULT_DOWN_PAYMENT_PERCENT = Number(process.env.HERO_DEFAULT_DOWN_PAYMENT_PERCENT ?? "0.2");
const TERM_YEARS = Number(process.env.HERO_DEFAULT_MORTGAGE_TERM_YEARS ?? "30");
const SAFE_DTI_TARGET = 0.28;

export function calculateHeroSafeBudget(profile: BuyerProfile): HeroSafeBudget | null {
  if (!profile.income || profile.income <= 0) return null;

  const monthlyGrossIncome = profile.income / 12;
  const monthlyHousingTarget = monthlyGrossIncome * SAFE_DTI_TARGET;
  const monthlyRate = DEFAULT_ANNUAL_RATE / 12;
  const payments = TERM_YEARS * 12;
  const loanPrincipal =
    monthlyRate > 0
      ? monthlyHousingTarget * ((1 - Math.pow(1 + monthlyRate, -payments)) / monthlyRate)
      : monthlyHousingTarget * payments;
  const estimatedPurchasePrice = loanPrincipal / (1 - DEFAULT_DOWN_PAYMENT_PERCENT);

  return {
    annualIncome: profile.income,
    monthlyGrossIncome,
    monthlyHousingTarget,
    estimatedPurchasePrice,
    assumedAnnualRate: DEFAULT_ANNUAL_RATE,
    assumedDownPaymentPercent: DEFAULT_DOWN_PAYMENT_PERCENT,
    termYears: TERM_YEARS,
    debtToIncomeTarget: SAFE_DTI_TARGET,
  };
}