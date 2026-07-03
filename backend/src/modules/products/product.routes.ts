import { Router } from "express";
import * as productController from "./product.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { upload } from "../../middlewares/upload.middleware";
import districtPriceRoutes from "./districtPrice.routes";

const router = Router();

router.use("/:id/district-prices", districtPriceRoutes);

router.get("/", productController.getAllProducts);
router.get("/suggestions", productController.getSearchSuggestions);
router.get("/featured", productController.getFeaturedProducts);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/:id", productController.getProductById);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  upload.array("images", 5),
  productController.createProduct
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  upload.array("images", 5),
  productController.updateProduct
);

router.delete("/:id", authenticate, authorize("ADMIN"), productController.deleteProduct);
router.put("/:id/stock", authenticate, authorize("ADMIN", "MANAGER"), productController.updateStock);

export default router;
