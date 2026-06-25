import { prisma } from "../prisma/client.js";
import { emitToDeal } from "../services/socketService.js";

export async function getLeads(req, res) {
  const deals = await prisma.deal.findMany({
    where: { agentId: null },
    include: { buyer: true, property: true },
    take: 25
  });
  res.json({ leads: deals });
}

export async function getAgentActiveDeals(req, res) {
  const deals = await prisma.deal.findMany({
    where: { agentId: req.params.id },
    include: { buyer: true, property: true, offers: { orderBy: { createdAt: "desc" } } }
  });
  res.json({ deals });
}

export async function sendAgentMessage(req, res) {
  const { dealId, body } = req.body;
  const message = await prisma.message.create({
    data: { dealId, senderId: req.user.id, body },
    include: { sender: true }
  });
  emitToDeal(dealId, "message", { message });
  res.status(201).json({ message });
}
