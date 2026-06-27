import { Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return sendSuccess(res, "Addresses fetched", addresses);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, division, district, upazila, fullAddress, isDefault, latitude, longitude } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user!.userId,
        name,
        phone,
        division,
        district,
        upazila,
        fullAddress,
        isDefault: isDefault || false,
        latitude,
        longitude,
      },
    });
    return sendSuccess(res, "Address created", address, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, division, district, upazila, fullAddress, isDefault, latitude, longitude } = req.body;
    const addressId = req.params.id;

    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.userId },
    });
    if (!existing) return sendError(res, "Address not found", 404);

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: {
        name,
        phone,
        division,
        district,
        upazila,
        fullAddress,
        isDefault,
        latitude,
        longitude,
      },
    });
    return sendSuccess(res, "Address updated", address);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const addressId = req.params.id;
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.userId },
    });
    if (!existing) return sendError(res, "Address not found", 404);

    await prisma.address.delete({ where: { id: addressId } });
    return sendSuccess(res, "Address deleted");
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    const addressId = req.params.id;
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.userId },
    });
    if (!existing) return sendError(res, "Address not found", 404);

    await prisma.address.updateMany({
      where: { userId: req.user!.userId, isDefault: true },
      data: { isDefault: false },
    });

    const address = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
    return sendSuccess(res, "Default address set", address);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
