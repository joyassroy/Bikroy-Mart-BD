import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { sendError } from "../utils/apiResponse";

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, "Insufficient permissions", 403);
    }

    next();
  };
};
