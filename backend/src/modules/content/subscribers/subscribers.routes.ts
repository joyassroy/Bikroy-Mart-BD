import { Router } from "express";
import * as subscribersController from "./subscribers.controller";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), subscribersController.getSubscribers);
router.post("/", subscribersController.createSubscriber); // Public route
router.delete("/:id", authenticate, authorize("ADMIN"), subscribersController.deleteSubscriber);

export default router;
