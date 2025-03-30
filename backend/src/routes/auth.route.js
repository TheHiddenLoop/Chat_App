import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);

router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

// Password reset routes
router.post("/request-password-reset", requestPasswordReset);
router.put("/reset-password", resetPassword); // Ensure it's PUT

export default router;
