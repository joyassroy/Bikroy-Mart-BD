import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  if (err.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] || "field";
      return sendError(res, `Duplicate value for ${field}`, 400);
    }
    if (err.code === "P2025") {
      return sendError(res, "Record not found", 404);
    }
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  return sendError(res, message, statusCode);
};
