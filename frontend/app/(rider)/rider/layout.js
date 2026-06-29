"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Clock, User, Menu, X, ClipboardList, Loader2, LogOut, Bike } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/redux/userSlice";
import { useAuthChecked } from "@/helper/AuthInit";
import { useLanguage } from "@/i18n/LanguageContext";
import useRiderGPS from "@/helper/useRiderGPS";

const menu = [
  { labelKey: "myDeliveries", href: "/rider", icon: LayoutDashboard },
  { labelKey: "customDeliveries", href: "/rider/custom-deliveries", icon: ClipboardList },
  { labelKey: "history", href: "/rider/history", icon: Clock },
  { labelKey: "myProfile", href: "/rider/profile", icon: User },
];

export default function RiderLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state) => state.user?.data);
  const { authChecked } = useAuthChecked();
  useRiderGPS();

  useEffect(() => {
    if (authChecked && (!user || user.role !== "RIDER")) {
      router.replace("/");
    }
  }, [authChecked, user, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("bm-token");
    dispatch(clearUser());
    router.push("/signin");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#EC008C] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#667085] font-medium">Loading rider panel...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "RIDER") {
    return null;
  }

  const initials = (user?.name || "R").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#F4F7FB]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 lg:w-60 bg-gradient-to-b from-[#00215B] to-[#001A4A] text-white flex-shrink-0 transition-transform duration-300 lg:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="block">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#EC008C] rounded-lg flex items-center justify-center">
                <Bike size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight">Bikroy<span className="text-[#EC008C]">Mart</span>-BD</h2>
                <p className="text-[10px] text-white/40 font-medium">{t.riderPanel || "Rider Panel"}</p>
              </div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-3 text-white/40 hover:text-white p-1 rounded-md hover:bg-white/10 transition">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Rider navigation">
          {menu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#EC008C] text-white shadow-lg shadow-[#EC008C]/25"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={16} className={isActive ? "text-white" : ""} />
                {t[item.labelKey] || item.labelKey}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-[10px] font-bold text-white/80">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white truncate">{user?.name || "Rider"}</p>
              <p className="text-[10px] text-white/40 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={14} />
            {t.logout || "Logout"}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="text-[#364152] p-1.5 rounded-lg hover:bg-[#F4F7FB] transition">
              <Menu size={20} />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#EC008C] rounded-md flex items-center justify-center">
                <Bike size={12} className="text-white" />
              </div>
              <span className="text-xs font-bold text-[#00215B]">Bikroy<span className="text-[#EC008C]">Mart</span></span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#EC008C]/10 flex items-center justify-center text-[9px] font-bold text-[#EC008C]">
                {initials}
              </div>
            </div>
          </div>
        </div>
        <main className="p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
