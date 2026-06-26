"use client";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "@/redux/userSlice";
import api from "@/lib/axios";

export default function AuthInit({ children }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = localStorage.getItem("bm-token");
    if (!token) return;

    api.get("/auth/me")
      .then((res) => {
        if (res.data?.data) {
          dispatch(setUser({ user: res.data.data, accessToken: token }));
        }
      })
      .catch(() => {
        localStorage.removeItem("bm-token");
        dispatch(clearUser());
      });
  }, [dispatch]);

  return children;
}
