import { setLocation } from "@/redux/locationSlice";
import { BANGLADESH_LOCATIONS } from "@/lib/constants";

const IP_API_URLS = [
  "https://ipapi.co/json/",
  "https://ipwho.is/",
  "https://ipinfo.io/json",
];

const findClosestDistrict = (city, region) => {
  if (!city && !region) return null;
  const search = (city || region || "").toLowerCase();

  for (const division of BANGLADESH_LOCATIONS) {
    for (const district of division.districts) {
      if (district.name.toLowerCase().includes(search)) {
        return { division: division.division, district: district.name };
      }
    }
  }

  for (const division of BANGLADESH_LOCATIONS) {
    if (division.division.toLowerCase().includes(search)) {
      return { division: division.division, district: division.districts[0]?.name };
    }
  }

  return null;
};

const fetchLocation = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed");
  const data = await res.json();
  const country = data.country_code || data.country || "";
  const city = data.city || "";
  const region = data.region || data.region_name || "";
  return { country, city, region };
};

export const detectLocationFromIP = async (dispatch) => {
  try {
    const saved = localStorage.getItem("bm-location");
    if (saved) return;

    for (const url of IP_API_URLS) {
      try {
        const { country, city, region } = await fetchLocation(url);
        if (country && country.toUpperCase() !== "BD") return;

        const match = findClosestDistrict(city, region);
        if (match) {
          dispatch(setLocation({
            division: match.division,
            district: match.district,
            upazila: "",
          }));
          return;
        }
      } catch {
        continue;
      }
    }
  } catch {
    // Silently fail - IP detection is best-effort
  }
};
