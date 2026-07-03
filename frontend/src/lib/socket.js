"use client";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5004";

let socket;

export const getSocket = () => {
  if (!socket) {
    const token = typeof window !== "undefined" ? localStorage.getItem("bm-token") : null;
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const resetSocket = (newToken) => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
  if (typeof window !== "undefined" && newToken) {
    socket = io(SOCKET_URL, {
      auth: { token: newToken },
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
};

export default getSocket;
