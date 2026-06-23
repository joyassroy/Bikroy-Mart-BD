import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user!.userId },
      include: { product: { include: { category: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Wishlist fetched", wishlist);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const productId = String(req.params.productId);
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user!.userId, productId } },
    });
    if (existing) return sendError(res, "Already in wishlist", 400);

    const item = await prisma.wishlist.create({
      data: { userId: req.user!.userId, productId },
    });
    return sendSuccess(res, "Added to wishlist", item, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.wishlist.delete({
      where: { userId_productId: { userId: req.user!.userId, productId: String(req.params.productId) } },
    });
    return sendSuccess(res, "Removed from wishlist");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
