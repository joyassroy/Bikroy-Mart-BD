import { Router } from "express";
import * as productRequestController from "./productRequest.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, productRequestController.getProductRequests);
router.post("/:productId", authenticate, productRequestController.addProductRequest);
router.delete("/:productId", authenticate, productRequestController.removeProductRequest);

export default router;
