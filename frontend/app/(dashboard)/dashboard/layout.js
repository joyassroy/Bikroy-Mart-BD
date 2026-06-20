"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, Tag, Truck, MapPin } from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Riders", href: "/dashboard/riders", icon: Truck },
  { label: "Managers", href: "/dashboard/managers", icon: MapPin },
  { label: "Banners", href: "/dashboard/banners", icon: Tag },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F1F4F6]">
      <aside className="w-64 bg-[#003050] text-white flex-shrink-0">
        <div className="p-4 border-b border-[#004070]">
          <h2 className="text-lg font-bold">Bikroy-Mart-BD</h2>
          <p className="text-xs text-white/60">Admin Panel</p>
        </div>
        <nav className="p-3 space-y-1" role="navigation" aria-label="Admin navigation">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition ${
                pathname === item.href
                  ? "bg-[#0067A0] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
