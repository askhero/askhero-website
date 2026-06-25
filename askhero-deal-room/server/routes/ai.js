import { Router } from "express";
import { closingCoach, counterAnalysis, offerSuggestion } from "../controllers/aiController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.post("/offer-suggestion", requireAuth, offerSuggestion);
router.post("/counter-analysis", requireAuth, counterAnalysis);
router.post("/closing-coach", requireAuth, closingCoach);
export default router;
