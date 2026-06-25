import { Router } from "express";
import { createDeal, getAgentDeals, getBuyerDeals, getDeal, updateDealStatus } from "../controllers/dealController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";

const router = Router();
router.post("/", requireAuth, requireRole("BUYER"), createDeal);
router.get("/buyer/:buyerId", requireAuth, getBuyerDeals);
router.get("/agent/:agentId", requireAuth, getAgentDeals);
router.get("/:id", requireAuth, getDeal);
router.patch("/:id/status", requireAuth, updateDealStatus);
export default router;
