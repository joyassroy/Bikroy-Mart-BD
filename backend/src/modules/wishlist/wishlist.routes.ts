import { Router } from "express";
import * as wishlistController from "./wishlist.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, wishlistController.getWishlist);
router.post("/:productId", authenticate, wishlistController.addToWishlist);
router.delete("/:productId", authenticate, wishlistController.removeFromWishlist);

export default router;
