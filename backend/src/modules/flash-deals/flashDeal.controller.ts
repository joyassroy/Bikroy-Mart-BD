import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getActiveFlashDeals = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const { type } = req.query;
    const where: any = { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } };
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
      data: { type: type || "FLASH_DEAL", productId, dealPrice, quantity, startsAt, endsAt },
      include: { product: true },
    });
    return sendSuccess(res, "Flash deal created", deal, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateFlashDeal = async (req: Request, res: Response) => {
  try {
    const deal = await prisma.flashDeal.update({ where: { id: String(req.params.id) }, data: req.body });
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
