import { httpServer } from "./app";
import config from "./config";
import prisma from "./config/db";

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected via Prisma");

    httpServer.listen(config.port, () => {
      console.log(`Bikroy-Mart-BD API running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
