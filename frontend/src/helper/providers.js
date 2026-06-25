"use client";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { makeStore } from "@/redux/store";

const store = makeStore();

export function Providers({ children }) {
  return (
    <SessionProvider>
      <Provider store={store}>{children}</Provider>
    </SessionProvider>
  );
}
