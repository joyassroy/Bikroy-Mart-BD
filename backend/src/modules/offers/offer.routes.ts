import { Router } from "express";
import * as offerController from "./offer.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", offerController.getActivePromoOffers);
router.get("/admin/all", authenticate, authorize("ADMIN"), offerController.getAllPromoOffers);
router.post("/", authenticate, authorize("ADMIN"), offerController.createPromoOffer);
router.put("/:id", authenticate, authorize("ADMIN"), offerController.updatePromoOffer);
router.delete("/:id", authenticate, authorize("ADMIN"), offerController.deletePromoOffer);

export default router;
