import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "order",
  initialState: { orders: [], currentOrder: null, loading: false },
  reducers: {
    setOrders: (state, action) => { state.orders = action.payload; },
    setCurrentOrder: (state, action) => { state.currentOrder = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
});

export const { setOrders, setCurrentOrder, setLoading } = orderSlice.actions;
export default orderSlice.reducer;
