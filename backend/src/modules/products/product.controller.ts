import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";

function resolveDistrictPrice(product: any, district?: string) {
  if (!district || !product.districtPrices?.length) {
    return {
      effectivePrice: product.price,
      effectiveDiscountPrice: product.discountPrice,
    };
  }
  const dp = product.districtPrices.find((d: any) => d.district === district);
  if (dp) {
    return {
      effectivePrice: dp.price,
      effectiveDiscountPrice: dp.discountPrice,
    };
  }
  return {
    effectivePrice: product.price,
    effectiveDiscountPrice: product.discountPrice,
  };
}

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
      district,
      includeInactive,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (includeInactive !== "true") {
      where.isActive = true;
    }
    if (category) where.category = { slug: category };
    if (subcategory) where.subcategory = { slug: subcategory };
    if (managerId) where.managerId = managerId;
    if (featured === "true") where.isFeatured = true;
    let searchFilter: any = null;
    if (search) {
      searchFilter = {
        OR: [
          { name: { contains: search as string, mode: "insensitive" } },
          { nameBn: { contains: search as string, mode: "insensitive" } },
          { description: { contains: search as string, mode: "insensitive" } },
        ],
      };
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }
    if (offer) {
      const now = new Date();
      const offerStr = String(offer);
      const isPromoOffer = offerStr === "COMBO" || offerStr === "BOGO";

      if (isPromoOffer) {
        const promoOffers = await prisma.promoOffer.findMany({
          where: { type: offerStr, isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
          include: { items: { select: { productId: true } } },
        });
        const productIds = [...new Set(promoOffers.flatMap((o) => o.items.map((i) => i.productId)))];
        where.id = productIds.length > 0 ? { in: productIds } : { in: [] };
      } else {
        const flashDeals = await prisma.flashDeal.findMany({
          where: { type: offerStr, isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
          select: { productId: true },
        });
        const productIds = flashDeals.map((d) => d.productId);
        where.id = productIds.length > 0 ? { in: productIds } : { in: [] };
      }
    }

    let districtFilter: any = null;
    if (district) {
      const managers = await prisma.managerProfile.findMany({
        where: { assignedDistrict: String(district) },
        select: { id: true },
      });
      const managerIds = managers.map((m) => m.id);
      districtFilter = {
        OR: [
          { managerId: { in: managerIds } },
          { managerId: null },
        ],
      };
    }

    if (searchFilter && districtFilter) {
      where.AND = [searchFilter, districtFilter];
    } else if (searchFilter) {
      Object.assign(where, searchFilter);
    } else if (districtFilter) {
      Object.assign(where, districtFilter);
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
          districtPrices: district ? { where: { district: String(district) } } : false,
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    const resolved = products.map((p) => {
      const { effectivePrice, effectiveDiscountPrice } = resolveDistrictPrice(p, district as string);
      const { districtPrices, ...rest } = p;
      return { ...rest, effectivePrice, effectiveDiscountPrice };
    });

    return sendSuccess(res, "Products fetched", resolved, 200, {
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
    const { district } = req.query;
    const product = await prisma.product.findUnique({
      where: { slug: String(req.params.slug) },
      include: {
        category: true,
        subcategory: true,
        districtPrices: district ? { where: { district: String(district) } } : true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });
    if (!product) return sendError(res, "Product not found", 404);

    const { effectivePrice, effectiveDiscountPrice } = resolveDistrictPrice(product, district as string);
    return sendSuccess(res, "Product fetched", { ...product, effectivePrice, effectiveDiscountPrice });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { district } = req.query;
    const product = await prisma.product.findUnique({
      where: { id: String(req.params.id) },
      include: {
        category: true,
        subcategory: true,
        districtPrices: district ? { where: { district: String(district) } } : true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });
    if (!product) return sendError(res, "Product not found", 404);

    const { effectivePrice, effectiveDiscountPrice } = resolveDistrictPrice(product, district as string);
    return sendSuccess(res, "Product fetched", { ...product, effectivePrice, effectiveDiscountPrice });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const { district } = req.query;
    const where: any = { isActive: true, isFeatured: true };

    if (district) {
      const managers = await prisma.managerProfile.findMany({
        where: { assignedDistrict: String(district) },
        select: { id: true },
      });
      const managerIds = managers.map((m) => m.id);
      where.OR = [
        { managerId: { in: managerIds } },
        { managerId: null },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        districtPrices: district ? { where: { district: String(district) } } : false,
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    const resolved = products.map((p) => {
      const { effectivePrice, effectiveDiscountPrice } = resolveDistrictPrice(p, district as string);
      const { districtPrices, ...rest } = p;
      return { ...rest, effectivePrice, effectiveDiscountPrice };
    });

    return sendSuccess(res, "Featured products fetched", resolved);
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
      const paths = req.files.map((f: any) => f.path || f.filename);
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
      const paths = req.files.map((f: any) => f.path || f.filename);
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
