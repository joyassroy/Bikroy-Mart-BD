"use client";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import api from "@/lib/axios";

export default function useRiderGPS(intervalMs = 10000) {
  const user = useSelector((state) => state.user?.data);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== "RIDER" || !navigator.geolocation) return;

    const sendLocation = (lat, lng) => {
      api.put("/riders/location", { latitude: lat, longitude: lng }).catch(() => {});
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user?.id, user?.role]);
}
