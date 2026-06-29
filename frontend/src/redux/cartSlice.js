import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], appliedCoupon: null, couponDiscount: 0 },
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) {
        existing.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
      if (typeof window !== "undefined") localStorage.setItem("bm-cart", JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) item.quantity = action.payload.quantity;
      if (typeof window !== "undefined") localStorage.setItem("bm-cart", JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      if (typeof window !== "undefined") localStorage.setItem("bm-cart", JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.appliedCoupon = null;
      state.couponDiscount = 0;
      if (typeof window !== "undefined") localStorage.setItem("bm-cart", JSON.stringify([]));
    },
    setCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
      state.couponDiscount = action.payload.discountValue;
    },
    clearCoupon: (state) => {
      state.appliedCoupon = null;
      state.couponDiscount = 0;
    },
    hydrateCart: (state, action) => {
      if (action.payload) {
        state.items = action.payload.items || [];
        state.appliedCoupon = action.payload.appliedCoupon || null;
        state.couponDiscount = action.payload.couponDiscount || 0;
      }
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, setCoupon, clearCoupon, hydrateCart } = cartSlice.actions;
export default cartSlice.reducer;
