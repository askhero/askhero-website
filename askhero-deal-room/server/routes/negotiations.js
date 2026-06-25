import { Router } from "express";
import { analyzeNegotiation, submitCounter } from "../controllers/negotiationController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.post("/analyze", requireAuth, analyzeNegotiation);
router.post("/counter", requireAuth, submitCounter);
export default router;
