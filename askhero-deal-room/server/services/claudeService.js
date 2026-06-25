import Anthropic from "@anthropic-ai/sdk";

const model = "claude-sonnet-4-20250514";
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

async function askJson(prompt, fallback) {
  if (!anthropic) return fallback;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 500,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }]
    });
    console.log("Claude token usage", response.usage);
    const text = response.content?.[0]?.text || "{}";
    return JSON.parse(text.replace(/^```json|```$/g, "").trim());
  } catch (error) {
    console.error("Claude API error", error);
    return fallback;
  }
}

export async function getOfferSuggestion({ listPrice, compValue, daysOnMarket, heroScore, negotiationGrade, preQualLimit }) {
  return askJson(
    `Analyze this property and return only JSON: { "suggestedOffer": number, "reasoning": string, "leverageLevel": "Low"|"Medium"|"High", "confidencePct": number }. Data: listPrice=${listPrice}, compValue=${compValue}, daysOnMarket=${daysOnMarket}, heroScore=${heroScore}, negotiationGrade=${negotiationGrade}, preQualLimit=${preQualLimit}. Reasoning max 2 plain-English sentences.`,
    {
      suggestedOffer: Math.min(preQualLimit || listPrice, Math.round((compValue || listPrice) * 0.98)),
      reasoning: "AskHero could not reach AI, so this fallback uses comparable value and buyer limit.",
      leverageLevel: daysOnMarket > 30 ? "High" : "Medium",
      confidencePct: 60
    }
  );
}

export async function analyzeCounter({ buyerOffer, sellerCounter, compValue, daysOnMarket, gap }) {
  return askJson(
    `Analyze this negotiation and return only JSON: { "acceptanceProbability": number, "recommendation": string, "suggestedCounter": number, "urgency": string, "plainEnglishSummary": string }. Data buyerOffer=${buyerOffer}, sellerCounter=${sellerCounter}, compValue=${compValue}, daysOnMarket=${daysOnMarket}, gap=${gap}. Summary max 40 words, no jargon.`,
    {
      acceptanceProbability: gap < 15000 ? 72 : 48,
      recommendation: "Counter near comparable value while keeping inspection and financing protections.",
      suggestedCounter: Math.round((buyerOffer + sellerCounter) / 2),
      urgency: daysOnMarket > 21 ? "medium" : "high",
      plainEnglishSummary: "The gap is workable. Move closer if the home fits your budget, but keep key protections."
    }
  );
}

export async function getClosingAdvice({ stage, agreedPrice, closingDate, nextDeadline, nextDeadlineLabel }) {
  return askJson(
    `Return only JSON: { "advice": string, "urgency": "low"|"medium"|"high" }. Give one specific tip for stage=${stage}, agreedPrice=${agreedPrice}, closingDate=${closingDate}, nextDeadline=${nextDeadline}, nextDeadlineLabel=${nextDeadlineLabel}. Advice max 30 words.`,
    {
      advice: `Confirm the next ${nextDeadlineLabel || "deadline"} with your agent and upload any requested documents today.`,
      urgency: nextDeadline ? "medium" : "low"
    }
  );
}
