import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { sendError } from "../utils/apiResponse";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      "Validation failed",
      400,
      errors.array().map((err) => ({
        field: (err as any).path,
        message: err.msg,
      }))
    );
  }
  next();
};
