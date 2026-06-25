import { prisma } from "../prisma/client.js";
import { analyzeCounter } from "../services/claudeService.js";
import { emitToDeal } from "../services/socketService.js";
import { sendEmail, sendSms } from "../services/notificationService.js";

export async function createOffer(req, res) {
  const { dealId, amount, submittedBy = "BUYER", status = "PENDING" } = req.body;
  if (!dealId || !amount) return res.status(400).json({ error: "dealId and amount are required" });

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { offers: { orderBy: { createdAt: "desc" } }, property: true, buyer: true, agent: true }
  });
  if (!deal) return res.status(404).json({ error: "Deal not found" });

  const previous = deal.offers[0];
  const ai = previous
    ? await analyzeCounter({
        buyerOffer: submittedBy === "BUYER" ? amount : previous.amount,
        sellerCounter: submittedBy === "SELLER" ? amount : previous.amount,
        compValue: deal.property.comparableValue,
        daysOnMarket: deal.property.daysOnMarket,
        gap: Math.abs(amount - previous.amount)
      })
    : null;

  const offer = await prisma.offer.create({
    data: { dealId, amount: Number(amount), submittedBy, status, aiAnalysis: ai ? JSON.stringify(ai) : null }
  });
  await prisma.deal.update({ where: { id: dealId }, data: { status: "NEGOTIATING" } });
  emitToDeal(dealId, "offer_received", { offer, aiAnalysis: ai });

  if (submittedBy === "SELLER") {
    await sendEmail({
      to: deal.buyer.email,
      subject: `The seller countered at $${Number(amount).toLocaleString()}`,
      html: `<p>Hero AI recommends: ${ai?.plainEnglishSummary || "Open AskHero to review your next move."}</p>`
    });
    await sendSms({ to: deal.buyer.phone, body: `AskHero: Seller countered at $${Number(amount).toLocaleString()}. Open app to respond.` });
  }

  res.status(201).json({ offer, aiAnalysis: ai });
}

export async function getOffersForDeal(req, res) {
  const offers = await prisma.offer.findMany({
    where: { dealId: req.params.dealId },
    orderBy: { createdAt: "asc" }
  });
  res.json({ offers });
}
