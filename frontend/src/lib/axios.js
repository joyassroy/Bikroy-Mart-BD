import axios from "axios";
import store from "@/redux/store";
import { clearUser } from "@/redux/userSlice";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bm-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (typeof window !== "undefined") {
      if (status === 401) {
        localStorage.removeItem("bm-token");
        localStorage.removeItem("bm-location");
        store.dispatch(clearUser());
        if (!window.location.pathname.includes("/signin")) {
          window.location.href = "/signin";
        }
      } else if (status === 403) {
        const pathname = window.location.pathname;
        if (pathname.startsWith("/dashboard") || pathname.startsWith("/manager") || pathname.startsWith("/rider")) {
          localStorage.removeItem("bm-token");
          localStorage.removeItem("bm-location");
          store.dispatch(clearUser());
          window.location.href = "/signin";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
