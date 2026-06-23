import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getAllSubcategories = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId as string;

    const subcategories = await prisma.subcategory.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
    return sendSuccess(res, "Subcategories fetched", subcategories);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getSubcategoryBySlug = async (req: Request, res: Response) => {
  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { slug: String(req.params.slug) },
      include: {
        category: true,
        products: { where: { isActive: true }, take: 20 },
      },
    });
    if (!subcategory) return sendError(res, "Subcategory not found", 404);
    return sendSuccess(res, "Subcategory fetched", subcategory);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createSubcategory = async (req: Request, res: Response) => {
  try {
    const { name, nameBn, categoryId, image } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const subcategory = await prisma.subcategory.create({
      data: { name, nameBn, slug, categoryId, image },
    });
    return sendSuccess(res, "Subcategory created", subcategory, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateSubcategory = async (req: Request, res: Response) => {
  try {
    const { name, nameBn, image, isActive } = req.body;
    const subcategory = await prisma.subcategory.update({
      where: { id: String(req.params.id) },
      data: { name, nameBn, image, isActive },
    });
    return sendSuccess(res, "Subcategory updated", subcategory);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteSubcategory = async (req: Request, res: Response) => {
  try {
    await prisma.subcategory.delete({ where: { id: String(req.params.id) } });
    return sendSuccess(res, "Subcategory deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
