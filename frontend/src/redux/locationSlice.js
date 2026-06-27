import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("bm-location");
      if (saved) return JSON.parse(saved);
    } catch {}
  }
  return { division: "Dhaka", district: "Dhaka", upazila: "" };
};

const locationSlice = createSlice({
  name: "location",
  initialState: getInitialState(),
  reducers: {
    setLocation: (state, action) => {
      state.division = action.payload.division;
      state.district = action.payload.district;
      state.upazila = action.payload.upazila || "";
      if (typeof window !== "undefined") {
        localStorage.setItem("bm-location", JSON.stringify({
          division: state.division,
          district: state.district,
          upazila: state.upazila,
        }));
      }
    },
  },
});

export const { setLocation } = locationSlice.actions;
export default locationSlice.reducer;
