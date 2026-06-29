import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getDistrictPrices = async (req: AuthRequest, res: Response) => {
  try {
    const productId = String(req.params.id);
    const prices = await prisma.districtPrice.findMany({
      where: { productId },
      orderBy: { district: "asc" },
    });
    return sendSuccess(res, "District prices fetched", prices);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const upsertDistrictPrice = async (req: AuthRequest, res: Response) => {
  try {
    const productId = String(req.params.id);
    const { district, price, discountPrice } = req.body;

    if (!district || price === undefined) {
      return sendError(res, "District and price are required", 400);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return sendError(res, "Product not found", 404);

    if (req.user?.role === "MANAGER") {
      const manager = await prisma.managerProfile.findUnique({
        where: { userId: req.user.userId },
      });
      if (!manager) return sendError(res, "Manager profile not found", 404);
      if (manager.assignedDistrict !== district) {
        return sendError(res, "Managers can only set prices for their assigned district", 403);
      }
    }

    const parsed = {
      price: parseFloat(String(price)),
      discountPrice: discountPrice ? parseFloat(String(discountPrice)) : null,
    };

    const districtPrice = await prisma.districtPrice.upsert({
      where: { productId_district: { productId, district } },
      update: parsed,
      create: { productId, district, ...parsed },
    });

    return sendSuccess(res, "District price saved", districtPrice);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteDistrictPrice = async (req: AuthRequest, res: Response) => {
  try {
    const productId = String(req.params.id);
    const district = String(req.params.district);

    const existing = await prisma.districtPrice.findUnique({
      where: { productId_district: { productId, district } },
    });
    if (!existing) return sendError(res, "District price not found", 404);

    await prisma.districtPrice.delete({
      where: { productId_district: { productId, district } },
    });
    return sendSuccess(res, "District price deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
