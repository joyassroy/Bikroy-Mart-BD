"use client";
import { Provider } from "react-redux";
import { makeStore } from "@/redux/store";

const store = makeStore();

export function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
