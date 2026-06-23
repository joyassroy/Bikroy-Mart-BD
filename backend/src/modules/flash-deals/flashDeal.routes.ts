import { Router } from "express";
import * as flashDealController from "./flashDeal.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", flashDealController.getActiveFlashDeals);
router.post("/", authenticate, authorize("ADMIN"), flashDealController.createFlashDeal);
router.put("/:id", authenticate, authorize("ADMIN"), flashDealController.updateFlashDeal);
router.delete("/:id", authenticate, authorize("ADMIN"), flashDealController.deleteFlashDeal);

export default router;
