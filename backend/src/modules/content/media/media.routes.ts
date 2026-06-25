import { Router } from "express";
import * as mediaController from "./media.controller";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { upload } from "../../../middlewares/upload.middleware";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), mediaController.getMedia);
router.post("/", authenticate, authorize("ADMIN"), upload.single("file"), mediaController.uploadMedia);
router.delete("/:id", authenticate, authorize("ADMIN"), mediaController.deleteMedia);

export default router;
