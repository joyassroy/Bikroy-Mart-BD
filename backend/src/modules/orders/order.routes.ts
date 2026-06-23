import { Router } from "express";
import * as orderController from "./order.controller";
import { authenticate, AuthRequest } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.post("/", authenticate, orderController.createOrder);
router.get("/my-orders", authenticate, orderController.getMyOrders);
router.get("/admin/all", authenticate, authorize("ADMIN"), orderController.getAllOrders);
router.get("/manager/local", authenticate, authorize("MANAGER"), orderController.getLocalOrders);
router.get("/:id", authenticate, orderController.getOrderById);
router.put("/:id/status", authenticate, authorize("ADMIN", "MANAGER"), orderController.updateOrderStatus);
router.put("/:id/assign-rider", authenticate, authorize("ADMIN", "MANAGER"), orderController.assignRider);

export default router;
