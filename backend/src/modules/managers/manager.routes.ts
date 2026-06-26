import { Router } from "express";
import * as managerController from "./manager.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), managerController.getAllManagers);
router.post("/", authenticate, authorize("ADMIN"), managerController.createManager);
router.get("/products", authenticate, authorize("MANAGER"), managerController.getManagerProducts);
router.get("/stats", authenticate, authorize("MANAGER"), managerController.getManagerStats);
router.delete("/:id", authenticate, authorize("ADMIN"), managerController.deleteManager);

export default router;
