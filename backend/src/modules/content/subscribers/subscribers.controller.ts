import { Request, Response } from "express";
import prisma from "../../../config/db";
import { sendSuccess, sendError } from "../../../utils/apiResponse";

export const getSubscribers = async (req: Request, res: Response) => {
  try {
    const subscribers = await prisma.emailSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
    });
    return sendSuccess(res, "Subscribers fetched", subscribers);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createSubscriber = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return sendError(res, "Email is required", 400);
    }

    const subscriber = await prisma.emailSubscriber.upsert({
      where: { email },
      update: { status: "SUBSCRIBED" },
      create: { email, status: "SUBSCRIBED" },
    });
    return sendSuccess(res, "Subscribed successfully", subscriber, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteSubscriber = async (req: Request, res: Response) => {
  try {
    await prisma.emailSubscriber.delete({
      where: { id: String(req.params.id) },
    });
    return sendSuccess(res, "Subscriber deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
