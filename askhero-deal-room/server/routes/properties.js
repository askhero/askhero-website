import { Router } from "express";
import { getProperty, searchProperties } from "../controllers/propertyController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/search", requireAuth, searchProperties);
router.get("/:id", requireAuth, getProperty);
export default router;
