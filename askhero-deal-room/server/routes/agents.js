import { Router } from "express";
import { getAgentActiveDeals, getLeads, sendAgentMessage } from "../controllers/agentController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";

const router = Router();
router.get("/leads", requireAuth, requireRole("AGENT"), getLeads);
router.get("/:id/deals", requireAuth, requireRole("AGENT"), getAgentActiveDeals);
router.post("/message", requireAuth, requireRole("AGENT"), sendAgentMessage);
export default router;
