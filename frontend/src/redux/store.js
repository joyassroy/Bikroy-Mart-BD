import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import wishlistReducer from "./wishlistSlice";
import userReducer from "./userSlice";
import locationReducer from "./locationSlice";
import orderReducer from "./orderSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    user: userReducer,
    location: locationReducer,
    order: orderReducer,
  },
});

export default store;
