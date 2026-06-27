import { Router } from "express";
import * as addressController from "./address.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, addressController.getAddresses);
router.post("/", authenticate, addressController.createAddress);
router.put("/:id", authenticate, addressController.updateAddress);
router.delete("/:id", authenticate, addressController.deleteAddress);
router.put("/:id/default", authenticate, addressController.setDefaultAddress);

export default router;
