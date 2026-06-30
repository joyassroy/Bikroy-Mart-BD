import { Request, Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getProductRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await prisma.productRequest.findMany({
      where: { userId: req.user!.userId },
      include: { product: { include: { category: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Product requests fetched", requests);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const addProductRequest = async (req: AuthRequest, res: Response) => {
  try {
    const productId = String(req.params.productId);
    const existing = await prisma.productRequest.findUnique({
      where: { userId_productId: { userId: req.user!.userId, productId } },
    });
    if (existing) return sendError(res, "Already requested", 400);

    const item = await prisma.productRequest.create({
      data: { userId: req.user!.userId, productId },
    });
    return sendSuccess(res, "Product requested", item, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const removeProductRequest = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.productRequest.delete({
      where: { userId_productId: { userId: req.user!.userId, productId: String(req.params.productId) } },
    });
    return sendSuccess(res, "Product request removed");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
