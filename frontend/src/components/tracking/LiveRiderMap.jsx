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

export default function LiveRiderMap({ riderLat, riderLng, destinationLat, destinationLng, customerLat, customerLng, height }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const riderMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
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
        customerMarkerRef.current = null;
        polylineRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapInstance.current) return;

    import("leaflet").then((L) => {
      const riderIcon = L.divIcon({
        html: `<div style="display:flex;flex-direction:column;align-items:center;">
          <div style="background:#0067A0;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3.5-3.5 2-3 4.5 3h3"/></svg>
          </div>
          <span style="background:#0067A0;color:white;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;margin-top:2px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.25);">Rider</span>
        </div>`,
        iconSize: [36, 48], iconAnchor: [18, 48], className: "",
      });
      const destIcon = L.divIcon({
        html: `<div style="display:flex;flex-direction:column;align-items:center;">
          <div style="background:#C30000;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
          </div>
          <span style="background:#C30000;color:white;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;margin-top:2px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.25);">Delivery</span>
        </div>`,
        iconSize: [36, 48], iconAnchor: [18, 48], className: "",
      });
      const customerIcon = L.divIcon({
        html: `<div style="display:flex;flex-direction:column;align-items:center;">
          <div style="background:#16A34A;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </div>
          <span style="background:#16A34A;color:white;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;margin-top:2px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.25);">Customer</span>
        </div>`,
        iconSize: [36, 48], iconAnchor: [18, 48], className: "",
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

      if (customerLat && customerLng) {
        if (customerMarkerRef.current) {
          customerMarkerRef.current.setLatLng([customerLat, customerLng]);
        } else {
          customerMarkerRef.current = L.marker([customerLat, customerLng], { icon: customerIcon })
            .addTo(mapInstance.current)
            .bindPopup("Customer Location");
        }
      } else if (customerMarkerRef.current) {
        mapInstance.current.removeLayer(customerMarkerRef.current);
        customerMarkerRef.current = null;
      }

      const points = [
        riderLat && riderLng ? [riderLat, riderLng] : null,
        destinationLat && destinationLng ? [destinationLat, destinationLng] : null,
        customerLat && customerLng ? [customerLat, customerLng] : null,
      ].filter(Boolean);

      if (points.length >= 2) {
        if (polylineRef.current) {
          polylineRef.current.setLatLngs(points);
        } else {
          polylineRef.current = L.polyline(points, {
            color: "#0067A0", weight: 4, opacity: 0.7, dashArray: "8, 8",
          }).addTo(mapInstance.current);
        }
        mapInstance.current.fitBounds(points, { padding: [60, 60] });
      } else if (points.length === 1) {
        mapInstance.current.setView(points[0], 15);
      }

      if (riderLat && riderLng && destinationLat && destinationLng) {
        setDistance(getDistanceKm(riderLat, riderLng, destinationLat, destinationLng));
      } else {
        setDistance(null);
      }
    });
  }, [ready, riderLat, riderLng, destinationLat, destinationLng, customerLat, customerLng]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const timer = setTimeout(() => {
      if (mapInstance.current) mapInstance.current.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  });

  const recenter = () => {
    if (!mapInstance.current) return;
    const points = [
      riderLat && riderLng ? [riderLat, riderLng] : null,
      destinationLat && destinationLng ? [destinationLat, destinationLng] : null,
      customerLat && customerLng ? [customerLat, customerLng] : null,
    ].filter(Boolean);
    if (points.length >= 2) {
      mapInstance.current.fitBounds(points, { padding: [60, 60] });
    } else if (points.length === 1) {
      mapInstance.current.setView(points[0], 15);
    }
  };

  const hasRider = riderLat && riderLng;
  const hasDestination = destinationLat && destinationLng;

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg min-h-[300px]"
        style={{ background: "#e5e7eb", height: height || undefined }}
      />

      {hasDestination && !hasRider && (
        <div className="absolute top-2 left-2 z-[1000] bg-amber-50/95 backdrop-blur rounded-lg px-2.5 py-1.5 border border-amber-200 shadow-sm">
          <p className="text-[10px] font-semibold text-amber-700">⏳ Waiting for rider location...</p>
        </div>
      )}

      <div className="absolute top-2 right-10 z-[1000] bg-white/95 backdrop-blur rounded-lg px-2 py-1.5 shadow border border-[#E5E7EB]">
        <div className="flex flex-col gap-0.5">
          {hasRider && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0067A0] flex-shrink-0" />
              <span className="text-[8px] font-semibold text-[#00215B]">Rider</span>
            </div>
          )}
          {hasDestination && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C30000] flex-shrink-0" />
              <span className="text-[8px] font-semibold text-[#00215B]">Delivery</span>
            </div>
          )}
          {customerLat && customerLng && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] flex-shrink-0" />
              <span className="text-[8px] font-semibold text-[#00215B]">Customer</span>
            </div>
          )}
        </div>
      </div>

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
