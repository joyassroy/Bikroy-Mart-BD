import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { generateOrderNumber } from "../../utils/orderNumber";
import { getIO } from "../../socket/socketHandler";
import { v4 as uuidv4 } from "uuid";

const generateRequestNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split("-")[0].toUpperCase();
  return `CR-${timestamp}-${random}`;
};

const STATUS_MAP: Record<string, string> = {
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

async function syncOrderStatus(customRequestId: string, newStatus: string) {
  const mappedStatus = STATUS_MAP[newStatus];
  if (!mappedStatus) return;

  const customRequest = await prisma.customRequest.findUnique({
    where: { id: customRequestId },
    select: { id: true },
  });
  if (!customRequest) return;

  const order = await prisma.order.findFirst({
    where: { customRequestId },
  });
  if (!order) return;

  const updateData: any = { orderStatus: mappedStatus };
  if (mappedStatus === "DELIVERED") {
    updateData.actualDelivery = new Date();
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: updateData,
  });

  try {
    const io = getIO();
    io.to(`order-${order.id}`).emit("order-status", {
      orderId: order.id,
      status: mappedStatus,
      timestamp: new Date().toISOString(),
    });
  } catch {}
}

export const createCustomRequest = async (req: AuthRequest, res: Response) => {
  try {
    const {
      productName, description, quantity, unit, images,
      deliveryAddress, deliveryDivision, deliveryDistrict, deliveryUpazila,
      deliveryLatitude, deliveryLongitude, customerNotes,
    } = req.body;

    if (!productName) return sendError(res, "Product name is required", 400);
    if (!deliveryDivision) return sendError(res, "Delivery division is required", 400);
    if (!deliveryDistrict) return sendError(res, "Delivery district is required", 400);

    const requestNumber = generateRequestNumber();

    const customRequest = await prisma.customRequest.create({
      data: {
        requestNumber,
        userId: req.user!.userId,
        productName,
        description: description || "",
        quantity: parseFloat(quantity) || 1,
        unit: unit || "piece",
        images: images || [],
        deliveryAddress: deliveryAddress || `${deliveryUpazila || ""}, ${deliveryDistrict}, ${deliveryDivision}`,
        deliveryDivision,
        deliveryDistrict,
        deliveryUpazila: deliveryUpazila || deliveryDistrict,
        deliveryLatitude: deliveryLatitude ? parseFloat(deliveryLatitude) : null,
        deliveryLongitude: deliveryLongitude ? parseFloat(deliveryLongitude) : null,
        customerNotes: customerNotes || "",
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return sendSuccess(res, "Custom request created successfully", customRequest, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const uploadImages = async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return sendError(res, "No images uploaded", 400);
    }
    const urls = files.map((file) => file.path || file.filename);
    return sendSuccess(res, "Images uploaded successfully", { urls });
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await prisma.customRequest.findMany({
      where: { userId: req.user!.userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        rider: { select: { id: true, user: { select: { name: true, phone: true } }, currentLat: true, currentLng: true } },
        order: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Custom requests fetched", requests);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getCustomRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const customRequest = await prisma.customRequest.findUnique({
      where: { id: String(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        rider: { select: { id: true, user: { select: { name: true, phone: true } }, currentLat: true, currentLng: true } },
        order: true,
      },
    });
    if (!customRequest) return sendError(res, "Custom request not found", 404);
    return sendSuccess(res, "Custom request fetched", customRequest);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const updateCustomRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { productName, description, quantity, unit, images,
      deliveryAddress, deliveryDivision, deliveryDistrict, deliveryUpazila,
      deliveryLatitude, deliveryLongitude, customerNotes } = req.body;

    const customRequest = await prisma.customRequest.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!customRequest) return sendError(res, "Custom request not found", 404);
    if (customRequest.userId !== req.user!.userId) return sendError(res, "Unauthorized", 403);

    const EDITABLE = ["PENDING", "MANAGER_REVIEW"];
    if (!EDITABLE.includes(customRequest.status)) {
      return sendError(res, "Request cannot be edited at this stage", 400);
    }

    const updateData: any = {};
    if (productName !== undefined) updateData.productName = productName;
    if (description !== undefined) updateData.description = description;
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity) || 1;
    if (unit !== undefined) updateData.unit = unit;
    if (images !== undefined) updateData.images = images;
    if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress;
    if (deliveryDivision !== undefined) updateData.deliveryDivision = deliveryDivision;
    if (deliveryDistrict !== undefined) updateData.deliveryDistrict = deliveryDistrict;
    if (deliveryUpazila !== undefined) updateData.deliveryUpazila = deliveryUpazila;
    if (deliveryLatitude !== undefined) updateData.deliveryLatitude = deliveryLatitude ? parseFloat(deliveryLatitude) : null;
    if (deliveryLongitude !== undefined) updateData.deliveryLongitude = deliveryLongitude ? parseFloat(deliveryLongitude) : null;
    if (customerNotes !== undefined) updateData.customerNotes = customerNotes;

    const updated = await prisma.customRequest.update({
      where: { id: String(req.params.id) },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        rider: { select: { id: true, user: { select: { name: true, phone: true } }, currentLat: true, currentLng: true } },
        order: true,
      },
    });

    return sendSuccess(res, "Custom request updated", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const setQuote = async (req: AuthRequest, res: Response) => {
  try {
    const { quotedPrice, deliveryCharge, managerNotes } = req.body;

    const manager = await prisma.managerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!manager) return sendError(res, "Manager profile not found", 404);

    const customRequest = await prisma.customRequest.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!customRequest) return sendError(res, "Custom request not found", 404);

    const totalAmount = parseFloat(quotedPrice) * customRequest.quantity + (parseFloat(deliveryCharge) || 0);

    const updated = await prisma.customRequest.update({
      where: { id: String(req.params.id) },
      data: {
        managerId: req.user!.userId,
        quotedPrice: parseFloat(quotedPrice),
        deliveryCharge: parseFloat(deliveryCharge) || 0,
        totalAmount,
        managerNotes,
        status: "PRICING_SET",
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return sendSuccess(res, "Quote set successfully", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const approveQuote = async (req: AuthRequest, res: Response) => {
  try {
    const customRequest = await prisma.customRequest.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!customRequest) return sendError(res, "Custom request not found", 404);
    if (customRequest.userId !== req.user!.userId) return sendError(res, "Unauthorized", 403);
    if (customRequest.status !== "PRICING_SET") return sendError(res, "Request is not in pricing state", 400);

    const orderNumber = generateOrderNumber();

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.customRequest.update({
        where: { id: String(req.params.id) },
        data: { status: "CUSTOMER_APPROVED" },
      });

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: customRequest.userId,
          customRequestId: customRequest.id,
          subtotal: (customRequest.quotedPrice || 0) * customRequest.quantity,
          deliveryCharge: customRequest.deliveryCharge || 0,
          total: customRequest.totalAmount || 0,
          paymentMethod: "COD",
          deliveryAddress: customRequest.deliveryAddress,
          deliveryDivision: customRequest.deliveryDivision,
          deliveryDistrict: customRequest.deliveryDistrict,
          deliveryUpazila: customRequest.deliveryUpazila,
          deliveryLatitude: customRequest.deliveryLatitude,
          deliveryLongitude: customRequest.deliveryLongitude,
          customRequirement: `${customRequest.productName} (${customRequest.quantity} ${customRequest.unit})`,
          notes: customRequest.customerNotes || "",
          orderStatus: "CONFIRMED",
        },
        include: {
          items: { include: { product: true } },
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      });

      return { updated, order };
    });

    return sendSuccess(res, "Quote approved successfully", result);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const rejectQuote = async (req: AuthRequest, res: Response) => {
  try {
    const { rejectionReason } = req.body;
    const customRequest = await prisma.customRequest.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!customRequest) return sendError(res, "Custom request not found", 404);
    if (customRequest.userId !== req.user!.userId) return sendError(res, "Unauthorized", 403);
    if (customRequest.status !== "PRICING_SET") return sendError(res, "Request is not in pricing state", 400);

    const updated = await prisma.customRequest.update({
      where: { id: String(req.params.id) },
      data: { status: "CUSTOMER_REJECTED", rejectionReason },
    });

    return sendSuccess(res, "Quote rejected", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await prisma.customRequest.update({
      where: { id: String(req.params.id) },
      data: { status },
    });

    await syncOrderStatus(String(req.params.id), status);

    return sendSuccess(res, "Status updated", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const assignRider = async (req: AuthRequest, res: Response) => {
  try {
    const { riderId } = req.body;
    const updated = await prisma.customRequest.update({
      where: { id: String(req.params.id) },
      data: { riderId, status: "OUT_FOR_DELIVERY" },
    });

    const order = await prisma.order.findFirst({
      where: { customRequestId: String(req.params.id) },
    });
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { riderId, orderStatus: "OUT_FOR_DELIVERY" },
      });
      try {
        const io = getIO();
        io.to(`order-${order.id}`).emit("order-status", {
          orderId: order.id,
          status: "OUT_FOR_DELIVERY",
          timestamp: new Date().toISOString(),
        });
      } catch {}
    }

    return sendSuccess(res, "Rider assigned", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getManagerPendingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const manager = await prisma.managerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!manager) return sendError(res, "Manager profile not found", 404);

    const requests = await prisma.customRequest.findMany({
      where: {
        deliveryDistrict: manager.assignedDistrict,
        status: { in: ["PENDING", "MANAGER_REVIEW"] },
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Pending requests fetched", requests);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getManagerAllRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const manager = await prisma.managerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!manager) return sendError(res, "Manager profile not found", 404);

    const where: any = {
      deliveryDistrict: manager.assignedDistrict,
    };
    if (status) where.status = status;

    const requests = await prisma.customRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        rider: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "All requests fetched", requests);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getRiderCustomDeliveries = async (req: AuthRequest, res: Response) => {
  try {
    const rider = await prisma.riderProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!rider) return sendError(res, "Rider profile not found", 404);

    const requests = await prisma.customRequest.findMany({
      where: {
        riderId: rider.id,
        status: { in: ["SHIPPED", "OUT_FOR_DELIVERY"] },
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Custom deliveries fetched", requests);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const completeCustomDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const rider = await prisma.riderProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!rider) return sendError(res, "Rider profile not found", 404);

    const customRequest = await prisma.customRequest.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!customRequest) return sendError(res, "Custom request not found", 404);
    if (customRequest.riderId !== rider.id) return sendError(res, "Not assigned to you", 403);

    const updated = await prisma.customRequest.update({
      where: { id: String(req.params.id) },
      data: { status: "DELIVERED" },
    });

    await prisma.riderProfile.update({
      where: { id: rider.id },
      data: { totalDeliveries: { increment: 1 } },
    });

    await syncOrderStatus(String(req.params.id), "DELIVERED");

    return sendSuccess(res, "Delivery completed", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getAdminAllRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const requests = await prisma.customRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
        rider: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "All custom requests fetched", requests);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const markAsPaid = async (req: AuthRequest, res: Response) => {
  try {
    const customRequest = await prisma.customRequest.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!customRequest) return sendError(res, "Custom request not found", 404);
    if (customRequest.userId !== req.user!.userId) return sendError(res, "Unauthorized", 403);
    if (customRequest.status !== "DELIVERED") return sendError(res, "Order is not delivered yet", 400);

    const updated = await prisma.customRequest.update({
      where: { id: String(req.params.id) },
      data: { paymentStatus: "PAID" },
    });

    const order = await prisma.order.findFirst({
      where: { customRequestId: String(req.params.id) },
    });
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID" },
      });
    }

    return sendSuccess(res, "Payment confirmed", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentStatus } = req.body;
    if (!["UNPAID", "PAID", "REFUNDED"].includes(paymentStatus)) {
      return sendError(res, "Invalid payment status", 400);
    }

    const updated = await prisma.customRequest.update({
      where: { id: String(req.params.id) },
      data: { paymentStatus },
    });

    const order = await prisma.order.findFirst({
      where: { customRequestId: String(req.params.id) },
    });
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: paymentStatus as any },
      });
    }

    return sendSuccess(res, "Payment status updated", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const cancelCustomRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { cancelReason } = req.body;
    const customRequest = await prisma.customRequest.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!customRequest) return sendError(res, "Custom request not found", 404);
    if (customRequest.userId !== req.user!.userId) return sendError(res, "Unauthorized", 403);

    const CANCELLABLE = ["PENDING", "MANAGER_REVIEW", "PRICING_SET", "CUSTOMER_APPROVED"];
    if (!CANCELLABLE.includes(customRequest.status)) {
      return sendError(res, "Request cannot be cancelled at this stage", 400);
    }

    const updated = await prisma.customRequest.update({
      where: { id: String(req.params.id) },
      data: { status: "CANCELLED", rejectionReason: cancelReason || "" },
    });

    const order = await prisma.order.findFirst({
      where: { customRequestId: String(req.params.id) },
    });
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { orderStatus: "CANCELLED", cancelReason: cancelReason || "" },
      });
      try {
        const io = getIO();
        io.to(`order-${order.id}`).emit("order-status", {
          orderId: order.id,
          status: "CANCELLED",
          timestamp: new Date().toISOString(),
        });
      } catch {}
    }

    return sendSuccess(res, "Request cancelled", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
