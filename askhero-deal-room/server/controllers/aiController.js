import { getClosingAdvice, getOfferSuggestion, analyzeCounter } from "../services/claudeService.js";

export async function offerSuggestion(req, res) {
  res.json(await getOfferSuggestion(req.body));
}

export async function counterAnalysis(req, res) {
  res.json(await analyzeCounter(req.body));
}

export async function closingCoach(req, res) {
  res.json(await getClosingAdvice(req.body));
}
