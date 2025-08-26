// routes/auth.routes.js
import { Router } from "express";
import {
  registerController,
  loginController,
  sendEmailOtpController,
  verifyEmailOtpController,
  startForgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getUsers,
} from "../controler/auth.controler.js";

const router = Router();

router.post("/register", registerController);
router.get("/users", getUsers);
router.post("/login", loginController);
router.post("/send-email-otp", sendEmailOtpController);
router.post("/verify-email-otp", verifyEmailOtpController);
router.post("/forgot-password", startForgotPasswordController);
router.post("/verify-forgot-password", verifyForgotPasswordController);
router.post("/reset-password", resetPasswordController);

export default router;
