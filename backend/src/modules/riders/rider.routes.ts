import { Router } from "express";
import * as riderController from "./rider.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, authorize("ADMIN", "MANAGER"), riderController.getAllRiders);
router.post("/", authenticate, authorize("ADMIN"), riderController.createRider);
router.put("/location", authenticate, authorize("RIDER"), riderController.updateLocation);
router.put("/availability", authenticate, authorize("RIDER"), riderController.toggleAvailability);
router.get("/active-delivery", authenticate, authorize("RIDER"), riderController.getActiveDelivery);
router.get("/history", authenticate, authorize("RIDER"), riderController.getDeliveryHistory);
router.delete("/:id", authenticate, authorize("ADMIN"), riderController.deleteRider);
router.put("/:id/accept", authenticate, authorize("RIDER"), riderController.acceptOrder);
router.put("/:id/deliver", authenticate, authorize("RIDER"), riderController.deliverOrder);

export default router;
