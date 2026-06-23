import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "20",
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      sort = "newest",
      featured,
      managerId,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isActive: true };
    if (category) where.category = { slug: category };
    if (subcategory) where.subcategory = { slug: subcategory };
    if (managerId) where.managerId = managerId;
    if (featured === "true") where.isFeatured = true;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { nameBn: { contains: search as string, mode: "insensitive" } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    const orderBy: any = {};
    switch (sort) {
      case "price-low": orderBy.price = "asc"; break;
      case "price-high": orderBy.price = "desc"; break;
      case "popular": orderBy._count = { reviews: "desc" }; break;
      default: orderBy.createdAt = "desc";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    return sendSuccess(res, "Products fetched", products, 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: String(req.params.slug) },
      include: {
        category: true,
        subcategory: true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });
    if (!product) return sendError(res, "Product not found", 404);
    return sendSuccess(res, "Product fetched", product);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: String(req.params.id) },
      include: {
        category: true,
        subcategory: true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });
    if (!product) return sendError(res, "Product not found", 404);
    return sendSuccess(res, "Product fetched", product);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
    return sendSuccess(res, "Featured products fetched", products);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name, nameBn, description, descriptionBn, price, discountPrice,
      unit, minQuantity, stock, sku, barcode, images, categoryId,
      subcategoryId, isFeatured, deliveryTime, badges, managerId,
    } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const product = await prisma.product.create({
      data: {
        name, nameBn, slug, description, descriptionBn, price, discountPrice,
        unit, minQuantity, stock, sku, barcode, images: images || [],
        categoryId, subcategoryId, isFeatured, deliveryTime, badges: badges || [],
        managerId,
      },
    });
    return sendSuccess(res, "Product created", product, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: String(req.params.id) },
      data: req.body,
    });
    return sendSuccess(res, "Product updated", product);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    return sendSuccess(res, "Product deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { stock } = req.body;
    const product = await prisma.product.update({
      where: { id: String(req.params.id) },
      data: { stock },
    });
    return sendSuccess(res, "Stock updated", product);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
