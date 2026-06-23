import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";

const DEFAULT_SETTINGS: Record<string, string> = {
  storeName: "Bikroy-Mart-BD",
  storePhone: "16469",
  storeEmail: "info@bikroymart.com",
  storeAddress: "Dhaka, Bangladesh",
  sslcommerzStoreId: "",
  sslcommerzStorePassword: "",
  sslcommerzSandbox: "true",
  freeDeliveryMinimum: "1500",
  defaultDeliveryCharge: "60",
  deliveryWithinDistrict: "60",
  deliveryOutsideDistrict: "120",
  jwtSecret: "",
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPassword: "",
  currency: "BDT",
  timezone: "Asia/Dhaka",
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return sendSuccess(res, "Settings fetched", settingsMap);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getPublicSettings = async (req: Request, res: Response) => {
  try {
    const publicKeys = ["storeName", "storePhone", "storeEmail", "storeAddress", "freeDeliveryMinimum", "defaultDeliveryCharge", "deliveryWithinDistrict", "deliveryOutsideDistrict", "currency"];
    const settings = await prisma.setting.findMany({
      where: { key: { in: publicKeys } },
    });
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return sendSuccess(res, "Settings fetched", settingsMap);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== "object") {
      return sendError(res, "Invalid settings data", 400);
    }

    const operations = Object.entries(updates).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await prisma.$transaction(operations);
    return sendSuccess(res, "Settings updated");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
