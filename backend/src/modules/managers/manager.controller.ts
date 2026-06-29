import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { hashPassword } from "../../utils/bcrypt";

export const getAllManagers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const where: any = {};
    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim();
      where.user = {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      };
    }

    const managers = await prisma.managerProfile.findMany({
      where,
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
    const { userId, name, email, phone, password, assignedZila, assignedDistrict } = req.body;

    let finalUserId = userId;

    if (!userId) {
      if (!name || !email || !password) {
        return sendError(res, "Name, email and password are required when not linking an existing user", 400);
      }

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, phone ? { phone } : {}].filter(Boolean) },
      });
      if (existingUser) return sendError(res, "User with this email or phone already exists", 400);

      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: { name, email, phone, password: hashedPassword, role: "MANAGER" },
      });
      finalUserId = user.id;
    } else {
      await prisma.user.update({ where: { id: userId }, data: { role: "MANAGER" } });
    }

    const existing = await prisma.managerProfile.findUnique({ where: { userId: finalUserId } });
    if (existing) return sendError(res, "Manager profile already exists", 400);

    const manager = await prisma.managerProfile.create({
      data: { userId: finalUserId, assignedZila, assignedDistrict },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });
    return sendSuccess(res, "Manager created", manager, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getManagerProducts = async (req: AuthRequest, res: Response) => {
  try {
    const manager = await prisma.managerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!manager) return sendError(res, "Manager profile not found", 404);

    const products = await prisma.product.findMany({
      where: { managerId: manager.id },
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

export const deleteManager = async (req: Request, res: Response) => {
  try {
    const manager = await prisma.managerProfile.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!manager) return sendError(res, "Manager not found", 404);

    await prisma.user.delete({ where: { id: manager.userId } });
    return sendSuccess(res, "Manager deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateManager = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, assignedZila, assignedDistrict } = req.body;
    const managerId = String(req.params.id);

    const manager = await prisma.managerProfile.findUnique({
      where: { id: managerId },
    });
    if (!manager) return sendError(res, "Manager not found", 404);

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, NOT: { id: manager.userId } },
      });
      if (existingUser) return sendError(res, "Email already in use", 400);
    }

    const userUpdate: any = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    if (phone !== undefined) userUpdate.phone = phone;

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where: { id: manager.userId }, data: userUpdate });
    }

    const profileUpdate: any = {};
    if (assignedZila !== undefined) profileUpdate.assignedZila = assignedZila;
    if (assignedDistrict !== undefined) profileUpdate.assignedDistrict = assignedDistrict;

    if (Object.keys(profileUpdate).length > 0) {
      await prisma.managerProfile.update({ where: { id: managerId }, data: profileUpdate });
    }

    const updated = await prisma.managerProfile.findUnique({
      where: { id: managerId },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });
    return sendSuccess(res, "Manager updated", updated);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
