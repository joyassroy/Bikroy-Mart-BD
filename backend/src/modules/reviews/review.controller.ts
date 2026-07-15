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

export const getRiderReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.riderReview.findMany({
      where: { riderId: String(req.params.riderId) },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        order: { select: { orderNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Rider reviews fetched", reviews);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createRiderReview = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, riderId, rating, comment } = req.body;

    if (!orderId || !riderId || !rating) {
      return sendError(res, "orderId, riderId, and rating are required", 400);
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return sendError(res, "Order not found", 404);
    if (order.userId !== req.user!.userId) return sendError(res, "Not authorized", 403);
    if (order.orderStatus !== "DELIVERED") return sendError(res, "Order is not delivered yet", 400);

    const existing = await prisma.riderReview.findUnique({
      where: { userId_orderId: { userId: req.user!.userId, orderId } },
    });
    if (existing) return sendError(res, "You have already rated this delivery", 400);

    const riderProfile = await prisma.riderProfile.findUnique({ where: { id: riderId } });
    if (!riderProfile) return sendError(res, "Rider not found", 404);

    const review = await prisma.riderReview.create({
      data: {
        userId: req.user!.userId,
        riderId,
        orderId,
        rating: parseInt(rating),
        comment: comment || null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    const allReviews = await prisma.riderReview.findMany({
      where: { riderId },
      select: { rating: true },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.riderProfile.update({
      where: { id: riderId },
      data: { ratings: Math.round(avgRating * 10) / 10 },
    });

    return sendSuccess(res, "Rider review submitted", review, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
