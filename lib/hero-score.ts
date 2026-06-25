export type HeroScoreInput = {
  price?: number | null;
  sqft?: number | null;
  year_built?: number | null;
  status?: string | null;
  city?: string | null;
  property_type?: string | null;
};

export type HeroScoreOutput = {
  total_score: number;
  letter_grade: string;
  explanation: string;
  buyer_recommendation: string;
  confidence_level: "low" | "medium" | "high";
  component_scores: {
    market_value: number;
    negotiation_power: number;
    neighborhood_quality: number;
    insurance_risk: number;
    property_condition: number;
    growth_potential: number;
  };
};

export function calculateHeroScore(input: HeroScoreInput): HeroScoreOutput {
  const marketValue = scoreMarketValue(input.price, input.sqft);
  const negotiation = input.status === "active" ? 72 : 60;
  const neighborhood = input.city ? 76 : 55;
  const insurance = input.property_type === "condo" ? 82 : 70;
  const condition = input.year_built ? Math.min(90, 45 + (input.year_built - 1950) / 2) : 58;
  const growth = ["Charlotte", "Raleigh", "Atlanta", "Nashville"].some(
    (market) => input.city?.toLowerCase() === market.toLowerCase(),
  )
    ? 84
    : 66;

  const component_scores = {
    market_value: clamp(marketValue),
    negotiation_power: clamp(negotiation),
    neighborhood_quality: clamp(neighborhood),
    insurance_risk: clamp(insurance),
    property_condition: clamp(condition),
    growth_potential: clamp(growth),
  };

  const total_score = Math.round(
    Object.values(component_scores).reduce((sum, score) => sum + score, 0) / 6,
  );

  return {
    total_score,
    letter_grade: toLetterGrade(total_score),
    explanation:
      "Hero Score combines value, leverage, neighborhood, risk, condition, and growth signals into one buyer-focused view.",
    buyer_recommendation:
      total_score >= 80
        ? "Strong candidate for deeper review with your agent."
        : total_score >= 65
          ? "Worth comparing against similar homes before deciding."
          : "Proceed carefully and validate assumptions with professionals.",
    confidence_level: input.price && input.sqft && input.city ? "medium" : "low",
    component_scores,
  };
}

function scoreMarketValue(price?: number | null, sqft?: number | null) {
  if (!price || !sqft || sqft <= 0) {
    return 58;
  }

  const pricePerSqft = price / sqft;
  if (pricePerSqft < 250) return 84;
  if (pricePerSqft < 375) return 76;
  if (pricePerSqft < 500) return 68;
  return 56;
}

function toLetterGrade(score: number) {
  if (score >= 92) return "A+";
  if (score >= 85) return "A";
  if (score >= 78) return "B+";
  if (score >= 70) return "B";
  if (score >= 62) return "C";
  return "D";
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
