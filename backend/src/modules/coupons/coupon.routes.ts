import { Router } from "express";
import * as couponController from "./coupon.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/validate/:code", authenticate, couponController.validateCoupon);
router.get("/", authenticate, authorize("ADMIN"), couponController.getAllCoupons);
router.post("/", authenticate, authorize("ADMIN"), couponController.createCoupon);
router.put("/:id", authenticate, authorize("ADMIN"), couponController.updateCoupon);
router.delete("/:id", authenticate, authorize("ADMIN"), couponController.deleteCoupon);

export default router;
