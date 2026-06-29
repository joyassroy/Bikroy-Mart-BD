"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5004";

export default function useSocket(orderId) {
  const socketRef = useRef(null);
  const [liveRiderLocation, setLiveRiderLocation] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!orderId || typeof window === "undefined") return;

    const token = localStorage.getItem("bm-token");
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-order-room", orderId);
    });

    socket.on("rider-location", (data) => {
      setLiveRiderLocation({ lat: data.latitude, lng: data.longitude, timestamp: data.timestamp });
    });

    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [orderId]);

  const emitRiderLocation = useCallback((orderId, latitude, longitude) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("rider-location-update", { orderId, latitude, longitude });
    }
  }, []);

  return { liveRiderLocation, connected, emitRiderLocation };
}
