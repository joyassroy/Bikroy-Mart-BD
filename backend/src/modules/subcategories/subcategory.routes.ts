import { Router } from "express";
import * as subcategoryController from "./subcategory.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.get("/", subcategoryController.getAllSubcategories);
router.get("/:slug", subcategoryController.getSubcategoryBySlug);
router.get("/id/:id", subcategoryController.getSubcategoryById);
router.post("/", authenticate, authorize("ADMIN"), upload.single("image"), subcategoryController.createSubcategory);
router.put("/:id", authenticate, authorize("ADMIN"), upload.single("image"), subcategoryController.updateSubcategory);
router.delete("/:id", authenticate, authorize("ADMIN"), subcategoryController.deleteSubcategory);

export default router;
