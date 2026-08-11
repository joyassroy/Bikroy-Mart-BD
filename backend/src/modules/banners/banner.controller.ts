import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getBanners = async (req: Request, res: Response) => {
  try {
    const { position, categoryId, all } = req.query;
    const where: any = {};
    if (position) {
      where.position = position;
      if (!categoryId) {
        where.categoryId = null;
      }
    }
    if (categoryId) where.categoryId = categoryId;
    if (!all) where.isActive = true;

    const banners = await prisma.banner.findMany({ 
      where, 
      orderBy: { sortOrder: "asc" },
      include: { category: true }
    });
    return sendSuccess(res, "Banners fetched", banners);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const { title, subtitle, link, position, bgColor, sortOrder, categoryId } = req.body;
    let image = req.body.image || "";
    let mobileImage = req.body.mobileImage || "";

    if (req.files && Array.isArray(req.files)) {
      const imgFile = req.files.find((f: any) => f.fieldname === 'image');
      if (imgFile) image = imgFile.path || imgFile.filename;
      
      const mImgFile = req.files.find((f: any) => f.fieldname === 'mobileImage');
      if (mImgFile) mobileImage = mImgFile.path || mImgFile.filename;
    }

    const banner = await prisma.banner.create({
      data: { title, subtitle, image, mobileImage, link, position, bgColor, categoryId: categoryId || null, sortOrder: sortOrder ? parseInt(sortOrder) : 0 },
    });
    return sendSuccess(res, "Banner created", banner, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const dataToUpdate: any = { ...req.body };
    if (dataToUpdate.sortOrder) dataToUpdate.sortOrder = parseInt(dataToUpdate.sortOrder);
    if (dataToUpdate.isActive !== undefined) dataToUpdate.isActive = dataToUpdate.isActive === 'true' || dataToUpdate.isActive === true;
    if (dataToUpdate.categoryId !== undefined) dataToUpdate.categoryId = dataToUpdate.categoryId || null;

    if (req.files && Array.isArray(req.files)) {
      const imgFile = req.files.find((f: any) => f.fieldname === 'image');
      if (imgFile) dataToUpdate.image = imgFile.path || imgFile.filename;
      
      const mImgFile = req.files.find((f: any) => f.fieldname === 'mobileImage');
      if (mImgFile) dataToUpdate.mobileImage = mImgFile.path || mImgFile.filename;
    }

    const banner = await prisma.banner.update({ 
      where: { id: String(req.params.id) }, 
      data: dataToUpdate 
    });
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
