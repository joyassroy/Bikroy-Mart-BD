"use client";
import { useState, useEffect } from "react";
import { User, Truck, Star, Package, MapPin, Phone, Mail, ToggleLeft, ToggleRight, Loader2, LogOut, Award, TrendingUp, Clock } from "lucide-react";
import api from "@/lib/axios";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/redux/userSlice";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";

export default function RiderProfilePage() {
  const user = useSelector((state) => state.user?.data);
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [statsRes] = await Promise.all([
          api.get("/riders/stats").catch(() => ({ data: { data: null } })),
        ]);
        setStats(statsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("bm-token");
    localStorage.removeItem("bm-refresh-token");
    localStorage.removeItem("bm-location");
    dispatch(clearUser());
    router.push("/signin");
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl h-40 border border-[#E5E7EB]" />
        <div className="bg-white rounded-2xl h-32 border border-[#E5E7EB]" />
      </div>
    );
  }

  const initials = (user?.name || "R").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-[#00215B] via-[#003087] to-[#00AFCC] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-xl font-bold border border-white/20">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.name || "Rider"}</h1>
            <p className="text-white/60 text-xs mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                stats?.isAvailable ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-white/10 text-white/50 border border-white/20"
              }`}>
                {stats?.isAvailable ? <ToggleRight size={10} /> : <ToggleLeft size={10} />}
                {stats?.isAvailable ? (t.online || "Online") : (t.offline || "Offline")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-2.5">
            <Package size={18} className="text-white" />
          </div>
          <p className="text-xl font-bold text-[#000000]">{stats?.totalDeliveries ?? 0}</p>
          <p className="text-[10px] text-[#667085] font-medium mt-0.5">{t.totalDeliveries || "Total Deliveries"}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-2.5">
            <Star size={18} className="text-white" />
          </div>
          <p className="text-xl font-bold text-[#000000]">{stats?.ratings?.toFixed(1) ?? "0.0"}</p>
          <p className="text-[10px] text-[#667085] font-medium mt-0.5">{t.rating || "Rating"}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-2.5">
            <TrendingUp size={18} className="text-white" />
          </div>
          <p className="text-xl font-bold text-[#000000]">{stats?.todayDelivered ?? 0}</p>
          <p className="text-[10px] text-[#667085] font-medium mt-0.5">{t.todayDeliveries || "Today"}</p>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F4F7FB]">
          <h3 className="font-semibold text-sm text-[#000000]">{t.personalInfo || "Personal Info"}</h3>
        </div>
        <div className="divide-y divide-[#F4F7FB]">
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Phone size={14} className="text-green-500" />
              </div>
              <span className="text-[11px] text-[#667085] font-medium">{t.phone || "Phone"}</span>
            </div>
            <span className="text-xs font-semibold text-[#000000]">{user?.phone || "N/A"}</span>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Mail size={14} className="text-blue-500" />
              </div>
              <span className="text-[11px] text-[#667085] font-medium">{t.email || "Email"}</span>
            </div>
            <span className="text-xs font-semibold text-[#000000]">{user?.email || "N/A"}</span>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <Truck size={14} className="text-orange-500" />
              </div>
              <span className="text-[11px] text-[#667085] font-medium">{t.activeToday || "Active Today"}</span>
            </div>
            <span className="text-xs font-semibold text-[#000000]">{stats?.todayDelivered ?? 0} {t.delivered || "delivered"}</span>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Award size={14} className="text-purple-500" />
              </div>
              <span className="text-[11px] text-[#667085] font-medium">{t.status || "Status"}</span>
            </div>
            <span className={`text-xs font-semibold flex items-center gap-1 ${stats?.isAvailable ? "text-emerald-600" : "text-gray-500"}`}>
              {stats?.isAvailable ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              {stats?.isAvailable ? (t.available || "Available") : (t.offline || "Offline")}
            </span>
          </div>
        </div>
      </div>

      {/* Logout */}
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
