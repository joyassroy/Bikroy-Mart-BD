import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { sendError } from "../utils/apiResponse";
import prisma from "../config/db";

export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true, isBlocked: true },
    });

    if (!user) {
      return sendError(res, "User not found", 401);
    }

    if (user.isBlocked) {
      return sendError(res, "Account has been blocked", 403);
    }

    if (!roles.includes(user.role)) {
      return sendError(res, "Insufficient permissions", 403);
    }

    req.user.role = user.role;
    next();
  };
};
