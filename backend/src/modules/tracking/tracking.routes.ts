import { Router } from "express";
import * as trackingController from "./tracking.controller";

const router = Router();

router.get("/:orderId", trackingController.getOrderTracking);
router.get("/:orderId/rider-location", trackingController.getRiderLocation);

export default router;
