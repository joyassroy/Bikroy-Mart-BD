import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import prisma from "../config/db";
import config from "../config";

let io: Server;

export const initSocket = (server: any) => {
  const allowedOrigins = [
    config.clientUrl,
    "http://localhost:3000",
    "http://localhost:3001",
    "https://bikroy-mart-bd-delta.vercel.app",
    "https://bikroy-mart-bd.vercel.app",
    "https://www.bmaart.com",
    "https://bmaart.com",
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (token) {
        const decoded = verifyAccessToken(token as string);
        (socket as any).userId = decoded.userId;
        (socket as any).userRole = decoded.role;
      }
      next();
    } catch {
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join-order-room", (orderId: string) => {
      socket.join(`order-${orderId}`);
    });

    socket.on("rider-location-update", async (data: { orderId: string; latitude: number; longitude: number }) => {
      try {
        if ((socket as any).userRole !== "RIDER") return;

        const rider = await prisma.riderProfile.findUnique({
          where: { userId: (socket as any).userId },
        });

        if (rider) {
          await prisma.riderProfile.update({
            where: { id: rider.id },
            data: { currentLat: data.latitude, currentLng: data.longitude },
          });
        }

        io.to(`order-${data.orderId}`).emit("rider-location", {
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error updating rider location:", error);
      }
    });

    socket.on("order-status-update", async (data: { orderId: string; status: string }) => {
      io.to(`order-${data.orderId}`).emit("order-status", {
        orderId: data.orderId,
        status: data.status,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};
