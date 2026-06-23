import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCategories,
      totalBanners,
      totalCoupons,
      totalFlashDeals,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
      prisma.order.count({ where: { orderStatus: "PENDING" } }),
      prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
      prisma.order.count({ where: { orderStatus: "CANCELLED" } }),
      prisma.category.count(),
      prisma.banner.count(),
      prisma.coupon.count(),
      prisma.flashDeal.count({ where: { isActive: true } }),
    ]);

    const stats = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum?.total || 0,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCategories,
      totalBanners,
      totalCoupons,
      totalFlashDeals,
    };

    return sendSuccess(res, "Admin stats fetched", stats);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getSalesTrend = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.order.groupBy({
      by: ["createdAt"],
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: startDate },
        paymentStatus: "PAID",
      },
      orderBy: { createdAt: "asc" },
    });

    const dailyData: Record<string, { date: string; revenue: number; orders: number }> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      dailyData[key] = { date: key, revenue: 0, orders: 0 };
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().split("T")[0];
      if (dailyData[key]) {
        dailyData[key].revenue += order._sum?.total || 0;
        dailyData[key].orders += order._count;
      }
    }

    return sendSuccess(res, "Sales trend fetched", Object.values(dailyData));
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getOrdersByStatus = async (req: Request, res: Response) => {
  try {
    const statusCounts = await prisma.order.groupBy({
      by: ["orderStatus"],
      _count: true,
    });

    const data = statusCounts.map((s) => ({
      status: s.orderStatus,
      count: s._count,
    }));

    return sendSuccess(res, "Orders by status fetched", data);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getTopCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        _count: { select: { products: true } },
      },
      orderBy: { products: { _count: "desc" } },
      take: 10,
    });

    const data = categories.map((c) => ({
      name: c.name,
      productCount: c._count.products,
    }));

    return sendSuccess(res, "Top categories fetched", data);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getRevenueByDistrict = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.groupBy({
      by: ["deliveryDistrict"],
      _sum: { total: true },
      _count: true,
      where: { paymentStatus: "PAID" },
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    });

    const data = orders.map((o) => ({
      district: o.deliveryDistrict,
      revenue: o._sum?.total || 0,
      orders: o._count,
    }));

    return sendSuccess(res, "Revenue by district fetched", data);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getRecentOrders = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true, unitPrice: true } },
      },
    });

    const data = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.name || "N/A",
      customerEmail: o.user?.email || "N/A",
      total: o.total,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      itemCount: o.items.length,
      createdAt: o.createdAt,
    }));

    return sendSuccess(res, "Recent orders fetched", data);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
