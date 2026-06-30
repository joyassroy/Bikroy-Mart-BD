import { createSlice } from "@reduxjs/toolkit";

const productRequestSlice = createSlice({
  name: "productRequests",
  initialState: { items: [] },
  reducers: {
    addProductRequest: (state, action) => {
      if (!state.items.find((i) => i.productId === action.payload.productId)) {
        state.items.push(action.payload);
      }
      if (typeof window !== "undefined") localStorage.setItem("bm-product-requests", JSON.stringify(state.items));
    },
    removeProductRequest: (state, action) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      if (typeof window !== "undefined") localStorage.setItem("bm-product-requests", JSON.stringify(state.items));
    },
    hydrateProductRequests: (state, action) => {
      if (action.payload) {
        state.items = action.payload.items || [];
      }
    },
  },
});

export const { addProductRequest, removeProductRequest, hydrateProductRequests } = productRequestSlice.actions;
export default productRequestSlice.reducer;
