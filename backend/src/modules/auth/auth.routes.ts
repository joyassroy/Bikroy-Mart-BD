import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyOtpValidation,
} from "./auth.validation";

const router = Router();

router.post("/register", registerValidation, validate, authController.register);
router.post("/login", loginValidation, validate, authController.login);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validate,
  authController.forgotPassword
);
router.post(
  "/verify-otp",
  verifyOtpValidation,
  validate,
  authController.verifyOtp
);
router.post("/refresh-token", authController.refreshToken);

export default router;
