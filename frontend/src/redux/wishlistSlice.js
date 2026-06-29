import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: [] },
  reducers: {
    addToWishlist: (state, action) => {
      if (!state.items.find((i) => i.productId === action.payload.productId)) {
        state.items.push(action.payload);
      }
      if (typeof window !== "undefined") localStorage.setItem("bm-wishlist", JSON.stringify(state.items));
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      if (typeof window !== "undefined") localStorage.setItem("bm-wishlist", JSON.stringify(state.items));
    },
    hydrateWishlist: (state, action) => {
      if (action.payload) {
        state.items = action.payload.items || [];
      }
    },
  },
});

export const { addToWishlist, removeFromWishlist, hydrateWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
