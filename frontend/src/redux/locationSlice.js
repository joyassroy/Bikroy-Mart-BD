import { createSlice } from "@reduxjs/toolkit";

const DEFAULT_LOCATION = { division: "Dhaka", district: "Dhaka", upazila: "" };

const locationSlice = createSlice({
  name: "location",
  initialState: DEFAULT_LOCATION,
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
    hydrateLocation: (state, action) => {
      if (action.payload) {
        state.division = action.payload.division;
        state.district = action.payload.district;
        state.upazila = action.payload.upazila || "";
      }
    },
  },
});

export const { setLocation, hydrateLocation } = locationSlice.actions;
export default locationSlice.reducer;
