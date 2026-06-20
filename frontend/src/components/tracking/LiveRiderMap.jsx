"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function LiveRiderMap({ riderLat, riderLng, destinationLat, destinationLng }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const center = riderLat && riderLng ? [riderLat, riderLng] : [23.8103, 90.4125]; // Dhaka default

    mapInstance.current = L.map(mapRef.current).setView(center, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    if (riderLat && riderLng) {
      const riderIcon = L.divIcon({
        html: `<div style="background:#0067A0;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">🛵</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        className: "",
      });
      L.marker([riderLat, riderLng], { icon: riderIcon })
        .addTo(mapInstance.current)
        .bindPopup("Rider Location");
    }

    if (destinationLat && destinationLng) {
      const destIcon = L.divIcon({
        html: `<div style="background:#C30000;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        className: "",
      });
      L.marker([destinationLat, destinationLng], { icon: destIcon })
        .addTo(mapInstance.current)
        .bindPopup("Delivery Location");
    }

    if (riderLat && riderLng && destinationLat && destinationLng) {
      mapInstance.current.fitBounds([
        [riderLat, riderLng],
        [destinationLat, destinationLng],
      ], { padding: [50, 50] });
    }
  }, [riderLat, riderLng, destinationLat, destinationLng]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg min-h-[300px]"
      style={{ background: "#e5e7eb" }}
    />
  );
}
