import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { hashPassword } from "../../utils/bcrypt";

export const getAllRiders = async (req: AuthRequest, res: Response) => {
  try {
    let where: any = {};

    if (req.user?.role === "MANAGER") {
      const manager = await prisma.managerProfile.findUnique({
        where: { userId: req.user.userId },
      });
      if (manager) {
        where.assignedZila = manager.assignedZila;
      }
    }

    const riders = await prisma.riderProfile.findMany({
      where,
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

export const createRider = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, vehicleType, vehicleNumber, licenseNumber, assignedZila } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Name, email and password are required", 400);
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, phone ? { phone } : {}].filter(Boolean) },
    });
    if (existingUser) return sendError(res, "User with this email or phone already exists", 400);

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, role: "RIDER" },
    });

    const rider = await prisma.riderProfile.create({
      data: {
        userId: user.id,
        vehicleType: vehicleType || null,
        vehicleNumber: vehicleNumber || null,
        licenseNumber: licenseNumber || null,
        assignedZila: assignedZila || null,
      },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });

    return sendSuccess(res, "Rider created", rider, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteRider = async (req: Request, res: Response) => {
  try {
    const rider = await prisma.riderProfile.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!rider) return sendError(res, "Rider not found", 404);

    await prisma.user.delete({ where: { id: rider.userId } });
    return sendSuccess(res, "Rider deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateRider = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, vehicleType, vehicleNumber, licenseNumber, assignedZila, isAvailable } = req.body;
    const riderId = String(req.params.id);

    const rider = await prisma.riderProfile.findUnique({
      where: { id: riderId },
    });
    if (!rider) return sendError(res, "Rider not found", 404);

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, NOT: { id: rider.userId } },
      });
      if (existingUser) return sendError(res, "Email already in use", 400);
    }

    const userUpdate: any = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    if (phone !== undefined) userUpdate.phone = phone;

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where: { id: rider.userId }, data: userUpdate });
    }

    const profileUpdate: any = {};
    if (vehicleType !== undefined) profileUpdate.vehicleType = vehicleType;
    if (vehicleNumber !== undefined) profileUpdate.vehicleNumber = vehicleNumber;
    if (licenseNumber !== undefined) profileUpdate.licenseNumber = licenseNumber;
    if (assignedZila !== undefined) profileUpdate.assignedZila = assignedZila;
    if (isAvailable !== undefined) profileUpdate.isAvailable = isAvailable === true || isAvailable === "true";

    if (Object.keys(profileUpdate).length > 0) {
      await prisma.riderProfile.update({ where: { id: riderId }, data: profileUpdate });
    }

    const updated = await prisma.riderProfile.findUnique({
      where: { id: riderId },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });
    return sendSuccess(res, "Rider updated", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
