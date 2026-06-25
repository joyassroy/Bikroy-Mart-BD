import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { initSocket } from "./socket/socketHandler";
import config from "./config";
import { errorHandler } from "./middlewares/errorHandler";

// Routes
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import categoryRoutes from "./modules/categories/category.routes";
import subcategoryRoutes from "./modules/subcategories/subcategory.routes";
import productRoutes from "./modules/products/product.routes";
import orderRoutes from "./modules/orders/order.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import riderRoutes from "./modules/riders/rider.routes";
import managerRoutes from "./modules/managers/manager.routes";
import trackingRoutes from "./modules/tracking/tracking.routes";
import bannerRoutes from "./modules/banners/banner.routes";
import couponRoutes from "./modules/coupons/coupon.routes";
import reviewRoutes from "./modules/reviews/review.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import flashDealRoutes from "./modules/flash-deals/flashDeal.routes";
import settingsRoutes from "./modules/settings/settings.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import blogsRoutes from "./modules/content/blogs/blogs.routes";
import subscribersRoutes from "./modules/content/subscribers/subscribers.routes";
import mediaRoutes from "./modules/content/media/media.routes";
import sponsorsRoutes from "./modules/sponsors/sponsors.routes";

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Middleware
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/riders", riderRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/flash-deals", flashDealRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/subscribers", subscribersRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/sponsors", sponsorsRoutes);

// Error handler
app.use(errorHandler);

export { app, httpServer };
