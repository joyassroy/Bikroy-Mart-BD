import { createSlice } from "@reduxjs/toolkit";

const loadWishlistFromStorage = () => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("bm-wishlist");
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: loadWishlistFromStorage() },
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
  },
});

export const { addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
