"use client";
import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, MapPin } from "lucide-react";
import { TILES_LIGHT, DEFAULT_CENTER, createMapMarker } from "@/lib/mapConfig";

export default function LocationMapModal({ show, onClose, lat, lng, label = "Location", title = "Map" }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!show || !lat || !lng) return;
    let mounted = true;

    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]).then(async ([L]) => {
      if (!mounted || !mapRef.current || mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: true,
      }).setView([lat, lng], 16);

      L.tileLayer(TILES_LIGHT.url, TILES_LIGHT.options).addTo(mapInstance.current);
      L.control.zoom({ position: "topright" }).addTo(mapInstance.current);

      const icon = await createMapMarker({ color: "#EC008C", icon: "📍", size: 40, label });
      markerRef.current = L.marker([lat, lng], { icon })
        .addTo(mapInstance.current)
        .bindPopup(label)
        .openPopup();

      setTimeout(() => {
        if (mapInstance.current) mapInstance.current.invalidateSize();
      }, 300);

      setReady(true);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
        setReady(false);
      }
    };
  }, [show, lat, lng]);

  useEffect(() => {
    if (!show) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [show, onClose]);

  if (!show || !lat || !lng) return null;

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=16`;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-[95vw] h-[90vh] max-w-[1200px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:w-[90vw] sm:h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EC008C]/10 flex items-center justify-center">
              <MapPin size={16} className="text-[#EC008C]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#181717]">{title}</h3>
              <p className="text-[10px] text-[#667085]">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00AFCC]/10 hover:bg-[#00AFCC]/20 rounded-lg text-[#00AFCC] text-[11px] font-semibold transition"
            >
              <ExternalLink size={12} />
              Google Maps
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F7FB] transition"
            >
              <X size={18} className="text-[#667085]" />
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" style={{ background: "#e5e7eb" }} />

          {/* Legend */}
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EC008C] flex-shrink-0" />
              <span className="text-[10px] font-semibold text-[#00215B]">{label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
