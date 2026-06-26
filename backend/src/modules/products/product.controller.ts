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
      offer,
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
    if (offer) {
      const now = new Date();
      const flashDeals = await prisma.flashDeal.findMany({
        where: { type: String(offer), isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
        select: { productId: true },
      });
      const productIds = flashDeals.map((d) => d.productId);
      if (productIds.length > 0) {
        where.id = { in: productIds };
      } else {
        where.id = { in: [] };
      }
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
      unit, minQuantity, stock, sku, barcode, categoryId,
      subcategoryId, isFeatured, deliveryTime, badges, managerId,
    } = req.body;

    let images = req.body.images || [];
    if (typeof images === 'string') {
      images = [images];
    }

    if (req.files && Array.isArray(req.files)) {
      const paths = req.files.map((f: any) => `/uploads/${f.filename}`);
      images = [...images, ...paths];
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const product = await prisma.product.create({
      data: {
        name, nameBn, slug, description, descriptionBn, price: parseFloat(price), discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        unit, minQuantity: parseFloat(minQuantity) || 1, stock: parseInt(stock, 10) || 0, sku, barcode, images,
        categoryId, subcategoryId, isFeatured: isFeatured === 'true' || isFeatured === true, deliveryTime, badges: badges ? (Array.isArray(badges) ? badges : [badges]) : [],
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
    const {
      name, nameBn, description, descriptionBn, price, discountPrice,
      unit, minQuantity, stock, sku, barcode, categoryId,
      subcategoryId, isFeatured, deliveryTime, badges, managerId, isActive
    } = req.body;

    let images = req.body.images || [];
    if (typeof images === 'string') {
      images = [images];
    }

    if (req.files && Array.isArray(req.files)) {
      const paths = req.files.map((f: any) => `/uploads/${f.filename}`);
      images = [...images, ...paths];
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (nameBn) updateData.nameBn = nameBn;
    if (description) updateData.description = description;
    if (descriptionBn) updateData.descriptionBn = descriptionBn;
    if (price) updateData.price = parseFloat(price);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (unit) updateData.unit = unit;
    if (minQuantity) updateData.minQuantity = parseFloat(minQuantity);
    if (stock) updateData.stock = parseInt(stock, 10);
    if (sku) updateData.sku = sku;
    if (barcode) updateData.barcode = barcode;
    if (categoryId) updateData.categoryId = categoryId;
    if (subcategoryId) updateData.subcategoryId = subcategoryId;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (deliveryTime) updateData.deliveryTime = deliveryTime;
    if (badges) updateData.badges = Array.isArray(badges) ? badges : [badges];
    if (managerId) updateData.managerId = managerId;
    if (images.length > 0) updateData.images = images; // only update images if new ones are provided, otherwise keep existing
    // if client wants to clear images or keep existing but we received empty, we might need a specific flag, but this is simple

    const product = await prisma.product.update({
      where: { id: String(req.params.id) },
      data: updateData,
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
