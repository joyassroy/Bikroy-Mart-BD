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

export const getCategoryTree = async (req: Request, res: Response) => {
  try {
    const tree = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        icon: true,
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    return sendSuccess(res, "Category tree fetched", tree);
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

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!category) return sendError(res, "Category not found", 404);
    return sendSuccess(res, "Category fetched", category);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, nameBn, icon, sortOrder } = req.body;
    let image = req.body.image;

    if (req.file) {
      image = req.file.path || req.file.filename;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existingCategory = await prisma.category.findUnique({ where: { slug } });
    if (existingCategory) {
      return sendError(res, "Category already exists", 400);
    }

    const category = await prisma.category.create({
      data: { name, nameBn, slug, icon, image, sortOrder: Number(sortOrder) || 0 },
    });
    return sendSuccess(res, "Category created", category, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, nameBn, icon, isActive, sortOrder } = req.body;
    let image = req.body.image;

    if (req.file) {
      image = req.file.path || req.file.filename;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (nameBn) updateData.nameBn = nameBn;
    if (icon) updateData.icon = icon;
    if (image) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

    const category = await prisma.category.update({
      where: { id: String(req.params.id) },
      data: updateData,
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
