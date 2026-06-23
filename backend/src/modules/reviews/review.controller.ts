import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: String(req.params.productId) },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Reviews fetched", reviews);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, comment } = req.body;
    const review = await prisma.review.create({
      data: { userId: req.user!.userId, productId, rating, comment },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    return sendSuccess(res, "Review created", review, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: String(req.params.id) } });
    if (!review) return sendError(res, "Review not found", 404);
    if (review.userId !== req.user!.userId) return sendError(res, "Not authorized", 403);

    await prisma.review.delete({ where: { id: String(req.params.id) } });
    return sendSuccess(res, "Review deleted");
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
