import { Router } from "express";
import * as categoryController from "./category.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/tree", categoryController.getCategoryTree);
router.get("/:slug", categoryController.getCategoryBySlug);
router.get("/id/:id", categoryController.getCategoryById);
router.post("/", authenticate, authorize("ADMIN"), upload.single("image"), categoryController.createCategory);
router.put("/:id", authenticate, authorize("ADMIN"), upload.single("image"), categoryController.updateCategory);
router.delete("/:id", authenticate, authorize("ADMIN"), categoryController.deleteCategory);

export default router;
