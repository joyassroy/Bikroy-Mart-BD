import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";

const CUSTOM_REQUEST_STATUS_MAP: Record<string, string> = {
  PENDING: "PENDING",
  MANAGER_REVIEW: "CONFIRMED",
  PRICING_SET: "CONFIRMED",
  CUSTOMER_APPROVED: "PROCESSING",
  CUSTOMER_REJECTED: "CANCELLED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export const getOrderTracking = async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.orderId).trim();

    // First try to find a regular order
    let order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
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

    if (order) {
      let manager = null;
      if (order.deliveryDistrict) {
        const managerProfile = await prisma.managerProfile.findFirst({
          where: { assignedDistrict: order.deliveryDistrict },
          select: {
            id: true,
            assignedZila: true,
            assignedDistrict: true,
            user: { select: { id: true, name: true, phone: true, email: true } },
          },
        });
        manager = managerProfile;
      }

      return sendSuccess(res, "Tracking fetched", {
        ...order,
        deliveryLatitude: order.deliveryLatitude,
        deliveryLongitude: order.deliveryLongitude,
        manager,
        type: "order",
      });
    }

    // If not found as order, try CustomRequest (CR- prefix)
    if (orderId.toUpperCase().startsWith("CR-")) {
      const customRequest = await prisma.customRequest.findFirst({
        where: { OR: [{ id: orderId }, { requestNumber: orderId }] },
        include: {
          user: { select: { id: true, name: true, phone: true } },
          rider: {
            select: {
              id: true,
              currentLat: true,
              currentLng: true,
              user: { select: { name: true, phone: true } },
            },
          },
          order: {
            include: {
              items: { include: { product: { select: { id: true, name: true, images: true } } } },
            },
          },
        },
      });

      if (!customRequest) return sendError(res, "Order not found", 404);

      let manager = null;
      if (customRequest.deliveryDistrict) {
        const managerProfile = await prisma.managerProfile.findFirst({
          where: { assignedDistrict: customRequest.deliveryDistrict },
          select: {
            id: true,
            assignedZila: true,
            assignedDistrict: true,
            user: { select: { id: true, name: true, phone: true, email: true } },
          },
        });
        manager = managerProfile;
      }

      const mappedStatus = CUSTOM_REQUEST_STATUS_MAP[customRequest.status] || customRequest.status;

      return sendSuccess(res, "Tracking fetched", {
        id: customRequest.id,
        orderNumber: customRequest.requestNumber,
        orderStatus: mappedStatus,
        customRequestStatus: customRequest.status,
        createdAt: customRequest.createdAt,
        deliveryAddress: customRequest.deliveryAddress,
        deliveryDivision: customRequest.deliveryDivision,
        deliveryDistrict: customRequest.deliveryDistrict,
        deliveryUpazila: customRequest.deliveryUpazila,
        deliveryLatitude: customRequest.deliveryLatitude,
        deliveryLongitude: customRequest.deliveryLongitude,
        items: customRequest.order?.items || [],
        total: customRequest.totalAmount || 0,
        paymentMethod: customRequest.order?.paymentMethod || "COD",
        paymentStatus: customRequest.paymentStatus || "UNPAID",
        name: customRequest.user?.name || "",
        phone: customRequest.user?.phone || "",
        rider: customRequest.rider || null,
        manager,
        customRequest: {
          id: customRequest.id,
          requestNumber: customRequest.requestNumber,
          productName: customRequest.productName,
          description: customRequest.description,
          quantity: customRequest.quantity,
          unit: customRequest.unit,
          images: customRequest.images,
          quotedPrice: customRequest.quotedPrice,
          deliveryCharge: customRequest.deliveryCharge,
          totalAmount: customRequest.totalAmount,
          status: customRequest.status,
          customerNotes: customRequest.customerNotes,
          managerNotes: customRequest.managerNotes,
        },
        type: "custom_request",
      });
    }

    return sendError(res, "Order not found", 404);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getRiderLocation = async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.orderId).trim();
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
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
