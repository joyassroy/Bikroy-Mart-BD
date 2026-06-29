"use client";
import { useEffect, useRef, useState } from "react";
import { Navigation, Maximize2 } from "lucide-react";

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LiveRiderMap({ riderLat, riderLng, destinationLat, destinationLng, height }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const riderMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]).then(([L]) => {
      if (!mounted || !mapRef.current || mapInstance.current) return;

      const center = destinationLat && destinationLng
        ? [destinationLat, destinationLng]
        : riderLat && riderLng
          ? [riderLat, riderLng]
          : [23.8103, 90.4125];

      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView(center, 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapInstance.current);

      L.control.zoom({ position: "topright" }).addTo(mapInstance.current);

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
        polylineRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapInstance.current) return;

    import("leaflet").then((L) => {
      const riderIcon = L.divIcon({
        html: `<div style="background:#0067A0;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);">🛵</div>`,
        iconSize: [36, 36], iconAnchor: [18, 18], className: "",
      });
      const destIcon = L.divIcon({
        html: `<div style="background:#C30000;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);">📍</div>`,
        iconSize: [36, 36], iconAnchor: [18, 18], className: "",
      });

      if (riderLat && riderLng) {
        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng([riderLat, riderLng]);
        } else {
          riderMarkerRef.current = L.marker([riderLat, riderLng], { icon: riderIcon })
            .addTo(mapInstance.current)
            .bindPopup("🛵 Rider Location");
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
            .bindPopup("📍 Delivery Location");
        }
      } else if (destMarkerRef.current) {
        mapInstance.current.removeLayer(destMarkerRef.current);
        destMarkerRef.current = null;
      }

      if (riderLat && riderLng && destinationLat && destinationLng) {
        if (polylineRef.current) {
          polylineRef.current.setLatLngs([[riderLat, riderLng], [destinationLat, destinationLng]]);
        } else {
          polylineRef.current = L.polyline([[riderLat, riderLng], [destinationLat, destinationLng]], {
            color: "#0067A0", weight: 4, opacity: 0.7, dashArray: "8, 8",
          }).addTo(mapInstance.current);
        }
        mapInstance.current.fitBounds(
          [[riderLat, riderLng], [destinationLat, destinationLng]],
          { padding: [60, 60] }
        );
        setDistance(getDistanceKm(riderLat, riderLng, destinationLat, destinationLng));
      } else if (destinationLat && destinationLng) {
        mapInstance.current.setView([destinationLat, destinationLng], 15);
        setDistance(null);
      } else if (riderLat && riderLng) {
        mapInstance.current.setView([riderLat, riderLng], 15);
        setDistance(null);
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

  const recenter = () => {
    if (!mapInstance.current) return;
    if (riderLat && riderLng && destinationLat && destinationLng) {
      mapInstance.current.fitBounds([[riderLat, riderLng], [destinationLat, destinationLng]], { padding: [60, 60] });
    } else if (destinationLat && destinationLng) {
      mapInstance.current.setView([destinationLat, destinationLng], 15);
    } else if (riderLat && riderLng) {
      mapInstance.current.setView([riderLat, riderLng], 15);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg min-h-[300px]"
        style={{ background: "#e5e7eb", height: height || undefined }}
      />
      {distance !== null && (
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-xl px-3 py-2 shadow-lg border border-[#E5E7EB] z-[1000]">
          <p className="text-[11px] font-bold text-[#00215B]">
            {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
          </p>
          <p className="text-[9px] text-[#667085]">away from delivery</p>
        </div>
      )}
      <button
        onClick={recenter}
        className="absolute bottom-3 right-3 w-9 h-9 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F4F7FB] transition z-[1000]"
        title="Re-center map"
      >
        <Maximize2 size={14} className="text-[#00215B]" />
      </button>
    </div>
  );
}
