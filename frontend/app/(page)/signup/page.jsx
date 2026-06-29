"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { setLocation } from "@/redux/locationSlice";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import { signIn } from "next-auth/react";
import { ALL_DISTRICTS } from "@/lib/constants";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const detectedDistrict = useSelector((state) => state.location?.district || "");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", district: detectedDistrict });
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
      if (form.district) {
        dispatch(setLocation({ division: "", district: form.district, upazila: "" }));
      }
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

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-[rgba(0,0,0,0.1)_0px_2px_4px_0px] w-full max-w-sm p-5 sm:p-6 border border-[#E5E7EB]">
        <div className="text-center mb-4 sm:mb-5">
          <h1 className="text-base sm:text-lg font-bold text-[#00215B]">Bikroy<span className="text-[#EC008C]">-Mart</span>-BD</h1>
          <p className="text-[#667085] mt-0.5 text-[11px] sm:text-xs">{t.joinMessage}</p>
        </div>

        {errors.general && (
          <div className="alert-error mb-3">{errors.general}</div>
        )}

        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-[#D1D5DB] rounded-md py-2 text-sm font-medium text-[#364152] hover:bg-gray-50 transition-colors mb-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E7EB]"></div>
          </div>
          <div className="relative flex justify-center text-[11px]">
            <span className="bg-white px-2 text-[#667085]">or sign up with email</span>
          </div>
        </div>

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
            <label className="block text-[11px] sm:text-xs font-semibold text-[#364152] mb-1">District (Zila) *</label>
            <select
              required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
              className="input-field"
            >
              <option value="">Select your district</option>
              {ALL_DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
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
