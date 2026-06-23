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
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-[rgba(0,0,0,0.1)_0px_2px_4px_0px] w-full max-w-sm p-5 sm:p-6 border border-[#E5E7EB]">
        <div className="text-center mb-4 sm:mb-5">
          <h1 className="text-base sm:text-lg font-bold text-[#00215B]">Bikroy<span className="text-[#EC008C]">-Mart</span>-BD</h1>
          <p className="text-[#667085] mt-0.5 text-[11px] sm:text-xs">{t.signInToContinue}</p>
        </div>

        {errors.general && (
          <div className="alert-error mb-3">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-[#364152] mb-1">{t.emailAddress}</label>
            <input
              type="email" placeholder="Enter your email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-[#364152] mb-1">{t.password}</label>
            <input
              type="password" placeholder="Enter your password" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
            {loading ? t.loading : t.signIn}
          </button>
        </form>

        <p className="text-center text-[11px] sm:text-xs text-[#667085] mt-3 sm:mt-4">
          {t.dontHaveAccount}{" "}
          <Link href="/signup" className="text-[#EC008C] font-semibold hover:underline">{t.signUp}</Link>
        </p>
      </div>
    </div>
  );
}
