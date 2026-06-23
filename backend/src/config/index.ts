import dotenv from "dotenv";
dotenv.config();

export default {
  port: parseInt(process.env.PORT || "5004", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },

  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },

  sslcommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID || "",
    storePass: process.env.SSLCOMMERZ_STORE_PASS || "",
    isLive: process.env.SSLCOMMERZ_IS_LIVE === "true",
  },
};
