import { Router } from "express";
import * as bannerController from "./banner.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", bannerController.getBanners);
router.post("/", authenticate, authorize("ADMIN"), bannerController.createBanner);
router.put("/:id", authenticate, authorize("ADMIN"), bannerController.updateBanner);
router.delete("/:id", authenticate, authorize("ADMIN"), bannerController.deleteBanner);

export default router;
