"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Clock, User, Menu, X, ClipboardList, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAuthChecked } from "@/helper/AuthInit";

const menu = [
  { label: "My Deliveries", href: "/rider", icon: LayoutDashboard },
  { label: "Custom Deliveries", href: "/rider/custom-deliveries", icon: ClipboardList },
  { label: "History", href: "/rider/history", icon: Clock },
  { label: "Profile", href: "/rider/profile", icon: User },
];

export default function RiderLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state) => state.user?.data);
  const { authChecked } = useAuthChecked();

  useEffect(() => {
    if (authChecked && (!user || user.role !== "RIDER")) {
      router.replace("/");
    }
  }, [authChecked, user, router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#EC008C]" />
      </div>
    );
  }

  if (!user || user.role !== "RIDER") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#F4F7FB]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-56 lg:w-52 bg-[#00215B] text-white flex-shrink-0 transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-3 border-b border-[#001A4A] flex items-center justify-between">
          <Link href="/" className="block">
            <h2 className="text-xs font-bold">Bikroy<span className="text-[#EC008C]">-Mart</span>-BD</h2>
            <p className="text-[9px] text-white/50">Rider Panel</p>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>
        <nav className="p-2 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Rider navigation">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px] font-medium transition ${
                pathname === item.href ? "bg-[#EC008C] text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] lg:hidden">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <button onClick={() => setSidebarOpen(true)} className="text-[#364152] p-1">
              <Menu size={20} />
            </button>
            <Link href="/" className="text-xs font-bold text-[#00215B]">Bikroy<span className="text-[#EC008C]">-Mart</span>-BD</Link>
          </div>
        </div>
        <main className="p-3 sm:p-4">{children}</main>
      </div>
    </div>
  );
}
