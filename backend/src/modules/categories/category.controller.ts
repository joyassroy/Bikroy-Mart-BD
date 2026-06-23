import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        subcategories: {
          where: { isActive: true },
          select: { id: true, name: true, nameBn: true, slug: true, image: true },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return sendSuccess(res, "Categories fetched", categories);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: String(req.params.slug) },
      include: {
        subcategories: { where: { isActive: true } },
        products: { where: { isActive: true }, take: 20 },
      },
    });
    if (!category) return sendError(res, "Category not found", 404);
    return sendSuccess(res, "Category fetched", category);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, nameBn, icon, image, sortOrder } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const category = await prisma.category.create({
      data: { name, nameBn, slug, icon, image, sortOrder: sortOrder || 0 },
    });
    return sendSuccess(res, "Category created", category, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, nameBn, icon, image, isActive, sortOrder } = req.body;
    const category = await prisma.category.update({
      where: { id: String(req.params.id) },
      data: { name, nameBn, icon, image, isActive, sortOrder },
    });
    return sendSuccess(res, "Category updated", category);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await prisma.category.delete({ where: { id: String(req.params.id) } });
    return sendSuccess(res, "Category deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
