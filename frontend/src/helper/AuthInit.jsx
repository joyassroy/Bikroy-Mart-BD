"use client";
import { useEffect, useRef, createContext, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "@/redux/userSlice";
import api from "@/lib/axios";
import { detectLocationFromIP } from "@/lib/ipLocation";

const AuthContext = createContext({ authChecked: false });
export const useAuthChecked = () => useContext(AuthContext);

export default function AuthInit({ children }) {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    detectLocationFromIP(dispatch);

    const token = localStorage.getItem("bm-token");
    if (!token) {
      setAuthChecked(true);
      return;
    }

    api.get("/auth/me")
      .then((res) => {
        if (res.data?.data) {
          dispatch(setUser({ user: res.data.data, accessToken: token }));
        }
      })
      .catch(() => {
        localStorage.removeItem("bm-token");
        dispatch(clearUser());
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ authChecked }}>
      {children}
    </AuthContext.Provider>
  );
}
