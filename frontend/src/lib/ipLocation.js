import { setLocation } from "@/redux/locationSlice";
import { BANGLADESH_LOCATIONS } from "@/lib/constants";

const IP_API_URL = "https://ipapi.co/json/";

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

export const detectLocationFromIP = async (dispatch) => {
  try {
    const saved = localStorage.getItem("bm-location");
    if (saved) return;

    const res = await fetch(IP_API_URL);
    if (!res.ok) return;

    const data = await res.json();
    const city = data.city || "";
    const region = data.region || "";
    const country = data.country_code || "";

    if (country !== "BD") return;

    const match = findClosestDistrict(city, region);
    if (match) {
      dispatch(setLocation({
        division: match.division,
        district: match.district,
        upazila: "",
      }));
    }
  } catch {
    // Silently fail - IP detection is best-effort
  }
};
