"use client";
import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { SessionProvider } from "next-auth/react";
import store from "@/redux/store";
import { hydrateLocation } from "@/redux/locationSlice";
import { hydrateCart } from "@/redux/cartSlice";
import { hydrateWishlist } from "@/redux/wishlistSlice";
import AuthInit from "./AuthInit";

function StoreHydrator() {
  const dispatch = useDispatch();
  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem("bm-location");
      if (savedLocation) dispatch(hydrateLocation(JSON.parse(savedLocation)));
    } catch {}
    try {
      const savedCart = localStorage.getItem("bm-cart");
      if (savedCart) dispatch(hydrateCart({ items: JSON.parse(savedCart) }));
    } catch {}
    try {
      const savedWishlist = localStorage.getItem("bm-wishlist");
      if (savedWishlist) dispatch(hydrateWishlist({ items: JSON.parse(savedWishlist) }));
    } catch {}
  }, [dispatch]);
  return null;
}

export function Providers({ children }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <AuthInit>
          <StoreHydrator />
          {children}
        </AuthInit>
      </Provider>
    </SessionProvider>
  );
}
