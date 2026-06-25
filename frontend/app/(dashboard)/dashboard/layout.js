"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, Tag, Truck, MapPin, Menu, X } from "lucide-react";
import { useState } from "react";

const menu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { 
    label: "Products", icon: Package, 
    subItems: [
      { label: "All Products", href: "/dashboard/products/all" },
      { label: "Add Product", href: "/dashboard/products/add" },
      { label: "Categories", href: "/dashboard/products/categories" },
      { label: "Subcategories", href: "/dashboard/products/subcategories" },
      { label: "Inventory", href: "/dashboard/products/inventory" }
    ]
  },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Riders", href: "/dashboard/riders", icon: Truck },
  { label: "Managers", href: "/dashboard/managers", icon: MapPin },
  { label: "Banners", href: "/dashboard/banners", icon: Tag },
  { 
    label: "Content", icon: Users,
    subItems: [
      { label: "Blogs", href: "/dashboard/content/blogs" },
      { label: "Email List", href: "/dashboard/content/email-list" },
      { label: "Media Library", href: "/dashboard/content/media-library" },
      { label: "Sponsors", href: "/dashboard/content/sponsors" }
    ]
  },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { 
    label: "Settings", icon: Settings, 
    subItems: [
      { label: "General Settings", href: "/dashboard/settings/general" },
      { label: "User Update", href: "/dashboard/settings/user-update" }
    ]
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState("Products");

  const handleMenuClick = (item) => {
    if (item.subItems) {
      setOpenSubmenu(openSubmenu === item.label ? "" : item.label);
    } else {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7FB]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-56 lg:w-52 bg-[#00215B] text-white flex-shrink-0 transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-3 border-b border-[#001A4A] flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold">Bikroy<span className="text-[#EC008C]">-Mart</span>-BD</h2>
            <p className="text-[9px] text-white/50">Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>
        <nav className="p-2 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Admin navigation">
          {menu.map((item) => (
            <div key={item.label}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => handleMenuClick(item)}
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
                            pathname === sub.href
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
                    pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                      ? "bg-[#EC008C] text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
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

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] lg:hidden">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <button onClick={() => setSidebarOpen(true)} className="text-[#364152] p-1">
              <Menu size={20} />
            </button>
            <span className="text-xs font-bold text-[#00215B]">Bikroy<span className="text-[#EC008C]">-Mart</span>-BD</span>
          </div>
        </div>
        <main className="p-3 sm:p-4">{children}</main>
      </div>
    </div>
  );
}
