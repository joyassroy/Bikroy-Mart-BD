import { setLocation } from "@/redux/locationSlice";
import { BANGLADESH_LOCATIONS } from "@/lib/constants";

const IP_API_URLS = [
  "https://ipwho.is/",
  "https://ipinfo.io/json",
];

const findClosestDistrict = (city, region) => {
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
};

const detectFromBrowserGeolocation = () => {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en&addressdetails=1`,
            { headers: { "Accept-Language": "en", "User-Agent": "BikroyMartBD/1.0 (https://bikroymart.com)" } }
          );
          if (!res.ok) { resolve(null); return; }

          const data = await res.json();
          const addr = data.address || {};

          const city = addr.city || addr.state_district || addr.town || addr.village || addr.county || "";

          const match = findClosestDistrict(city);
          if (match) {
            resolve({ division: match.division, district: match.district });
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  });
};

const detectFromIP = async () => {
  for (const url of IP_API_URLS) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();

      if (data.success === false) continue;

      const countryCode = (data.country_code || data.country || "").toUpperCase();
      if (countryCode && countryCode !== "BD") {
        return { division: "Dhaka", district: "Dhaka" };
      }

      const city = data.city || "";

      const match = findClosestDistrict(city);
      if (match) {
        return { division: match.division, district: match.district };
      }
    } catch {
      continue;
    }
  }
  return null;
};

export const detectLocationFromIP = async (dispatch, { force = false } = {}) => {
  try {
    if (!force && typeof window !== "undefined") {
      const saved = localStorage.getItem("bm-location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.district) {
          dispatch(setLocation(parsed));
          return;
        }
      }
    }

    const geoResult = await detectFromBrowserGeolocation();
    if (geoResult) {
      dispatch(setLocation({ division: geoResult.division, district: geoResult.district, upazila: "" }));
      return;
    }

    const ipResult = await detectFromIP();
    if (ipResult) {
      dispatch(setLocation({ division: ipResult.division, district: ipResult.district, upazila: "" }));
      return;
    }

    dispatch(setLocation({ division: "Dhaka", district: "Dhaka", upazila: "" }));
  } catch {
    dispatch(setLocation({ division: "Dhaka", district: "Dhaka", upazila: "" }));
  }
};
