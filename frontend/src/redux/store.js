import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import wishlistReducer from "./wishlistSlice";
import userReducer from "./userSlice";
import locationReducer from "./locationSlice";
import orderReducer from "./orderSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
      wishlist: wishlistReducer,
      user: userReducer,
      location: locationReducer,
      order: orderReducer,
    },
  });

// export type RootState = ReturnType<ReturnType<typeof makeStore>["getState"]>;
// export type AppDispatch = ReturnType<typeof makeStore>["dispatch"];
