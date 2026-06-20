"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Clock, User } from "lucide-react";

const menu = [
  { label: "My Deliveries", href: "/rider", icon: LayoutDashboard },
  { label: "History", href: "/rider/history", icon: Clock },
  { label: "Profile", href: "/rider/profile", icon: User },
];

export default function RiderLayout({ children }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-[#F1F4F6]">
      <aside className="w-64 bg-[#004070] text-white flex-shrink-0">
        <div className="p-4 border-b border-[#003050]">
          <h2 className="text-lg font-bold">Bikroy-Mart-BD</h2>
          <p className="text-xs text-white/60">Rider Panel</p>
        </div>
        <nav className="p-3 space-y-1" role="navigation" aria-label="Rider navigation">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition ${
                pathname === item.href ? "bg-[#0067A0] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
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
