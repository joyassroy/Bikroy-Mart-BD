import { Router } from "express";
import * as reviewController from "./review.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/product/:productId", reviewController.getProductReviews);
router.post("/", authenticate, reviewController.createReview);
router.delete("/:id", authenticate, reviewController.deleteReview);

export default router;
