"use client";
import { useEffect, useRef, createContext, useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/redux/userSlice";
import { setLocation } from "@/redux/locationSlice";
import api from "@/lib/axios";
import { detectLocationFromIP } from "@/lib/ipLocation";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api";

const AuthContext = createContext({ authChecked: false });
export const useAuthChecked = () => useContext(AuthContext);

function applyUserLocation(dispatch, user) {
  const userDistrict = user.managerProfile?.assignedDistrict
    || user.riderProfile?.assignedZila
    || user.district;
  if (userDistrict) {
    dispatch(setLocation({ division: "", district: userDistrict, upazila: "" }));
  }
}

export default function AuthInit({ children }) {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = localStorage.getItem("bm-token");
    if (!token) {
      dispatch(clearUser());
      detectLocationFromIP(dispatch);
      setAuthChecked(true);
      return;
    }

    detectLocationFromIP(dispatch, { force: true });

    const validateUser = async (accessToken) => {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.data?.data) {
        const user = res.data.data;
        if (user.isBlocked) {
          localStorage.removeItem("bm-token");
          localStorage.removeItem("bm-refresh-token");
          dispatch(clearUser());
          toast.error("Your account has been blocked. Please contact support.");
          return false;
        }
        if (user.role === "CUSTOMER" || user.role === "ADMIN" || user.role === "MANAGER" || user.role === "RIDER") {
          dispatch(setUser({ user, accessToken }));
          applyUserLocation(dispatch, user);
          return true;
        }
      }
      return false;
    };

    const tryRefreshAndValidate = async () => {
      const refreshToken = localStorage.getItem("bm-refresh-token");
      if (!refreshToken) return false;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
        localStorage.setItem("bm-token", accessToken);
        localStorage.setItem("bm-refresh-token", newRefreshToken);
        return await validateUser(accessToken);
      } catch {
        return false;
      }
    };

    const run = async () => {
      try {
        const ok = await validateUser(token);
        if (!ok) {
          const refreshed = await tryRefreshAndValidate();
          if (!refreshed) {
            localStorage.removeItem("bm-token");
            localStorage.removeItem("bm-refresh-token");
            dispatch(clearUser());
          }
        }
      } catch {
        const refreshed = await tryRefreshAndValidate();
        if (!refreshed) {
          localStorage.removeItem("bm-token");
          localStorage.removeItem("bm-refresh-token");
          dispatch(clearUser());
        }
      } finally {
        setAuthChecked(true);
      }
    };

    run();
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ authChecked }}>
      {children}
    </AuthContext.Provider>
  );
}
