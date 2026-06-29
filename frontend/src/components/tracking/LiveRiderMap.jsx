"use client";
import { useEffect, useRef, useCallback, useState } from "react";

export default function LiveRiderMap({ riderLat, riderLng, destinationLat, destinationLng }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const riderMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([L]) => {
      if (!mounted || !mapRef.current || mapInstance.current) return;

      const center = destinationLat && destinationLng
        ? [destinationLat, destinationLng]
        : riderLat && riderLng
          ? [riderLat, riderLng]
          : [23.8103, 90.4125];

      mapInstance.current = L.map(mapRef.current, { zoomControl: true }).setView(center, 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapInstance.current);

      setTimeout(() => {
        if (mapInstance.current) mapInstance.current.invalidateSize();
      }, 200);

      setReady(true);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        riderMarkerRef.current = null;
        destMarkerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapInstance.current) return;

    import("leaflet").then((L) => {
      const riderIcon = L.divIcon({
        html: `<div style="background:#0067A0;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">🛵</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16], className: "",
      });
      const destIcon = L.divIcon({
        html: `<div style="background:#C30000;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">📍</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16], className: "",
      });

      if (riderLat && riderLng) {
        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng([riderLat, riderLng]);
        } else {
          riderMarkerRef.current = L.marker([riderLat, riderLng], { icon: riderIcon })
            .addTo(mapInstance.current)
            .bindPopup("Rider Location");
        }
      } else if (riderMarkerRef.current) {
        mapInstance.current.removeLayer(riderMarkerRef.current);
        riderMarkerRef.current = null;
      }

      if (destinationLat && destinationLng) {
        if (destMarkerRef.current) {
          destMarkerRef.current.setLatLng([destinationLat, destinationLng]);
        } else {
          destMarkerRef.current = L.marker([destinationLat, destinationLng], { icon: destIcon })
            .addTo(mapInstance.current)
            .bindPopup("Delivery Location");
        }
      } else if (destMarkerRef.current) {
        mapInstance.current.removeLayer(destMarkerRef.current);
        destMarkerRef.current = null;
      }

      if (riderLat && riderLng && destinationLat && destinationLng) {
        mapInstance.current.fitBounds([
          [riderLat, riderLng],
          [destinationLat, destinationLng],
        ], { padding: [50, 50] });
      } else if (destinationLat && destinationLng) {
        mapInstance.current.setView([destinationLat, destinationLng], 15);
      } else if (riderLat && riderLng) {
        mapInstance.current.setView([riderLat, riderLng], 15);
      }
    });
  }, [ready, riderLat, riderLng, destinationLat, destinationLng]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const timer = setTimeout(() => {
      if (mapInstance.current) mapInstance.current.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  });

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg min-h-[300px]"
      style={{ background: "#e5e7eb" }}
    />
  );
}
