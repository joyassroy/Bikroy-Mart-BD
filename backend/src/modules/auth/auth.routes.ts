import { Router } from "express";
import multer from "multer";
import path from "path";
import * as authController from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyOtpValidation,
  updateMeValidation,
} from "./auth.validation";

const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, "../../../uploads/avatars"),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const router = Router();

router.post("/register", registerValidation, validate, authController.register);
router.post("/login", loginValidation, validate, authController.login);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);
router.put("/me", authenticate, updateMeValidation, validate, authController.updateMe);
router.post("/me/avatar", authenticate, uploadAvatar.single("avatar"), authController.uploadAvatar);
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
router.post("/google", authController.googleSignIn);

export default router;
