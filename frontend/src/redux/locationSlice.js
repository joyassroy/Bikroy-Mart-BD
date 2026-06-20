import { createSlice } from "@reduxjs/toolkit";

const locationSlice = createSlice({
  name: "location",
  initialState: {
    division: "Dhaka",
    district: "Dhaka",
    upazila: "",
  },
  reducers: {
    setLocation: (state, action) => {
      state.division = action.payload.division;
      state.district = action.payload.district;
      state.upazila = action.payload.upazila || "";
    },
  },
});

export const { setLocation } = locationSlice.actions;
export default locationSlice.reducer;
