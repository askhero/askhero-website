import { Router } from "express";
import { body } from "express-validator";
import { login, me, register } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("name").notEmpty(),
  register
);
router.post("/login", body("email").isEmail(), body("password").notEmpty(), login);
router.get("/me", requireAuth, me);

export default router;
