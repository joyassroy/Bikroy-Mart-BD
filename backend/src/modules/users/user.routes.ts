import { Router } from "express";
import { Request, Response } from "express";
import prisma from "../../config/db";
import { authenticate, AuthRequest } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        avatar: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Users fetched", users);
  } catch (error: any) {
    return sendError(res, error.message);
  }
});

router.get("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        avatar: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true } },
      },
    });
    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, "User fetched", user);
  } catch (error: any) {
    return sendError(res, error.message);
  }
});

router.put("/:id", authenticate, authorize("ADMIN"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, role } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (role !== undefined) {
      if (!["ADMIN", "MANAGER", "RIDER", "CUSTOMER"].includes(role)) {
        return sendError(res, "Invalid role", 400);
      }
      data.role = role;
    }

    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    return sendSuccess(res, "User updated", user);
  } catch (error: any) {
    if (error.code === "P2025") return sendError(res, "User not found", 404);
    return sendError(res, error.message, 400);
  }
});

router.put("/:id/role", authenticate, authorize("ADMIN"), async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (!["ADMIN", "MANAGER", "RIDER", "CUSTOMER"].includes(role)) {
      return sendError(res, "Invalid role", 400);
    }

    const id = String(req.params.id);

    if (req.user!.userId === id && role !== "ADMIN") {
      return sendError(res, "Cannot change your own role", 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, district: true },
    });
    if (!targetUser) return sendError(res, "User not found", 404);

    if (targetUser.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return sendError(res, "Cannot demote the last admin user", 400);
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    if (role === "MANAGER") {
      const existing = await prisma.managerProfile.findUnique({ where: { userId: id } });
      if (!existing) {
        await prisma.managerProfile.create({
          data: {
            userId: id,
            assignedDistrict: targetUser.district || "Dhaka",
            assignedZila: "",
          },
        });
      }
    }

    if (role === "RIDER") {
      const existing = await prisma.riderProfile.findUnique({ where: { userId: id } });
      if (!existing) {
        await prisma.riderProfile.create({
          data: { userId: id },
        });
      }
    }

    return sendSuccess(res, "User role updated", user);
  } catch (error: any) {
    if (error.code === "P2025") return sendError(res, "User not found", 404);
    return sendError(res, error.message, 400);
  }
});

router.delete("/:id", authenticate, authorize("ADMIN"), async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: String(req.params.id) } });
    if (!user) return sendError(res, "User not found", 404);

    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return sendError(res, "Cannot delete the last admin user", 400);
      }
    }

    if (user.role === "RIDER") {
      const riderProfile = await prisma.riderProfile.findUnique({ where: { userId: user.id } });
      if (riderProfile) {
        const orderCount = await prisma.order.count({ where: { riderId: riderProfile.id } });
        if (orderCount > 0) {
          return sendError(res, "Cannot delete rider with existing orders. Remove or reassign their orders first.", 400);
        }
      }
    }

    if (user.role === "MANAGER") {
      const managerProfile = await prisma.managerProfile.findUnique({ where: { userId: user.id } });
      if (managerProfile) {
        const orderCount = await prisma.order.count({ where: { deliveryDistrict: managerProfile.assignedDistrict } });
        if (orderCount > 0) {
          return sendError(res, "Cannot delete manager with existing orders in their district. Remove or reassign orders first.", 400);
        }
      }
    }

    await prisma.user.delete({ where: { id: String(req.params.id) } });
    return sendSuccess(res, "User deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
});

router.put("/:id/block", authenticate, authorize("ADMIN"), async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userId === String(req.params.id)) {
      return sendError(res, "You cannot block yourself", 400);
    }
    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { isBlocked: true },
    });
    return sendSuccess(res, "User blocked", { id: user.id });
  } catch (error: any) {
    return sendError(res, error.message);
  }
});

router.put("/:id/unblock", authenticate, authorize("ADMIN"), async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { isBlocked: false },
    });
    return sendSuccess(res, "User unblocked", { id: user.id });
  } catch (error: any) {
    return sendError(res, error.message);
  }
});

export default router;
