import { body } from "express-validator";

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").optional().matches(/^01[3-9]\d{8}$/).withMessage("Valid Bangladeshi phone number required (e.g. 01XXXXXXXXX)"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidation = [
  body("identifier").notEmpty().withMessage("Email or phone number is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
];

export const verifyOtpValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const updateMeValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("phone").optional().matches(/^01[3-9]\d{8}$/).withMessage("Valid Bangladeshi phone number required (e.g. 01XXXXXXXXX)"),
];
