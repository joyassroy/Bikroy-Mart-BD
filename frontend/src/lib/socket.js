"use client";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004";

let socket: any;

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

export default getSocket;
