import { Request, Response } from "express";
import SSLCommerzPayment from "sslcommerz-lts";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { generateTransactionId } from "../../utils/orderNumber";
import config from "../../config";

export const initPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { name: true, email: true, phone: true } } },
    });

    if (!order) return sendError(res, "Order not found", 404);

    const transactionId = generateTransactionId();

    const sslcz = new SSLCommerzPayment(
      config.sslcommerz.storeId,
      config.sslcommerz.storePass,
      config.sslcommerz.isLive
    );

    const data = {
      total_amount: order.total,
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${config.clientUrl}/payment/success?transactionId=${transactionId}`,
      fail_url: `${config.clientUrl}/payment/fail?transactionId=${transactionId}`,
      cancel_url: `${config.clientUrl}/payment/cancel?transactionId=${transactionId}`,
      ipn_url: `${config.clientUrl}/api/payments/ipn`,
      shipping_method: "Courier",
      product_name: "Bikroy-Mart-BD Order",
      product_category: "General",
      product_profile: "general",
      cus_name: order.user.name,
      cus_email: order.user.email || "",
      cus_add1: order.deliveryAddress,
      cus_phone: order.user.phone || "",
      ship_name: order.user.name,
      ship_add1: order.deliveryAddress,
      ship_city: order.deliveryDistrict,
      ship_state: order.deliveryDivision,
      ship_postcode: "1000",
      ship_country: "Bangladesh",
    };

    const apiResponse = await sslcz.init(data);

    await prisma.order.update({
      where: { id: orderId },
      data: { transactionId },
    });

    return sendSuccess(res, "Payment initialized", {
      transactionId,
      paymentUrl: apiResponse.GatewayPageURL,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const ipnHandler = async (req: Request, res: Response) => {
  try {
    const { val_id } = req.body;

    const sslcz = new SSLCommerzPayment(
      config.sslcommerz.storeId,
      config.sslcommerz.storePass,
      config.sslcommerz.isLive
    );

    const validation = await sslcz.validate({ val_id });

    if (validation.status === "VALID") {
      const order = await prisma.order.findFirst({
        where: { transactionId: validation.tran_id },
      });
      if (order) {
        if (order.orderStatus === "DELIVERED") {
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: "PAID" },
          });
        } else {
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: "PAID", orderStatus: "CONFIRMED" },
          });
        }
      }
      return sendSuccess(res, "IPN validated", validation);
    } else {
      return sendError(res, "Payment validation failed", 400);
    }
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findFirst({
      where: { transactionId: String(req.params.transactionId) },
      select: { id: true, orderNumber: true, paymentStatus: true, orderStatus: true, total: true },
    });
    if (!order) return sendError(res, "Order not found", 404);
    return sendSuccess(res, "Payment status fetched", order);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
