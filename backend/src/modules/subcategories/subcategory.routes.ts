import { Router } from "express";
import * as subcategoryController from "./subcategory.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", subcategoryController.getAllSubcategories);
router.get("/:slug", subcategoryController.getSubcategoryBySlug);
router.post("/", authenticate, authorize("ADMIN"), subcategoryController.createSubcategory);
router.put("/:id", authenticate, authorize("ADMIN"), subcategoryController.updateSubcategory);
router.delete("/:id", authenticate, authorize("ADMIN"), subcategoryController.deleteSubcategory);

export default router;
