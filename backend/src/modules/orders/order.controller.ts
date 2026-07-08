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
    const { status, paymentStatus } = req.body;
    const data: any = { orderStatus: status };
    if (paymentStatus) data.paymentStatus = paymentStatus;
    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data,
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

const EDITABLE_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING"];

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      items,
      subtotal,
      total,
      paymentMethod,
      deliveryAddress,
      deliveryDivision,
      deliveryDistrict,
      deliveryUpazila,
      deliveryLatitude,
      deliveryLongitude,
    } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, userId: true, orderStatus: true },
    });

    if (!order) return sendError(res, "Order not found", 404);
    if (order.userId !== req.user!.userId) return sendError(res, "Not authorized", 403);
    if (!EDITABLE_STATUSES.includes(order.orderStatus)) {
      return sendError(res, `Cannot edit order with status "${order.orderStatus}". Only PENDING, CONFIRMED, or PROCESSING orders can be edited.`, 400);
    }

    const updateData: any = {};

    if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress;
    if (deliveryDivision !== undefined) updateData.deliveryDivision = deliveryDivision;
    if (deliveryDistrict !== undefined) updateData.deliveryDistrict = deliveryDistrict;
    if (deliveryUpazila !== undefined) updateData.deliveryUpazila = deliveryUpazila;
    if (deliveryLatitude !== undefined) updateData.deliveryLatitude = deliveryLatitude;
    if (deliveryLongitude !== undefined) updateData.deliveryLongitude = deliveryLongitude;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (subtotal !== undefined) updateData.subtotal = subtotal;
    if (total !== undefined) updateData.total = total;

    if (items && Array.isArray(items)) {
      await prisma.orderItem.deleteMany({ where: { orderId: id } });
      if (items.length > 0) {
        await prisma.orderItem.createMany({
          data: items.map((item: any) => ({
            orderId: id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        });
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return sendSuccess(res, "Order updated", updated);
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
    const { search, status } = req.query;
    const manager = await prisma.managerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!manager) return sendError(res, "Manager profile not found", 404);

    const where: any = {
      deliveryDistrict: manager.assignedDistrict,
    };

    if (status && typeof status === "string" && ["DELIVERED", "CANCELLED"].includes(status)) {
      where.orderStatus = status;
    } else {
      where.orderStatus = { notIn: ["DELIVERED", "CANCELLED"] };
    }

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

const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING"];

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { cancelReason } = req.body;

    if (!cancelReason || typeof cancelReason !== "string" || !cancelReason.trim()) {
      return sendError(res, "Cancellation reason is required", 400);
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, userId: true, orderStatus: true },
    });

    if (!order) return sendError(res, "Order not found", 404);
    if (order.userId !== req.user!.userId) return sendError(res, "Not authorized", 403);

    if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
      return sendError(res, `Cannot cancel order with status "${order.orderStatus}". Only PENDING, CONFIRMED, or PROCESSING orders can be cancelled.`, 400);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { orderStatus: "CANCELLED", cancelReason: cancelReason.trim() },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    try {
      const { getIO } = await import("../../socket/socketHandler");
      const io = getIO();
      io.to(`order-${updated.id}`).emit("order-status", {
        orderId: updated.id,
        status: "CANCELLED",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Socket broadcast failed for order cancellation:", err);
    }

    return sendSuccess(res, "Order cancelled successfully", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
