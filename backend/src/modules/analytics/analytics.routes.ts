import { Router } from "express";
import * as analyticsController from "./analytics.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/stats", authenticate, authorize("ADMIN"), analyticsController.getAdminStats);
router.get("/sales-trend", authenticate, authorize("ADMIN"), analyticsController.getSalesTrend);
router.get("/orders-by-status", authenticate, authorize("ADMIN"), analyticsController.getOrdersByStatus);
router.get("/top-categories", authenticate, authorize("ADMIN"), analyticsController.getTopCategories);
router.get("/revenue-by-district", authenticate, authorize("ADMIN"), analyticsController.getRevenueByDistrict);
router.get("/products-by-zila", authenticate, authorize("ADMIN"), analyticsController.getProductsByZila);
router.get("/orders-by-zila", authenticate, authorize("ADMIN"), analyticsController.getOrdersByZila);
router.get("/recent-orders", authenticate, authorize("ADMIN"), analyticsController.getRecentOrders);

export default router;
