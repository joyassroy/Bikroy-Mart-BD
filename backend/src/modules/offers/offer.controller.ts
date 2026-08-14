import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { toValidDate } from "../../utils/dateHelper";

export const getActivePromoOffers = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const { type } = req.query;
    const where: any = {
      isActive: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
    };
    if (type) where.type = String(type);
    const offers = await prisma.promoOffer.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return sendSuccess(res, "Promo offers fetched", offers);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getAllPromoOffers = async (req: Request, res: Response) => {
  try {
    const offers = await prisma.promoOffer.findMany({
      include: { items: { include: { product: { select: { id: true, name: true, slug: true, price: true, images: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "All promo offers fetched", offers);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createPromoOffer = async (req: Request, res: Response) => {
  try {
    const { title, description, type, offerPrice, buyQuantity, getQuantity, getDiscount, items, startsAt, endsAt, sortOrder } = req.body;

    const offer = await prisma.promoOffer.create({
      data: {
        title,
        description,
        type,
        offerPrice,
        buyQuantity: buyQuantity || 1,
        getQuantity: getQuantity || 1,
        getDiscount: getDiscount ?? 100,
        startsAt: toValidDate(startsAt),
        endsAt: toValidDate(endsAt),
        sortOrder: sortOrder || 0,
        items: {
          create: items?.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
          })) || [],
        },
      },
      include: { items: { include: { product: true } } },
    });
    return sendSuccess(res, "Promo offer created", offer, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updatePromoOffer = async (req: Request, res: Response) => {
  try {
    const { title, description, type, offerPrice, buyQuantity, getQuantity, getDiscount, items, startsAt, endsAt, isActive, sortOrder } = req.body;
    const offerId = String(req.params.id);

    if (items) {
      await prisma.promoOfferItem.deleteMany({ where: { promoOfferId: offerId } });
    }

    const offer = await prisma.promoOffer.update({
      where: { id: offerId },
      data: {
        title,
        description,
        type,
        offerPrice,
        buyQuantity,
        getQuantity,
        getDiscount,
        startsAt: toValidDate(startsAt),
        endsAt: toValidDate(endsAt),
        isActive,
        sortOrder,
        ...(items && {
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity || 1,
            })),
          },
        }),
      },
      include: { items: { include: { product: true } } },
    });
    return sendSuccess(res, "Promo offer updated", offer);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deletePromoOffer = async (req: Request, res: Response) => {
  try {
    await prisma.promoOffer.delete({ where: { id: String(req.params.id) } });
    return sendSuccess(res, "Promo offer deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
