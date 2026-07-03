import axios from "axios";
import store from "@/redux/store";
import { setUser, clearUser } from "@/redux/userSlice";
import { resetSocket } from "@/lib/socket";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

const isAuthEndpoint = (url) => {
  return url.includes("/auth/me") || url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/google") || url.includes("/auth/refresh-token");
};

const clearAuthAndRedirect = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("bm-token");
  localStorage.removeItem("bm-refresh-token");
  localStorage.removeItem("bm-location");
  store.dispatch(clearUser());
  if (!window.location.pathname.includes("/signin")) {
    window.location.href = "/signin";
  }
};

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
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (typeof window === "undefined") return Promise.reject(error);

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint(originalRequest.url)) {
      const refreshToken = localStorage.getItem("bm-refresh-token");

      if (!refreshToken) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        localStorage.setItem("bm-token", accessToken);
        localStorage.setItem("bm-refresh-token", newRefreshToken);

        const currentUser = store.getState().user.data;
        store.dispatch(setUser({ user: currentUser, accessToken }));
        resetSocket(accessToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403) {
      const pathname = window.location.pathname;
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/manager") || pathname.startsWith("/rider")) {
        clearAuthAndRedirect();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
