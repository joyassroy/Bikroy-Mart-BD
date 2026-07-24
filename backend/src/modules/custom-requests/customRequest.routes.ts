import { Router } from "express";
import * as customRequestController from "./customRequest.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.post("/", authenticate, customRequestController.createCustomRequest);
router.post("/upload", authenticate, upload.array("images", 5), customRequestController.uploadImages);
router.get("/my-requests", authenticate, customRequestController.getMyRequests);
router.get("/admin/all", authenticate, authorize("ADMIN"), customRequestController.getAdminAllRequests);
router.get("/manager/pending", authenticate, authorize("MANAGER"), customRequestController.getManagerPendingRequests);
router.get("/manager/all", authenticate, authorize("MANAGER"), customRequestController.getManagerAllRequests);
router.get("/:id", authenticate, customRequestController.getCustomRequestById);
router.put("/:id/edit", authenticate, customRequestController.updateCustomRequest);
router.put("/:id/quote", authenticate, authorize("MANAGER", "ADMIN"), customRequestController.setQuote);
router.put("/:id/approve", authenticate, customRequestController.approveQuote);
router.put("/:id/reject", authenticate, customRequestController.rejectQuote);
router.put("/:id/status", authenticate, authorize("MANAGER", "ADMIN"), customRequestController.updateStatus);
router.put("/:id/assign-rider", authenticate, authorize("MANAGER", "ADMIN"), customRequestController.assignRider);
router.put("/:id/pay", authenticate, customRequestController.markAsPaid);
router.put("/:id/cancel", authenticate, customRequestController.cancelCustomRequest);
router.put("/:id/payment-status", authenticate, authorize("MANAGER", "ADMIN"), customRequestController.updatePaymentStatus);
router.get("/rider/active", authenticate, authorize("RIDER"), customRequestController.getRiderCustomDeliveries);
router.put("/:id/complete", authenticate, authorize("RIDER"), customRequestController.completeCustomDelivery);

export default router;
