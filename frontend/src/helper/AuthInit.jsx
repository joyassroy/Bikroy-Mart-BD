"use client";
import { useEffect, useRef, createContext, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "@/redux/userSlice";
import { setLocation } from "@/redux/locationSlice";
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

    const token = localStorage.getItem("bm-token");
    if (!token) {
      dispatch(clearUser());
      detectLocationFromIP(dispatch);
      setAuthChecked(true);
      return;
    }

    detectLocationFromIP(dispatch, { force: true });

    api.get("/auth/me")
      .then((res) => {
        if (res.data?.data) {
          const user = res.data.data;
          if (user.role === "CUSTOMER" || user.role === "ADMIN" || user.role === "MANAGER" || user.role === "RIDER") {
            dispatch(setUser({ user, accessToken: token }));
          } else {
            dispatch(clearUser());
            localStorage.removeItem("bm-token");
          }

          const userDistrict = user.managerProfile?.assignedDistrict
            || user.riderProfile?.assignedZila
            || user.district;

          if (userDistrict) {
            dispatch(setLocation({ division: "", district: userDistrict, upazila: "" }));
          }
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
