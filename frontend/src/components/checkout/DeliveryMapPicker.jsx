"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Crosshair, Loader2, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { BANGLADESH_LOCATIONS } from "@/lib/constants";
import { TILES_LIGHT, DEFAULT_CENTER, createMapMarker } from "@/lib/mapConfig";

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
      { headers: { "Accept-Language": "en", "User-Agent": "BikroyMartBD/1.0 (https://bikroymart.com)" } }
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);

  const placeMarker = useCallback(async (L, lat, lng) => {
    const pinIcon = await createMapMarker({ color: "#EC008C", icon: "📍", size: 32 });
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(mapInstance.current);
      markerRef.current.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        onCoordsChange({ latitude: pos.lat, longitude: pos.lng });
      });
    }
  }, [onCoordsChange]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([L]) => {
      if (!mounted || !mapRef.current || mapInstance.current) return;

      const center = coords?.latitude ? [coords.latitude, coords.longitude] : DEFAULT_CENTER;
      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView(center, coords?.latitude ? 15 : 6);

      L.tileLayer(TILES_LIGHT.url, TILES_LIGHT.options).addTo(mapInstance.current);
      L.control.zoom({ position: "topright" }).addTo(mapInstance.current);

      if (coords?.latitude) {
        placeMarker(L, coords.latitude, coords.longitude);
      }

      mapInstance.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        placeMarker(L, lat, lng);
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
    import("leaflet").then((L) => placeMarker(L, coords.latitude, coords.longitude));
  }, [ready, coords?.latitude, coords?.longitude, placeMarker]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query || query.length < 3) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + " Bangladesh")}&format=json&limit=5&addressdetails=1`,
          { headers: { "Accept-Language": "en", "User-Agent": "BikroyMartBD/1.0 (https://bikroymart.com)" } }
        );
        const data = await res.json();
        setSearchResults(data.map((r) => ({
          name: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          short: r.display_name.split(",").slice(0, 3).join(","),
        })));
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 500);
  }, []);

  const selectSearchResult = useCallback((result) => {
    setSearchQuery(result.short);
    setSearchResults([]);
    if (mapInstance.current) {
      mapInstance.current.setView([result.lat, result.lng], 15);
      import("leaflet").then((L) => placeMarker(L, result.lat, result.lng));
      onCoordsChange({ latitude: result.lat, longitude: result.lng });
    }
  }, [placeMarker, onCoordsChange]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
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
      () => { setLoading(false); toast.error("Failed to get location. Please allow location access."); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <button type="button" onClick={handleUseLocation} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00AFCC] text-white rounded-lg text-[11px] font-semibold hover:bg-[#009BB5] disabled:opacity-50 transition">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
          {loading ? "Detecting..." : "Use My Location"}
        </button>
        {coords?.latitude && (
          <span className="text-[10px] text-[#667085]">
            <MapPin size={10} className="inline" /> {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </span>
        )}
      </div>
      <div className="relative" style={{ height: "250px" }}>
        <div className="map-search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search address..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#667085]" />}
          {searchQuery && !searching && (
            <button onClick={() => { setSearchQuery(""); setSearchResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#333]">
              <X size={14} />
            </button>
          )}
          {searchResults.length > 0 && (
            <div className="map-search-results">
              {searchResults.map((r, i) => (
                <div key={i} className="result-item" onClick={() => selectSearchResult(r)}>
                  <div className="text-xs font-medium text-[#364152]">{r.short}</div>
                  <div className="text-[10px] text-[#667085] truncate">{r.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div ref={mapRef} className="w-full h-full rounded-lg border border-[#E5E7EB] overflow-hidden" style={{ background: "#e5e7eb" }} />
      </div>
      <p className="text-[9px] text-[#667085] mt-1">Click the map or drag the pin to set exact delivery location</p>
    </div>
  );
}
