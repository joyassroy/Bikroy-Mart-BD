import { Router } from "express";
import * as blogsController from "./blogs.controller";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { upload } from "../../../middlewares/upload.middleware";

const router = Router();

router.get("/", blogsController.getBlogs);
router.post("/", authenticate, authorize("ADMIN"), upload.single("image"), blogsController.createBlog);
router.put("/:id", authenticate, authorize("ADMIN"), upload.single("image"), blogsController.updateBlog);
router.delete("/:id", authenticate, authorize("ADMIN"), blogsController.deleteBlog);

export default router;
