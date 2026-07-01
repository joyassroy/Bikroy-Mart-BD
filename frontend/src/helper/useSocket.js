"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5004";

export default function useSocket(orderId) {
  const socketRef = useRef(null);
  const [liveRiderLocation, setLiveRiderLocation] = useState(null);
  const [connected, setConnected] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const orderIdRef = useRef(orderId);

  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  useEffect(() => {
    if (!orderId || typeof window === "undefined") return;

    const token = localStorage.getItem("bm-token");
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      if (orderIdRef.current) {
        socket.emit("join-order-room", orderIdRef.current);
      }
    });

    socket.on("rider-location", (data) => {
      setLiveRiderLocation({ lat: data.latitude, lng: data.longitude, timestamp: data.timestamp });
    });

    socket.on("order-status", (data) => {
      setOrderStatus({ orderId: data.orderId, status: data.status, timestamp: data.timestamp });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.io.on("reconnect", () => {
      setConnected(true);
      if (orderIdRef.current) {
        socket.emit("join-order-room", orderIdRef.current);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setOrderStatus(null);
    };
  }, [orderId]);

  const emitRiderLocation = useCallback((orderId, latitude, longitude) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("rider-location-update", { orderId, latitude, longitude });
    }
  }, []);

  return { liveRiderLocation, connected, orderStatus, emitRiderLocation };
}
