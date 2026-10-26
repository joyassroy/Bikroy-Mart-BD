import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { all } = req.query;
    const where: any = {};
    if (all !== "true") {
      where.isActive = true;
    }
    const categories = await prisma.category.findMany({
      where,
      include: {
        subcategories: {
          where: all === "true" ? {} : { isActive: true },
          select: { id: true, name: true, nameBn: true, slug: true, image: true },
        },
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
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

    const maxSortOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });
    const nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const category = await prisma.category.create({
      data: {
        name,
        nameBn,
        slug,
        icon,
        image,
        sortOrder:
          sortOrder !== undefined && sortOrder !== ""
            ? Number(sortOrder)
            : nextSortOrder,
      },
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
    if (sortOrder !== undefined && sortOrder !== "") {
      updateData.sortOrder = Number(sortOrder);
    }

    const category = await prisma.category.update({
      where: { id: String(req.params.id) },
      data: updateData,
    });
    return sendSuccess(res, "Category updated", category);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const reorderCategories = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendError(res, "Category ids are required", 400);
    }

    if (!ids.every((id) => typeof id === "string" && id.trim() !== "")) {
      return sendError(res, "Invalid category ids", 400);
    }

    const uniqueIds = [...new Set(ids)];
    const allCategories = await prisma.category.findMany({
      select: { id: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    const existingIds = new Set(allCategories.map((category) => category.id));

    if (uniqueIds.some((id) => !existingIds.has(id))) {
      return sendError(res, "One or more categories were not found", 400);
    }

    const providedIds = new Set(uniqueIds);
    const missingIds = allCategories
      .map((category) => category.id)
      .filter((id) => !providedIds.has(id));
    const finalIds = [...uniqueIds, ...missingIds];

    await prisma.$transaction(
      finalIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          select: { id: true, name: true, nameBn: true, slug: true, image: true },
        },
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return sendSuccess(res, "Category order updated", categories);
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
