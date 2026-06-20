"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function SigninPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await api.post("/auth/login", form);
      const { user, accessToken } = res.data.data;
      localStorage.setItem("bm-token", accessToken);
      dispatch(setUser({ user, accessToken }));
      if (user.role === "ADMIN") router.push("/dashboard");
      else if (user.role === "MANAGER") router.push("/manager");
      else if (user.role === "RIDER") router.push("/rider");
      else router.push("/");
      toast.success("Login successful!");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Bikroy-Mart-BD</h1>
          <p className="text-gray-500 mt-1 text-sm">{t.signInToContinue}</p>
        </div>

        {errors.general && (
          <div className="alert-error mb-4">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.emailAddress}</label>
            <input
              type="email" placeholder="Enter your email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.password}</label>
            <input
              type="password" placeholder="Enter your password" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t.loading : t.signIn}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {t.dontHaveAccount}{" "}
          <Link href="/signup" className="text-[#0067A0] font-semibold hover:underline">{t.signUp}</Link>
        </p>
      </div>
    </div>
  );
}
