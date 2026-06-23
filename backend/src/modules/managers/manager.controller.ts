import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getAllManagers = async (req: Request, res: Response) => {
  try {
    const managers = await prisma.managerProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Managers fetched", managers);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createManager = async (req: Request, res: Response) => {
  try {
    const { userId, assignedZila, assignedDistrict } = req.body;

    const existing = await prisma.managerProfile.findUnique({ where: { userId } });
    if (existing) return sendError(res, "Manager profile already exists", 400);

    const manager = await prisma.managerProfile.create({
      data: { userId, assignedZila, assignedDistrict },
    });
    return sendSuccess(res, "Manager created", manager, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getManagerProducts = async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { managerId: req.user!.userId },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Manager products fetched", products);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getManagerStats = async (req: AuthRequest, res: Response) => {
  try {
    const manager = await prisma.managerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!manager) return sendError(res, "Manager profile not found", 404);

    const [totalProducts, activeProducts, totalOrders, pendingOrders] = await Promise.all([
      prisma.product.count({ where: { managerId: req.user!.userId } }),
      prisma.product.count({ where: { managerId: req.user!.userId, isActive: true } }),
      prisma.order.count({ where: { deliveryDistrict: manager.assignedDistrict } }),
      prisma.order.count({
        where: { deliveryDistrict: manager.assignedDistrict, orderStatus: "PENDING" },
      }),
    ]);

    return sendSuccess(res, "Manager stats fetched", {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      assignedZila: manager.assignedZila,
      assignedDistrict: manager.assignedDistrict,
    });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
