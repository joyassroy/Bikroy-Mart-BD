"use client";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { makeStore } from "@/redux/store";
import AuthInit from "./AuthInit";

const store = makeStore();

export function Providers({ children }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <AuthInit>{children}</AuthInit>
      </Provider>
    </SessionProvider>
  );
}
