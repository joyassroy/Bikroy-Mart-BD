import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: { data: null, accessToken: null },
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    clearUser: (state) => {
      state.data = null;
      state.accessToken = null;
    },
    updateUser: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
  },
});

export const { setUser, clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer;
