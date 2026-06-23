import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getAllRiders = async (req: Request, res: Response) => {
  try {
    const riders = await prisma.riderProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Riders fetched", riders);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const updateLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude } = req.body;
    const rider = await prisma.riderProfile.update({
      where: { userId: req.user!.userId },
      data: { currentLat: latitude, currentLng: longitude },
    });
    return sendSuccess(res, "Location updated", rider);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const toggleAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const rider = await prisma.riderProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!rider) return sendError(res, "Rider profile not found", 404);

    const updated = await prisma.riderProfile.update({
      where: { userId: req.user!.userId },
      data: { isAvailable: !rider.isAvailable },
    });
    return sendSuccess(res, "Availability updated", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getActiveDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const rider = await prisma.riderProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!rider) return sendError(res, "Rider profile not found", 404);

    const order = await prisma.order.findFirst({
      where: {
        riderId: rider.id,
        orderStatus: { in: ["OUT_FOR_DELIVERY", "SHIPPED"] },
      },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
    });
    return sendSuccess(res, "Active delivery fetched", order);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const acceptOrder = async (req: AuthRequest, res: Response) => {
  try {
    const rider = await prisma.riderProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!rider) return sendError(res, "Rider profile not found", 404);

    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: { riderId: rider.id, orderStatus: "OUT_FOR_DELIVERY" },
    });
    return sendSuccess(res, "Order accepted", order);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deliverOrder = async (req: AuthRequest, res: Response) => {
  try {
    const rider = await prisma.riderProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!rider) return sendError(res, "Rider profile not found", 404);

    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: {
        orderStatus: "DELIVERED",
        actualDelivery: new Date(),
        paymentStatus: req.body.paymentMethod === "COD" ? "PAID" : undefined,
      },
    });

    await prisma.riderProfile.update({
      where: { id: rider.id },
      data: { totalDeliveries: { increment: 1 } },
    });

    return sendSuccess(res, "Order delivered", order);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getDeliveryHistory = async (req: AuthRequest, res: Response) => {
  try {
    const rider = await prisma.riderProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!rider) return sendError(res, "Rider profile not found", 404);

    const orders = await prisma.order.findMany({
      where: { riderId: rider.id, orderStatus: "DELIVERED" },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { actualDelivery: "desc" },
    });
    return sendSuccess(res, "Delivery history fetched", orders);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
