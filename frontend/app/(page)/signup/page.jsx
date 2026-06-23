"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await api.post("/auth/register", form);
      const { user, accessToken } = res.data.data;
      localStorage.setItem("bm-token", accessToken);
      dispatch(setUser({ user, accessToken }));
      toast.success("Registration successful!");
      router.push("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
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
          <p className="text-[#667085] mt-0.5 text-[11px] sm:text-xs">{t.joinMessage}</p>
        </div>

        {errors.general && (
          <div className="alert-error mb-3">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-[#364152] mb-1">{t.fullName}</label>
            <input
              type="text" placeholder={t.fullName} required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-[#364152] mb-1">{t.emailAddress}</label>
            <input
              type="email" placeholder={t.emailAddress} required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-[#364152] mb-1">{t.phoneNumber}</label>
            <input
              type="tel" placeholder={t.phoneNumber}
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-[#364152] mb-1">{t.password}</label>
            <input
              type="password" placeholder="Min 6 characters" required minLength={6}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
            {loading ? t.loading : t.signUp}
          </button>
        </form>

        <p className="text-center text-[11px] sm:text-xs text-[#667085] mt-3 sm:mt-4">
          {t.alreadyHaveAccount}{" "}
          <Link href="/signin" className="text-[#EC008C] font-semibold hover:underline">{t.signIn}</Link>
        </p>
      </div>
    </div>
  );
}
