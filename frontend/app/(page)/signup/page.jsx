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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Bikroy-Mart-BD</h1>
          <p className="text-gray-500 mt-1 text-sm">{t.joinMessage}</p>
        </div>

        {errors.general && (
          <div className="alert-error mb-4">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.fullName}</label>
            <input
              type="text" placeholder={t.fullName} required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.emailAddress}</label>
            <input
              type="email" placeholder={t.emailAddress} required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.phoneNumber}</label>
            <input
              type="tel" placeholder={t.phoneNumber}
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.password}</label>
            <input
              type="password" placeholder="Min 6 characters" required minLength={6}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t.loading : t.signUp}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {t.alreadyHaveAccount}{" "}
          <Link href="/signin" className="text-[#0067A0] font-semibold hover:underline">{t.signIn}</Link>
        </p>
      </div>
    </div>
  );
}
