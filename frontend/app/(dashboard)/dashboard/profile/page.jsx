"use client";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { LogOut, Mail, Phone, Shield, User } from "lucide-react";
import { clearUser } from "@/redux/userSlice";
import { useLanguage } from "@/i18n/LanguageContext";
import ChangePasswordForm from "@/components/ui/ChangePasswordForm";

export default function AdminProfilePage() {
  const user = useSelector((state) => state.user?.data);
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem("bm-token");
    localStorage.removeItem("bm-refresh-token");
    localStorage.removeItem("bm-location");
    dispatch(clearUser());
    router.push("/signin");
  };

  const initials = (user?.name || "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-gradient-to-br from-[#00215B] via-[#003087] to-[#00AFCC] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-xl font-bold border border-white/20 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{user?.name || "Admin"}</h1>
            <p className="text-white/60 text-xs mt-0.5 truncate">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 border border-white/20">
              <Shield size={10} />
              {t.admin || "Admin"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F4F7FB] flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00215B]/10 flex items-center justify-center">
            <User size={15} className="text-[#00215B]" />
          </div>
          <h3 className="font-semibold text-sm text-[#000000]">
            {t.personalInfo || "Personal Info"}
          </h3>
        </div>
        <div className="divide-y divide-[#F4F7FB]">
          <div className="px-5 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Mail size={14} className="text-blue-500" />
              </div>
              <span className="text-[11px] text-[#667085] font-medium">{t.email || "Email"}</span>
            </div>
            <span className="text-xs font-semibold text-[#000000] truncate">{user?.email || "N/A"}</span>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Phone size={14} className="text-green-500" />
              </div>
              <span className="text-[11px] text-[#667085] font-medium">{t.phone || "Phone"}</span>
            </div>
            <span className="text-xs font-semibold text-[#000000]">{user?.phone || "N/A"}</span>
          </div>
        </div>
      </div>

      <ChangePasswordForm />

      <button
        onClick={handleLogout}
        className="w-full bg-white border border-red-200 text-red-600 py-3 rounded-xl text-xs font-semibold hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <LogOut size={14} />
        {t.logout || "Logout"}
      </button>
    </div>
  );
}
