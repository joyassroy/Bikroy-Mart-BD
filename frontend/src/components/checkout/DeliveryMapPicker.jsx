"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin, Crosshair, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { BANGLADESH_LOCATIONS } from "@/lib/constants";

function findClosestDistrict(city) {
  if (!city) return null;
  const allDistricts = [];
  for (const division of BANGLADESH_LOCATIONS) {
    for (const district of division.districts) {
      allDistricts.push({ ...district, division: division.division });
    }
  }
  const term = city.toLowerCase().trim();
  for (const d of allDistricts) {
    if (d.name.toLowerCase().includes(term) || term.includes(d.name.toLowerCase())) {
      return { division: d.division, district: d.name };
    }
  }
  for (const d of allDistricts) {
    for (const upazila of d.upazilas) {
      if (upazila.toLowerCase().includes(term) || term.includes(upazila.toLowerCase())) {
        return { division: d.division, district: d.name };
      }
    }
  }
  return null;
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const city = addr.city || addr.state_district || addr.town || addr.village || addr.county || "";
    const match = findClosestDistrict(city);
    if (match) {
      return { division: match.division, district: match.district, upazila: addr.suburb || addr.neighbourhood || "" };
    }
    return null;
  } catch {
    return null;
  }
}

export default function DeliveryMapPicker({ coords, onCoordsChange, onLocationDetected }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([L]) => {
      if (!mounted || !mapRef.current || mapInstance.current) return;

      const center = coords?.latitude ? [coords.latitude, coords.longitude] : [23.8103, 90.4125];
      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView(center, coords?.latitude ? 15 : 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
      }).addTo(mapInstance.current);

      L.control.zoom({ position: "topright" }).addTo(mapInstance.current);

      if (coords?.latitude) {
        const pinIcon = L.divIcon({
          html: `<div style="background:#EC008C;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:grab;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
          iconSize: [28, 28], iconAnchor: [14, 28], className: "",
        });
        markerRef.current = L.marker(center, { icon: pinIcon, draggable: true }).addTo(mapInstance.current);
        markerRef.current.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          onCoordsChange({ latitude: pos.lat, longitude: pos.lng });
        });
      }

      mapInstance.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        const pinIcon = L.divIcon({
          html: `<div style="background:#EC008C;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:grab;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
          iconSize: [28, 28], iconAnchor: [14, 28], className: "",
        });
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(mapInstance.current);
          markerRef.current.on("dragend", (ev) => {
            const pos = ev.target.getLatLng();
            onCoordsChange({ latitude: pos.lat, longitude: pos.lng });
          });
        }
        onCoordsChange({ latitude: lat, longitude: lng });
      });

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
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapInstance.current || !coords?.latitude) return;
    const latlng = [coords.latitude, coords.longitude];
    mapInstance.current.setView(latlng, 15);
    import("leaflet").then((L) => {
      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        const pinIcon = L.divIcon({
          html: `<div style="background:#EC008C;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:grab;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
          iconSize: [28, 28], iconAnchor: [14, 28], className: "",
        });
        markerRef.current = L.marker(latlng, { icon: pinIcon, draggable: true }).addTo(mapInstance.current);
        markerRef.current.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          onCoordsChange({ latitude: pos.lat, longitude: pos.lng });
        });
      }
    });
  }, [ready, coords?.latitude, coords?.longitude]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onCoordsChange({ latitude: lat, longitude: lng });

        const location = await reverseGeocode(lat, lng);
        if (location && onLocationDetected) {
          onLocationDetected(location);
          toast.success(`Location detected: ${location.district}, ${location.division}`);
        } else {
          toast.success("Location captured! Drag the pin to adjust.");
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
        toast.error("Failed to get location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00AFCC] text-white rounded-lg text-[11px] font-semibold hover:bg-[#009BB5] disabled:opacity-50 transition"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
          {loading ? "Detecting location..." : "Use My Current Location"}
        </button>
        {coords?.latitude && (
          <span className="text-[10px] text-[#667085]">
            <MapPin size={10} className="inline" /> {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </span>
        )}
      </div>
      <div
        ref={mapRef}
        className="w-full rounded-lg border border-[#E5E7EB] overflow-hidden"
        style={{ height: "250px", background: "#e5e7eb" }}
      />
      <p className="text-[9px] text-[#667085] mt-1">Click the map or drag the pin to set exact delivery location</p>
    </div>
  );
}
