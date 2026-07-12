"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, MapPin, Menu, X, ClipboardList, Loader2, Clock, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAuthChecked } from "@/helper/AuthInit";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ManagerLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(pathname.startsWith("/manager/orders") ? "Orders" : "");
  const { authChecked } = useAuthChecked();
  const user = useSelector((state) => state.user?.data);
  const { t } = useLanguage();

  const menu = [
    { label: t.dashboard, href: "/manager", icon: LayoutDashboard },
    { label: t.products, href: "/manager/products", icon: Package },
    {
      label: t.orders, icon: ShoppingCart,
      subItems: [
        { label: t.allOrders, href: "/manager/orders" },
        { label: t.pendingToday, href: "/manager/orders/pending-today" },
        { label: t.todayDelivery, href: "/manager/orders/today-delivery" },
        { label: t.totalSales, href: "/manager/orders/total-sales" },
        { label: t.todaySales, href: "/manager/orders/today-sales" },
      ]
    },
    { label: t.customRequest, href: "/manager/custom-requests", icon: ClipboardList },
    { label: t.inventory, href: "/manager/inventory", icon: Package },
    { label: t.riders, href: "/manager/riders", icon: Users },
    { label: t.history || "History", href: "/manager/history", icon: Clock },
  ];

  useEffect(() => {
    if (authChecked && (!user || user.role !== "MANAGER")) {
      router.replace("/");
    }
  }, [authChecked, user, router]);

  if (!authChecked || !user || user.role !== "MANAGER") {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#EC008C]" />
      </div>
    );
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
            <p className="text-[9px] text-white/50">{t.managerPanel}</p>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>
        <nav className="p-2 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Manager navigation">
          {menu.map((item) => (
            <div key={item.label || item.href}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => setOpenSubmenu(openSubmenu === item.label ? "" : item.label)}
                    className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-[11px] font-medium transition text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon size={15} />
                      {item.label}
                    </div>
                    <span className="text-xs">{openSubmenu === item.label ? "▼" : "▶"}</span>
                  </button>
                  {openSubmenu === item.label && (
                    <div className="pl-8 space-y-0.5 mt-0.5">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-2.5 py-1.5 rounded-md text-[10px] font-medium transition ${
                            pathname === sub.href || (sub.href === "/manager/orders" && pathname.startsWith("/manager/orders"))
                              ? "bg-[#EC008C] text-white"
                              : "text-white/60 hover:text-white"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px] font-medium transition ${
                    pathname === item.href ? "bg-[#EC008C] text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              )}
            </div>
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
