import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getOrderTracking = async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: String(req.params.orderId) }, { orderNumber: String(req.params.orderId) }] },
      include: {
        rider: {
          select: {
            id: true,
            currentLat: true,
            currentLng: true,
            user: { select: { name: true, phone: true } },
          },
        },
        items: { include: { product: { select: { id: true, name: true, images: true } } } },
      },
    });
    if (!order) return sendError(res, "Order not found", 404);
    return sendSuccess(res, "Tracking fetched", order);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getRiderLocation = async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: String(req.params.orderId) },
      select: {
        orderNumber: true,
        orderStatus: true,
        deliveryAddress: true,
        deliveryLatitude: true,
        deliveryLongitude: true,
        rider: { select: { currentLat: true, currentLng: true, user: { select: { name: true, phone: true } } } },
      },
    });
    if (!order) return sendError(res, "Order not found", 404);
    return sendSuccess(res, "Rider location fetched", order);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
