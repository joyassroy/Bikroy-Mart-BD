import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { toValidDate } from "../../utils/dateHelper";

export const getActiveFlashDeals = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const { type, all } = req.query;
    const where: any = {};
    if (all !== "true") {
      where.isActive = true;
      where.startsAt = { lte: now };
      where.endsAt = { gte: now };
    }
    if (type) where.type = String(type);
    const deals = await prisma.flashDeal.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Flash deals fetched", deals);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createFlashDeal = async (req: Request, res: Response) => {
  try {
    const { type, productId, dealPrice, quantity, startsAt, endsAt } = req.body;
    const deal = await prisma.flashDeal.create({
      data: { type: type || "FLASH_DEAL", productId, dealPrice, quantity, startsAt: toValidDate(startsAt), endsAt: toValidDate(endsAt) },
      include: { product: true },
    });
    return sendSuccess(res, "Flash deal created", deal, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateFlashDeal = async (req: Request, res: Response) => {
  try {
    const { type, productId, dealPrice, quantity, startsAt, endsAt, isActive } = req.body;
    const data: any = {};
    if (type !== undefined) data.type = type;
    if (productId !== undefined) data.productId = productId;
    if (dealPrice !== undefined) data.dealPrice = dealPrice;
    if (quantity !== undefined) data.quantity = quantity;
    if (startsAt !== undefined) data.startsAt = toValidDate(startsAt);
    if (endsAt !== undefined) data.endsAt = toValidDate(endsAt);
    if (isActive !== undefined) data.isActive = isActive;

    const deal = await prisma.flashDeal.update({ where: { id: String(req.params.id) }, data, include: { product: true } });
    return sendSuccess(res, "Flash deal updated", deal);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteFlashDeal = async (req: Request, res: Response) => {
  try {
    await prisma.flashDeal.delete({ where: { id: String(req.params.id) } });
    return sendSuccess(res, "Flash deal deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
