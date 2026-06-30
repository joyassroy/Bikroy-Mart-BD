"use client";
import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { SessionProvider } from "next-auth/react";
import store from "@/redux/store";
import { hydrateLocation } from "@/redux/locationSlice";
import { hydrateCart } from "@/redux/cartSlice";
import { hydrateProductRequests } from "@/redux/productRequestSlice";
import AuthInit from "./AuthInit";

function StoreHydrator() {
  const dispatch = useDispatch();
  useEffect(() => {
    try {
      const hasToken = !!localStorage.getItem("bm-token");
      if (!hasToken) {
        const savedLocation = localStorage.getItem("bm-location");
        if (savedLocation) dispatch(hydrateLocation(JSON.parse(savedLocation)));
      }
    } catch {}
    try {
      const savedCart = localStorage.getItem("bm-cart");
      if (savedCart) dispatch(hydrateCart({ items: JSON.parse(savedCart) }));
    } catch {}
    try {
      const savedProductRequests = localStorage.getItem("bm-product-requests");
      if (savedProductRequests) dispatch(hydrateProductRequests({ items: JSON.parse(savedProductRequests) }));
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
