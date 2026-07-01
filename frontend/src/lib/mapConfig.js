import L from "leaflet";

// CARTO Positron tiles — clean, modern, Google Maps-like (free, no API key)
export const TILES_LIGHT = {
  url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  options: {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  },
};

// CARTO Voyager — colorful variant
export const TILES_VOYAGER = {
  url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  options: {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  },
};

export const DEFAULT_CENTER = [23.8103, 90.4125];
export const DEFAULT_ZOOM = 13;

// Google Maps-style SVG marker
export function createMapMarker({
  color = "#1a73e8",
  icon = "",
  size = 36,
  label = "",
}) {
  const h = size + 12;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.28;

  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="position:relative;width:${size}px;height:${h}px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <svg width="${size}" height="${h}" viewBox="0 0 ${size} ${h}" xmlns="http://www.w3.org/2000/svg">
          <path d="M${cx} 0C${cx * 0.45} 0 0 ${cy * 0.9} 0 ${cy}c0 ${cy * 1.17} ${cx} ${h - cy} ${cx} ${h - cy}s${cx}-${cy * 1.17 + (h - cy - cy * 1.17)} ${cx}-${cy * 1.17 + (h - cy - cy * 1.17)}C${size} ${cy * 0.9} ${cx * 1.55} 0 ${cx} 0z" fill="${color}"/>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/>
          ${icon ? `<text x="${cx}" y="${cy + r * 0.35}" text-anchor="middle" fill="${color}" font-size="${r * 1.1}" font-weight="bold">${icon}</text>` : ""}
        </svg>
        ${
          label
            ? `<div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.2);">${label}</div>`
            : ""
        }
      </div>
    `,
    iconSize: [size, h],
    iconAnchor: [cx, h],
    popupAnchor: [0, -(h - 4)],
  });
}

// OSRM route cache (sessionStorage-backed to survive re-mounts within same tab)
const routeCache = new Map();
const CACHE_MAX = 200;

function getCacheKey(start, end) {
  return `${start.lat.toFixed(5)},${start.lng.toFixed(5)}-${end.lat.toFixed(5)},${end.lng.toFixed(5)}`;
}

// OSRM route fetcher — returns road-following geometry + distance/duration
export async function fetchOSRMRoute(start, end) {
  const key = getCacheKey(start, end);
  if (routeCache.has(key)) return routeCache.get(key);

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&overview=full`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === "Ok" && data.routes.length > 0) {
      const route = {
        geometry: data.routes[0].geometry,
        distance: data.routes[0].distance,
        duration: data.routes[0].duration,
      };
      if (routeCache.size >= CACHE_MAX) {
        const firstKey = routeCache.keys().next().value;
        routeCache.delete(firstKey);
      }
      routeCache.set(key, route);
      return route;
    }
  } catch {}
  return null;
}

// Format duration (seconds) to human-readable ETA
export function formatETA(seconds) {
  if (!seconds || seconds <= 0) return "";
  if (seconds < 60) return "Arriving now";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

// Format distance (meters) to human-readable
export function formatDistance(meters) {
  if (!meters || meters <= 0) return "";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
