"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Maximize2, Navigation } from "lucide-react";
import { TILES_LIGHT, DEFAULT_CENTER, createMapMarker, fetchOSRMRoute, formatETA, formatDistance } from "@/lib/mapConfig";

export default function LiveRiderMap({ riderLat, riderLng, destinationLat, destinationLng, customerLat, customerLng, height }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const riderMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const straightLineRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]).then(([L]) => {
      if (!mountedRef.current || !mapRef.current || mapInstance.current) return;

      const center = destinationLat && destinationLng
        ? [destinationLat, destinationLng]
        : riderLat && riderLng
          ? [riderLat, riderLng]
          : DEFAULT_CENTER;

      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView(center, 14);

      L.tileLayer(TILES_LIGHT.url, TILES_LIGHT.options).addTo(mapInstance.current);
      L.control.zoom({ position: "topright" }).addTo(mapInstance.current);

      setTimeout(() => {
        if (mapInstance.current) mapInstance.current.invalidateSize();
      }, 200);

      setReady(true);
    });

    return () => {
      mountedRef.current = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        riderMarkerRef.current = null;
        destMarkerRef.current = null;
        customerMarkerRef.current = null;
        routeLineRef.current = null;
        straightLineRef.current = null;
      }
    };
  }, []);

  // Update markers + route
  useEffect(() => {
    if (!ready || !mapInstance.current) return;

    import("leaflet").then(async (L) => {
      // Rider marker
      if (riderLat && riderLng) {
        const icon = await createMapMarker({ color: "#0067A0", icon: "🏍", size: 36, label: "Rider" });
        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng([riderLat, riderLng]);
        } else {
          riderMarkerRef.current = L.marker([riderLat, riderLng], { icon })
            .addTo(mapInstance.current)
            .bindPopup("Rider Location");
        }
      } else if (riderMarkerRef.current) {
        mapInstance.current.removeLayer(riderMarkerRef.current);
        riderMarkerRef.current = null;
      }

      // Destination marker
      if (destinationLat && destinationLng) {
        const icon = await createMapMarker({ color: "#C30000", icon: "📍", size: 36, label: "Delivery" });
        if (destMarkerRef.current) {
          destMarkerRef.current.setLatLng([destinationLat, destinationLng]);
        } else {
          destMarkerRef.current = L.marker([destinationLat, destinationLng], { icon })
            .addTo(mapInstance.current)
            .bindPopup("Delivery Location");
        }
      } else if (destMarkerRef.current) {
        mapInstance.current.removeLayer(destMarkerRef.current);
        destMarkerRef.current = null;
      }

      // Customer marker
      if (customerLat && customerLng) {
        const icon = await createMapMarker({ color: "#16A34A", icon: "🏠", size: 36, label: "Customer" });
        if (customerMarkerRef.current) {
          customerMarkerRef.current.setLatLng([customerLat, customerLng]);
        } else {
          customerMarkerRef.current = L.marker([customerLat, customerLng], { icon })
            .addTo(mapInstance.current)
            .bindPopup("Customer Location");
        }
      } else if (customerMarkerRef.current) {
        mapInstance.current.removeLayer(customerMarkerRef.current);
        customerMarkerRef.current = null;
      }

      // Collect all points
      const points = [
        riderLat && riderLng ? [riderLat, riderLng] : null,
        destinationLat && destinationLng ? [destinationLat, destinationLng] : null,
        customerLat && customerLng ? [customerLat, customerLng] : null,
      ].filter(Boolean);

      // Try OSRM routes
      if (riderLat && riderLng && destinationLat && destinationLng) {
        const route = await fetchOSRMRoute(
          { lat: riderLat, lng: riderLng },
          { lat: destinationLat, lng: destinationLng }
        );
        if (route && mountedRef.current) {
          // Draw road-following route
          if (routeLineRef.current) {
            routeLineRef.current.setLatLngs(
              route.geometry.coordinates.map((c) => [c[1], c[0]])
            );
          } else {
            routeLineRef.current = L.polyline(
              route.geometry.coordinates.map((c) => [c[1], c[0]]),
              { color: "#0067A0", weight: 5, opacity: 0.8, lineCap: "round", lineJoin: "round" }
            ).addTo(mapInstance.current);
          }
          if (straightLineRef.current) {
            mapInstance.current.removeLayer(straightLineRef.current);
            straightLineRef.current = null;
          }
          setRouteInfo({ distance: route.distance, duration: route.duration });
        } else if (points.length >= 2) {
          // Fallback to straight line
          if (straightLineRef.current) {
            straightLineRef.current.setLatLngs(points);
          } else {
            straightLineRef.current = L.polyline(points, {
              color: "#0067A0", weight: 4, opacity: 0.6, dashArray: "8, 8",
            }).addTo(mapInstance.current);
          }
          if (routeLineRef.current) {
            mapInstance.current.removeLayer(routeLineRef.current);
            routeLineRef.current = null;
          }
          setRouteInfo(null);
        }
      } else if (destinationLat && destinationLng && customerLat && customerLng) {
        const route = await fetchOSRMRoute(
          { lat: destinationLat, lng: destinationLng },
          { lat: customerLat, lng: customerLng }
        );
        if (route && mountedRef.current) {
          if (routeLineRef.current) {
            routeLineRef.current.setLatLngs(
              route.geometry.coordinates.map((c) => [c[1], c[0]])
            );
          } else {
            routeLineRef.current = L.polyline(
              route.geometry.coordinates.map((c) => [c[1], c[0]]),
              { color: "#16A34A", weight: 5, opacity: 0.8, lineCap: "round", lineJoin: "round" }
            ).addTo(mapInstance.current);
          }
          if (straightLineRef.current) {
            mapInstance.current.removeLayer(straightLineRef.current);
            straightLineRef.current = null;
          }
          setRouteInfo({ distance: route.distance, duration: route.duration });
        } else if (points.length >= 2) {
          if (straightLineRef.current) {
            straightLineRef.current.setLatLngs(points);
          } else {
            straightLineRef.current = L.polyline(points, {
              color: "#16A34A", weight: 4, opacity: 0.6, dashArray: "8, 8",
            }).addTo(mapInstance.current);
          }
          if (routeLineRef.current) {
            mapInstance.current.removeLayer(routeLineRef.current);
            routeLineRef.current = null;
          }
          setRouteInfo(null);
        }
      }

      // Fit bounds
      if (points.length >= 2) {
        mapInstance.current.fitBounds(points, { padding: [60, 60] });
      } else if (points.length === 1) {
        mapInstance.current.setView(points[0], 15);
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
        <div className="absolute top-2 left-2 z-[1000] bg-amber-50/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-amber-200 shadow-sm">
          <p className="text-[11px] font-semibold text-amber-700">⏳ Waiting for rider...</p>
        </div>
      )}

      <div className="absolute top-2 right-10 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-2 shadow-sm border border-[#E5E7EB]">
        <div className="flex flex-col gap-0.5">
          {hasRider && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0067A0] flex-shrink-0" />
              <span className="text-[9px] font-semibold text-[#00215B]">Rider</span>
            </div>
          )}
          {hasDestination && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C30000] flex-shrink-0" />
              <span className="text-[9px] font-semibold text-[#00215B]">Delivery</span>
            </div>
          )}
          {customerLat && customerLng && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] flex-shrink-0" />
              <span className="text-[9px] font-semibold text-[#00215B]">Customer</span>
            </div>
          )}
        </div>
      </div>

      {routeInfo && (
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-[#E5E7EB] z-[1000]">
          <div className="flex items-center gap-2">
            <Navigation size={12} className="text-[#0067A0]" />
            <div>
              <p className="text-[11px] font-bold text-[#00215B]">{formatETA(routeInfo.duration)}</p>
              <p className="text-[9px] text-[#667085]">{formatDistance(routeInfo.distance)} away</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={recenter}
        className="absolute bottom-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F4F7FB] transition z-[1000]"
        title="Re-center map"
      >
        <Maximize2 size={14} className="text-[#00215B]" />
      </button>
    </div>
  );
}
