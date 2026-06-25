import { Router } from "express";
import { body } from "express-validator";
import { createOffer, getOffersForDeal } from "../controllers/offerController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.post("/", requireAuth, body("dealId").notEmpty(), body("amount").isNumeric(), createOffer);
router.get("/deal/:dealId", requireAuth, getOffersForDeal);
export default router;
