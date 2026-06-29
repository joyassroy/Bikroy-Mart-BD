import { setLocation } from "@/redux/locationSlice";
import { BANGLADESH_LOCATIONS } from "@/lib/constants";

const IP_API_URLS = [
  "https://ipwho.is/",
  "https://ipinfo.io/json",
];

const findClosestDistrict = (city, region) => {
  if (!city && !region) return null;

  const allDistricts = [];
  for (const division of BANGLADESH_LOCATIONS) {
    for (const district of division.districts) {
      allDistricts.push({ ...district, division: division.division });
    }
  }

  const searchTerms = [city, region].filter(Boolean).map((s) => s.toLowerCase());

  for (const term of searchTerms) {
    for (const d of allDistricts) {
      if (d.name.toLowerCase().includes(term) || term.includes(d.name.toLowerCase())) {
        return { division: d.division, district: d.name };
      }
    }
  }

  for (const term of searchTerms) {
    for (const d of allDistricts) {
      for (const upazila of d.upazilas) {
        if (upazila.toLowerCase().includes(term) || term.includes(upazila.toLowerCase())) {
          return { division: d.division, district: d.name };
        }
      }
    }
  }

  for (const term of searchTerms) {
    for (const division of BANGLADESH_LOCATIONS) {
      if (division.division.toLowerCase().includes(term) || term.includes(division.division.toLowerCase())) {
        return { division: division.division, district: division.districts[0]?.name };
      }
    }
  }

  return null;
};

export const detectLocationFromIP = async (dispatch) => {
  try {
    const saved = localStorage.getItem("bm-location");
    if (saved) return;

    for (const url of IP_API_URLS) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;

        const data = await res.json();

        const countryCode = (data.country_code || data.country || "").toUpperCase();
        if (countryCode && countryCode !== "BD") {
          dispatch(setLocation({ division: "Dhaka", district: "Dhaka", upazila: "" }));
          return;
        }

        const city = data.city || "";
        const region = data.region || data.region_name || "";

        const match = findClosestDistrict(city, region);
        if (match) {
          dispatch(setLocation({ division: match.division, district: match.district, upazila: "" }));
          return;
        }
      } catch {
        continue;
      }
    }

    dispatch(setLocation({ division: "Dhaka", district: "Dhaka", upazila: "" }));
  } catch {
    dispatch(setLocation({ division: "Dhaka", district: "Dhaka", upazila: "" }));
  }
};
