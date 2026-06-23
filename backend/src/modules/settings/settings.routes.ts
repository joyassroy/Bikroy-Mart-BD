import { Router } from "express";
import * as settingsController from "./settings.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), settingsController.getSettings);
router.get("/public", settingsController.getPublicSettings);
router.put("/", authenticate, authorize("ADMIN"), settingsController.updateSettings);

export default router;
