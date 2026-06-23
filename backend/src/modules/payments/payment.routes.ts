import { Router } from "express";
import * as paymentController from "./payment.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/sslcommerz/init", authenticate, paymentController.initPayment);
router.post("/sslcommerz/ipn", paymentController.ipnHandler);
router.get("/:transactionId", authenticate, paymentController.getPaymentStatus);

export default router;
