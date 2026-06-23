import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getBanners = async (req: Request, res: Response) => {
  try {
    const { position, all } = req.query;
    const where: any = {};
    if (position) where.position = position;
    if (!all) where.isActive = true;

    const banners = await prisma.banner.findMany({ where, orderBy: { sortOrder: "asc" } });
    return sendSuccess(res, "Banners fetched", banners);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const { title, subtitle, image, mobileImage, link, position, bgColor, sortOrder } = req.body;
    const banner = await prisma.banner.create({
      data: { title, subtitle, image, mobileImage, link, position, bgColor, sortOrder: sortOrder || 0 },
    });
    return sendSuccess(res, "Banner created", banner, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const banner = await prisma.banner.update({ where: { id: String(req.params.id) }, data: req.body });
    return sendSuccess(res, "Banner updated", banner);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    await prisma.banner.delete({ where: { id: String(req.params.id) } });
    return sendSuccess(res, "Banner deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
