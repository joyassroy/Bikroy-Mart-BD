import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { getDistrictPrices, upsertDistrictPrice, deleteDistrictPrice } from "./districtPrice.controller";

const router = Router({ mergeParams: true });

router.get("/", authenticate, authorize("ADMIN", "MANAGER"), getDistrictPrices);
router.post("/", authenticate, authorize("ADMIN", "MANAGER"), upsertDistrictPrice);
router.delete("/:district", authenticate, authorize("ADMIN"), deleteDistrictPrice);

export default router;
