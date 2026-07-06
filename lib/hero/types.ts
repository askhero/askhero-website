export type BuyerProfile = {
  rawQuery: string;
  income: number | null;
  familySize: number | null;
  city: string | null;
  state: string | null;
  requestedBeds: number | null;
  schoolImportance: boolean;
  safetyImportance: boolean;
  groceryImportance: boolean;
  commuteImportance: boolean;
  budgetIntent: "conservative" | "balanced" | "stretch" | "unknown";
  priorities: string[];
};

export type HeroSafeBudget = {
  annualIncome: number;
  monthlyGrossIncome: number;
  monthlyHousingTarget: number;
  estimatedPurchasePrice: number;
  assumedAnnualRate: number;
  assumedDownPaymentPercent: number;
  termYears: number;
  debtToIncomeTarget: number;
};

export type HeroListing = {
  id: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lot_size: number | null;
  year_built: number | null;
  property_type: string | null;
  status: string | null;
  description: string | null;
  listing_agent_name: string | null;
  listing_agent_email: string | null;
  listing_agent_phone: string | null;
  brokerage_name: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number;
  hero_scores?:
    | {
        total_score: number | null;
        letter_grade: string | null;
        explanation?: string | null;
        buyer_recommendation?: string | null;
        component_scores?: Record<string, unknown> | null;
      }[]
    | null;
};

export type HeroScoreDetails = {
  score: number;
  label: string;
  reasons: string[];
  missingData: string[];
  usedExistingScore: boolean;
};

export type HeroFitScoreDetails = {
  score: number;
  reasons: string[];
  missingData: string[];
  disqualifiers: string[];
};

export type RankedHeroListing = {
  listing: HeroListing;
  heroScore: HeroScoreDetails;
  fitScore: HeroFitScoreDetails;
  summary: string;
  distance?: number;
};