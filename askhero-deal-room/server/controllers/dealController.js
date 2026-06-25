import { prisma } from "../prisma/client.js";

const includeDeal = {
  property: true,
  buyer: true,
  agent: true,
  offers: { orderBy: { createdAt: "asc" } },
  contingencies: true,
  checklistItems: true,
  messages: { include: { sender: true }, orderBy: { createdAt: "asc" } }
};

export async function createDeal(req, res) {
  const { propertyId, agentId } = req.body;
  if (!propertyId) return res.status(400).json({ error: "propertyId is required" });

  const deal = await prisma.deal.create({
    data: {
      propertyId,
      buyerId: req.user.id,
      agentId,
      contingencies: {
        create: [
          { type: "Inspection", details: "Buyer may inspect the property." },
          { type: "Financing", details: "Offer depends on financing approval." },
          { type: "Appraisal", details: "Offer depends on appraisal review." },
          { type: "Sale of Home", enabled: false, details: "Buyer home sale contingency." }
        ]
      }
    },
    include: includeDeal
  });
  res.status(201).json({ deal });
}

export async function getDeal(req, res) {
  const deal = await prisma.deal.findUnique({ where: { id: req.params.id }, include: includeDeal });
  if (!deal) return res.status(404).json({ error: "Deal not found" });
  res.json({ deal });
}

export async function getBuyerDeals(req, res) {
  const deals = await prisma.deal.findMany({
    where: { buyerId: req.params.buyerId },
    include: includeDeal,
    orderBy: { updatedAt: "desc" }
  });
  res.json({ deals });
}

export async function getAgentDeals(req, res) {
  const deals = await prisma.deal.findMany({
    where: { agentId: req.params.agentId },
    include: includeDeal,
    orderBy: { updatedAt: "desc" }
  });
  res.json({ deals });
}

export async function updateDealStatus(req, res) {
  const { status } = req.body;
  const deal = await prisma.deal.update({ where: { id: req.params.id }, data: { status }, include: includeDeal });

  if (status === "OFFER_ACCEPTED") {
    await prisma.checklistItem.createMany({
      data: ["Schedule Inspection", "Upload Mortgage Docs", "Review Title Report", "Sign Disclosures", "Final Walkthrough", "Wire Closing Funds"].map((label, index) => ({
        dealId: deal.id,
        label,
        dueDate: new Date(Date.now() + (index + 2) * 86400000),
        priority: index < 2 ? "high" : "normal"
      })),
      skipDuplicates: true
    });
  }

  res.json({ deal });
}
