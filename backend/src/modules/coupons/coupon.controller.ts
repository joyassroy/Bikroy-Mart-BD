import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const validateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { code: String(req.params.code).toUpperCase() } });
    if (!coupon) return sendError(res, "Coupon not found", 404);
    if (!coupon.isActive) return sendError(res, "Coupon is inactive", 400);
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return sendError(res, "Coupon expired", 400);
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return sendError(res, "Coupon usage limit reached", 400);

    return sendSuccess(res, "Coupon valid", {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount,
    });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, minPurchase, maxDiscount, usageLimit, expiresAt } = req.body;
    const coupon = await prisma.coupon.create({
      data: { code: code.toUpperCase(), discountType, discountValue, minPurchase, maxDiscount, usageLimit, expiresAt },
    });
    return sendSuccess(res, "Coupon created", coupon, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await prisma.coupon.update({ where: { id: String(req.params.id) }, data: req.body });
    return sendSuccess(res, "Coupon updated", coupon);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    await prisma.coupon.delete({ where: { id: String(req.params.id) } });
    return sendSuccess(res, "Coupon deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return sendSuccess(res, "Coupons fetched", coupons);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
