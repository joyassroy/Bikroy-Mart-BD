import { Router } from "express";
import * as sponsorsController from "./sponsors.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

// Public - for homepage marquee
router.get("/", sponsorsController.getSponsors);

// Admin only
router.get("/all", authenticate, authorize("ADMIN"), sponsorsController.getAllSponsors);
router.post("/", authenticate, authorize("ADMIN"), upload.single("logo"), sponsorsController.createSponsor);
router.put("/:id", authenticate, authorize("ADMIN"), upload.single("logo"), sponsorsController.updateSponsor);
router.delete("/:id", authenticate, authorize("ADMIN"), sponsorsController.deleteSponsor);

export default router;
