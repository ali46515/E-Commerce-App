import express from "express";
import {
  signup,
  activateAccount,
  completeAccountSetup,
  login,
  logout,
  refreshToken,
  getMe,
  resendActivationEmail,
} from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import {
  authLimiter,
  loginLimiter,
} from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/signup", authLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/refresh", refreshToken);
router.post("/activate/:token", activateAccount);
router.post("/setup", authLimiter, completeAccountSetup);
router.post("/resend-activation", authLimiter, resendActivationEmail);

router.get("/me", auth, getMe);
router.post("/logout", auth, logout);

export default router;
