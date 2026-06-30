import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { AuthRequest } from "../../middlewares/auth.middleware";

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

    // ── Fuzzy search with pg_trgm similarity ──────────────────────────
    if (search) {
      const searchTerm = String(search).trim();
      const conditions: string[] = ['p."isActive" = true'];
      const params: any[] = [searchTerm];
      let idx = 2;

      if (category) {
        conditions.push(`c.slug = $${idx}`);
        params.push(String(category));
        idx++;
      }
      if (subcategory) {
        conditions.push(`s.slug = $${idx}`);
        params.push(String(subcategory));
        idx++;
      }
      if (minPrice) {
        conditions.push(`p.price >= $${idx}`);
        params.push(parseFloat(minPrice as string));
        idx++;
      }
      if (maxPrice) {
        conditions.push(`p.price <= $${idx}`);
        params.push(parseFloat(maxPrice as string));
        idx++;
      }
      if (featured === "true") {
        conditions.push(`p."isFeatured" = true`);
      }
      if (managerId) {
        conditions.push(`p."managerId" = $${idx}`);
        params.push(String(managerId));
        idx++;
      }
      if (includeInactive !== "true") {
        conditions.push(`p."isActive" = true`);
      }

      // District filter
      if (district) {
        const managers = await prisma.managerProfile.findMany({
          where: { assignedDistrict: String(district) },
          select: { id: true },
        });
        const managerIds = managers.map((m) => m.id);
        const dpPlaceholder = `$${idx}`;
        const managerPlaceholders = managerIds.map((_, i) => `$${idx + 1 + i}`);
        idx += 1 + managerIds.length;
        params.push(String(district), ...managerIds);
        const parts = [`EXISTS (SELECT 1 FROM "DistrictPrice" dp WHERE dp."productId" = p.id AND dp."district" = ${dpPlaceholder})`];
        if (managerIds.length > 0) {
          parts.push(`p."managerId" IN (${managerPlaceholders.join(",")})`);
        }
        parts.push(`p."managerId" IS NULL`);
        conditions.push(`(${parts.join(" OR ")})`);
      }

      // Similarity threshold — only include products with some match
      conditions.push(`(
        similarity(p.name, $1) > 0.05
        OR similarity(p."nameBn", $1) > 0.05
        OR similarity(p.description, $1) > 0.05
        OR similarity(p."descriptionBn", $1) > 0.05
      )`);

      const whereClause = conditions.join(" AND ");

      // Relevance score — highest similarity across all fields
      const relevanceExpr = `GREATEST(
        COALESCE(similarity(p.name, $1), 0),
        COALESCE(similarity(p."nameBn", $1), 0),
        COALESCE(similarity(p.description, $1), 0),
        COALESCE(similarity(p."descriptionBn", $1), 0)
      )`;

      const offset = (pageNum - 1) * limitNum;

      const products = await prisma.$queryRawUnsafe(`
        SELECT p.*,
               c.id AS "categoryId_value", c.name AS "categoryName", c.slug AS "categorySlug",
               s.id AS "subcategoryId_value", s.name AS "subcategoryName", s.slug AS "subcategorySlug",
               ${relevanceExpr} AS relevance
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN "Subcategory" s ON p."subcategoryId" = s.id
        WHERE ${whereClause}
        ORDER BY relevance DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `, ...params);

      const countResult = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*)::int AS total
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN "Subcategory" s ON p."subcategoryId" = s.id
        WHERE ${whereClause}
      `, ...params);

      const total = (countResult as any[])[0]?.total || 0;

      const productIds = (products as any[]).map((p) => p.id);

      let districtPriceMap = new Map<string, { price: number; discountPrice: number | null }>();
      if (district && productIds.length > 0) {
        const dpRows = await prisma.districtPrice.findMany({
          where: { productId: { in: productIds }, district: String(district) },
          select: { productId: true, price: true, discountPrice: true },
        });
        for (const dp of dpRows) {
          districtPriceMap.set(dp.productId, { price: dp.price, discountPrice: dp.discountPrice });
        }
      }

      const resolved = (products as any[]).map((p) => {
        const dp = districtPriceMap.get(p.id);
        return {
          id: p.id,
          name: p.name,
          nameBn: p.nameBn,
          slug: p.slug,
          description: p.description,
          descriptionBn: p.descriptionBn,
          price: p.price,
          discountPrice: p.discountPrice,
          unit: p.unit,
          minQuantity: p.minQuantity,
          stock: p.stock,
          sku: p.sku,
          barcode: p.barcode,
          images: p.images,
          isFeatured: p.isFeatured,
          isActive: p.isActive,
          deliveryTime: p.deliveryTime,
          badges: p.badges,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          managerId: p.managerId,
          categoryId: p.categoryId,
          subcategoryId: p.subcategoryId,
          category: p.categoryId_value
            ? { id: p.categoryId_value, name: p.categoryName, slug: p.categorySlug }
            : null,
          subcategory: p.subcategoryId_value
            ? { id: p.subcategoryId_value, name: p.subcategoryName, slug: p.subcategorySlug }
            : null,
          effectivePrice: dp ? dp.price : p.price,
          effectiveDiscountPrice: dp ? dp.discountPrice : p.discountPrice,
          relevance: Number(p.relevance),
        };
      });

      return sendSuccess(res, "Products fetched", resolved, 200, {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      });
    }

    // ── Standard listing (no search) ──────────────────────────────────
    const where: any = {};
    if (includeInactive !== "true") {
      where.isActive = true;
    }
    if (category) where.category = { slug: category };
    if (subcategory) where.subcategory = { slug: subcategory };
    if (managerId) where.managerId = managerId;
    if (featured === "true") where.isFeatured = true;
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

    if (district) {
      const managers = await prisma.managerProfile.findMany({
        where: { assignedDistrict: String(district) },
        select: { id: true },
      });
      const managerIds = managers.map((m) => m.id);
      where.AND = [
        {
          OR: [
            { managerId: { in: managerIds } },
            { managerId: null },
            { districtPrices: { some: { district: String(district) } } },
          ],
        },
      ];
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
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    const productIds = products.map((p) => p.id);
    const salesRows = productIds.length > 0
      ? await prisma.orderItem.groupBy({
          by: ["productId"],
          where: { productId: { in: productIds }, order: { paymentStatus: "PAID" } },
          _sum: { quantity: true },
        })
      : [];
    const salesMap = new Map(salesRows.map((r) => [r.productId, Number(r._sum.quantity || 0)]));

    const resolved = products.map((p) => {
      const { effectivePrice, effectiveDiscountPrice } = resolveDistrictPrice(p, district as string);
      const { districtPrices, ...rest } = p;
      return { ...rest, effectivePrice, effectiveDiscountPrice, totalSales: salesMap.get(p.id) || 0 };
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
        { districtPrices: { some: { district: String(district) } } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        districtPrices: district ? { where: { district: String(district) } } : false,
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    const productIds = products.map((p) => p.id);
    const salesRows = productIds.length > 0
      ? await prisma.orderItem.groupBy({
          by: ["productId"],
          where: { productId: { in: productIds }, order: { paymentStatus: "PAID" } },
          _sum: { quantity: true },
        })
      : [];
    const salesMap = new Map(salesRows.map((r) => [r.productId, Number(r._sum.quantity || 0)]));

    const resolved = products.map((p) => {
      const { effectivePrice, effectiveDiscountPrice } = resolveDistrictPrice(p, district as string);
      const { districtPrices, ...rest } = p;
      return { ...rest, effectivePrice, effectiveDiscountPrice, totalSales: salesMap.get(p.id) || 0 };
    });

    return sendSuccess(res, "Featured products fetched", resolved);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name, nameBn, description, descriptionBn, price, discountPrice,
      unit, minQuantity, stock, sku, barcode, categoryId,
      subcategoryId, isFeatured, deliveryTime, badges,
    } = req.body;

    let images = req.body.images || [];
    if (typeof images === 'string') {
      images = [images];
    }

    if (req.files && Array.isArray(req.files)) {
      const paths = req.files.map((f: any) => f.path || f.filename);
      images = [...images, ...paths];
    }

    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Resolve managerId from authenticated MANAGER user's profile
    let resolvedManagerId: string | null = null;
    if (req.user?.role === "MANAGER") {
      const profile = await prisma.managerProfile.findUnique({ where: { userId: req.user.userId } });
      if (profile) resolvedManagerId = profile.id;
    } else if (req.body.managerId) {
      resolvedManagerId = req.body.managerId;
    }

    const product = await prisma.product.create({
      data: {
        name, nameBn, slug: finalSlug, description, descriptionBn, price: parseFloat(price), discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        unit, minQuantity: parseFloat(minQuantity) || 1, stock: parseInt(stock, 10) || 0, sku, barcode, images,
        categoryId, subcategoryId, isFeatured: isFeatured === 'true' || isFeatured === true, deliveryTime, badges: badges ? (Array.isArray(badges) ? badges : [badges]) : [],
        managerId: resolvedManagerId,
      },
    });
    return sendSuccess(res, "Product created", product, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name, nameBn, description, descriptionBn, price, discountPrice,
      unit, minQuantity, stock, sku, barcode, categoryId,
      subcategoryId, isFeatured, deliveryTime, badges, isActive
    } = req.body;

    const productId = String(req.params.id);
    let existing: any = null;
    let managerProfile: any = null;

    // Manager: fetch product + profile for ownership check and district price logic
    if (req.user?.role === "MANAGER") {
      existing = await prisma.product.findUnique({ where: { id: productId } });
      if (!existing) return sendError(res, "Product not found", 404);
      managerProfile = await prisma.managerProfile.findUnique({ where: { userId: req.user.userId } });
      if (!managerProfile) return sendError(res, "Manager profile not found", 403);
      if (existing.managerId && existing.managerId !== managerProfile.id) {
        return sendError(res, "You can only edit your own or admin-created products", 403);
      }
    }

    // Handle images: if 'existingImages' array is sent, use it as base; otherwise keep current
    let finalImages: string[] | undefined;
    const existingImagesRaw = req.body.existingImages;
    if (existingImagesRaw !== undefined) {
      finalImages = Array.isArray(existingImagesRaw) ? existingImagesRaw : [existingImagesRaw];
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const paths = req.files.map((f: any) => f.path || f.filename);
      finalImages = [...(finalImages || []), ...paths];
    }

    const updateData: any = {};

    if (req.user?.role === "MANAGER") {
      // Managers can update stock and images on base product
      if (stock) updateData.stock = parseInt(stock, 10);
      if (finalImages !== undefined) updateData.images = finalImages;

      // Price/discountPrice → DistrictPrice for manager's assigned district
      if (price || discountPrice !== undefined) {
        const dpWhere = { productId_district: { productId, district: managerProfile.assignedDistrict } };
        const existingDp = await prisma.districtPrice.findUnique({ where: dpWhere });
        const priceVal = price ? parseFloat(price) : (existingDp?.price ?? existing.price);
        const discVal = discountPrice !== undefined
          ? (discountPrice ? parseFloat(discountPrice) : null)
          : (existingDp?.discountPrice ?? null);
        await prisma.districtPrice.upsert({
          where: dpWhere,
          update: { price: priceVal, discountPrice: discVal },
          create: { productId, district: managerProfile.assignedDistrict, price: priceVal, discountPrice: discVal },
        });
      }
    } else {
      // Admin can update everything
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
      if (finalImages !== undefined) updateData.images = finalImages;
    }

    const product = await prisma.product.update({
      where: { id: productId },
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
