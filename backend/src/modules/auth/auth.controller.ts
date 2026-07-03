import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as authService from "./auth.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, district } = req.body;
    const result = await authService.register({ name, email, phone, password, district });
    return sendSuccess(res, "Registration successful", result, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    const result = await authService.login({ identifier, password });
    return sendSuccess(res, "Login successful", result);
  } catch (error: any) {
    return sendError(res, error.message, 401);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  return sendSuccess(res, "Logged out successfully");
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getMe(req.user!.userId);
    return sendSuccess(res, "User profile fetched", user);
  } catch (error: any) {
    return sendError(res, error.message, 404);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    return sendSuccess(res, "OTP sent to your email");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    await authService.verifyOtp(email, otp, newPassword);
    return sendSuccess(res, "Password reset successful");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    return sendSuccess(res, "Token refreshed", result);
  } catch (error: any) {
    return sendError(res, error.message, 401);
  }
};

export const googleSignIn = async (req: Request, res: Response) => {
  try {
    const { name, email, image, googleId } = req.body;
    if (!name || !email || !googleId) {
      return sendError(res, "Name, email, and googleId are required", 400);
    }
    const result = await authService.googleSignIn({ name, email, image, googleId });
    return sendSuccess(res, "Google sign-in successful", result);
  } catch (error: any) {
    return sendError(res, error.message, 401);
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    const result = await authService.updateMe(req.user!.userId, { name, phone });
    return sendSuccess(res, "Profile updated", result);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, "No image file provided", 400);
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const result = await authService.updateAvatar(req.user!.userId, avatarUrl);
    return sendSuccess(res, "Avatar updated", result);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
