import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import productRequestReducer from "./productRequestSlice";
import userReducer from "./userSlice";
import locationReducer from "./locationSlice";
import orderReducer from "./orderSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    productRequests: productRequestReducer,
    user: userReducer,
    location: locationReducer,
    order: orderReducer,
  },
});

export default store;
