import { prisma } from "../prisma/client.js";
import { analyzeCounter } from "../services/claudeService.js";
import { emitToDeal } from "../services/socketService.js";
import { sendEmail, sendSms } from "../services/notificationService.js";

export async function analyzeNegotiation(req, res) {
  const result = await analyzeCounter(req.body);
  res.json(result);
}

export async function submitCounter(req, res) {
  const { dealId, amount } = req.body;
  const deal = await prisma.deal.findUnique({ where: { id: dealId }, include: { agent: true, property: true } });
  if (!deal) return res.status(404).json({ error: "Deal not found" });

  const offer = await prisma.offer.create({
    data: { dealId, amount: Number(amount), submittedBy: "BUYER", status: "COUNTERED" }
  });
  emitToDeal(dealId, "offer_received", { offer, aiAnalysis: null });
  if (deal.agent) {
    await sendEmail({ to: deal.agent.email, subject: "Buyer submitted a counter offer", html: `<p>New counter: $${Number(amount).toLocaleString()}</p>` });
    await sendSms({ to: deal.agent.phone, body: `AskHero: Buyer countered at $${Number(amount).toLocaleString()}.` });
  }
  res.status(201).json({ offer });
}
