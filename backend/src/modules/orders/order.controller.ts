import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { generateOrderNumber } from "../../utils/orderNumber";

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      items, subtotal, deliveryCharge, discount, total, paymentMethod,
      deliveryAddress, deliveryDivision, deliveryDistrict, deliveryUpazila,
      deliveryLatitude, deliveryLongitude, customRequirement, notes,
    } = req.body;

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user!.userId,
        subtotal,
        deliveryCharge: deliveryCharge || 0,
        discount: discount || 0,
        total,
        paymentMethod,
        deliveryAddress,
        deliveryDivision,
        deliveryDistrict,
        deliveryUpazila,
        deliveryLatitude,
        deliveryLongitude,
        customRequirement,
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return sendSuccess(res, "Order created successfully", order, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: {
        items: { include: { product: { select: { id: true, name: true, images: true } } } },
        rider: { select: { id: true, currentLat: true, currentLng: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Orders fetched", orders);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: String(req.params.id) },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
        rider: { select: { id: true, currentLat: true, currentLng: true, user: { select: { name: true, phone: true } } } },
      },
    });
    if (!order) return sendError(res, "Order not found", 404);
    return sendSuccess(res, "Order fetched", order);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "20", status, search, district } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const where: any = {};
    if (status) where.orderStatus = status;
    if (district) where.deliveryDistrict = String(district);

    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { phone: { contains: q } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: { include: { product: { select: { id: true, name: true } } } },
          rider: { select: { id: true, user: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    return sendSuccess(res, "Orders fetched", orders, 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: { orderStatus: status },
    });

    try {
      const { getIO } = await import("../../socket/socketHandler");
      const io = getIO();
      io.to(`order-${order.id}`).emit("order-status", {
        orderId: order.id,
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Socket broadcast failed for order status:", err);
    }

    return sendSuccess(res, "Order status updated", order);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const assignRider = async (req: AuthRequest, res: Response) => {
  try {
    const { riderId } = req.body;
    const order = await prisma.order.findUnique({
      where: { id: String(req.params.id) },
      select: { id: true, deliveryDistrict: true, riderId: true },
    });
    if (!order) return sendError(res, "Order not found", 404);

    const rider = await prisma.riderProfile.findUnique({
      where: { id: riderId },
      select: { id: true, assignedZila: true },
    });
    if (!rider) return sendError(res, "Rider not found", 404);

    if (order.deliveryDistrict && rider.assignedZila && order.deliveryDistrict !== rider.assignedZila) {
      return sendError(res, `Rider is assigned to ${rider.assignedZila} but order is for ${order.deliveryDistrict}`, 400);
    }

    const updated = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: { riderId, orderStatus: "OUT_FOR_DELIVERY" },
    });

    try {
      const { getIO } = await import("../../socket/socketHandler");
      const io = getIO();
      io.to(`order-${updated.id}`).emit("order-status", {
        orderId: updated.id,
        status: "OUT_FOR_DELIVERY",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Socket broadcast failed for order status:", err);
    }

    return sendSuccess(res, "Rider assigned", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getLocalOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;
    const manager = await prisma.managerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!manager) return sendError(res, "Manager profile not found", 404);

    const where: any = {
      deliveryDistrict: manager.assignedDistrict,
      orderStatus: { notIn: ["DELIVERED", "CANCELLED"] },
    };

    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { phone: { contains: q } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Local orders fetched", orders);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
