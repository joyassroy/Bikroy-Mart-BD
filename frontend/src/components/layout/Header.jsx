"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, User, MapPin, Menu, X, ChevronDown, Globe, ClipboardList, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import LocationSelector from "./LocationSelector";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuthChecked } from "@/helper/AuthInit";

const categories = [
  { name: "food", slug: "food", icon: "🍞" },
  { name: "fruitsVegetables", slug: "fruits-vegetables", icon: "🥬" },
  { name: "meatFish", slug: "meat-fish", icon: "🥩" },
  { name: "dairyEggs", slug: "dairy-eggs", icon: "🥛" },
  { name: "drinks", slug: "drinks-beverages", icon: "☕" },
  { name: "snacks", slug: "snacks-frozen", icon: "🍪" },
  { name: "cooking", slug: "cooking-essentials", icon: "🍳" },
  { name: "beauty", slug: "beauty-health", icon: "✨" },
  { name: "homeCleaning", slug: "home-cleaning", icon: "🧹" },
  { name: "baby", slug: "baby-care", icon: "👶" },
];

export default function Header() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.user.data);
  const location = useSelector((state) => state.location);
  const { language, t, setLang } = useLanguage();
  const pathname = usePathname();
  const { authChecked } = useAuthChecked();

  const cartCount = mounted ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const getCategoryName = (key) => t[key] || key;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* Promo bar */}
        <div className="hidden md:block bg-[#00215B] text-white text-xs">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-1.5 flex justify-between items-center">
            <span className="font-semibold">{t.freeDelivery}</span>
            <div className="flex gap-5">
              <Link href="/track-order" className="hover:underline transition">{t.trackOrder}</Link>
              <Link href="/store-locator" className="hover:underline transition">{t.storeLocator}</Link>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10">
            <div className="flex items-center gap-2 sm:gap-3 py-2 md:py-2.5">
              {/* Hamburger - mobile & tablet */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden text-[#364152] p-1.5 -ml-1 rounded-md hover:bg-[#F3F4F6] transition flex-shrink-0"
                aria-label="Menu"
              >
                <Menu size={22} />
              </button>

              {/* Logo - desktop only */}
              <Link href="/" className="hidden lg:flex flex-shrink-0">
                <span className="text-lg font-bold text-[#00215B] tracking-tight whitespace-nowrap">
                  Bikroy<span className="text-[#EC008C]">-Mart</span>-BD
                </span>
              </Link>

              {/* Location - tablet+ */}
              <button
                onClick={() => setLocationOpen(!locationOpen)}
                className="hidden md:flex items-center gap-1 text-[#364152] text-[11px] border border-[#E5E7EB] rounded-md px-2.5 py-1.5 hover:bg-[#F3F4F6] transition flex-shrink-0"
              >
                <MapPin size={14} className="text-[#EC008C]" />
                <span className="max-w-[80px] truncate">{location.district || t.selectLocation}</span>
                <ChevronDown size={10} />
              </button>

              {/* Search */}
              <div className="flex-1 min-w-0">
                <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`); }} className="relative flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full rounded-l-md px-3 sm:px-4 text-xs sm:text-[13px] bg-white text-[#000000] placeholder:text-[#99A0B4] border border-[#E5E7EB] border-r-0 focus:outline-none focus:border-[#E5E7EB] h-[38px] md:h-[42px] transition-all"
                    aria-label={t.searchPlaceholder}
                  />
                  <button
                    type="submit"
                    className="bg-[#EC008C] text-white px-3 sm:px-4 rounded-r-md hover:bg-[#D60071] transition flex items-center justify-center h-[38px] md:h-[42px] flex-shrink-0"
                    aria-label={t.searchPlaceholder}
                  >
                    <Search size={16} />
                  </button>
                </form>
              </div>

              {/* Language */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 text-[#364152] hover:bg-[#F3F4F6] p-1.5 rounded-md transition"
                  aria-label={t.language}
                >
                  <Globe size={16} className="text-[#EC008C]" />
                  <span className="hidden sm:inline text-[11px] font-semibold">
                    {language === "bn" ? "বাং" : "EN"}
                  </span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-[rgba(0,0,0,0.1)_0px_2px_4px_0px] border border-[#E5E7EB] py-1 w-32 z-50">
                    <button onClick={() => { setLang("en"); setLangOpen(false); }} className={`w-full px-2.5 py-1.5 text-left text-[11px] flex items-center gap-2 hover:bg-[#F3F4F6] transition ${language === "en" ? "text-[#EC008C] font-semibold" : "text-[#364152]"}`}>
                      <span>🇺🇸</span> English {language === "en" && <span className="ml-auto">✓</span>}
                    </button>
                    <button onClick={() => { setLang("bn"); setLangOpen(false); }} className={`w-full px-2.5 py-1.5 text-left text-[11px] flex items-center gap-2 hover:bg-[#F3F4F6] transition ${language === "bn" ? "text-[#EC008C] font-semibold" : "text-[#364152]"}`}>
                      <span>🇧🇩</span> বাংলা {language === "bn" && <span className="ml-auto">✓</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Link href="/wishlist" className="hidden sm:flex text-[#364152] hover:bg-[#F3F4F6] p-1.5 rounded-md transition" aria-label={t.wishlist}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </Link>
                <Link href="/cart" className="relative text-[#364152] hover:bg-[#F3F4F6] p-1.5 rounded-md transition" aria-label={`${t.cart}, ${cartCount} items`}>
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#EC008C] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold leading-none">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
                {authChecked ? (
                  <Link href={user ? "/account" : "/signin"} className="text-[#364152] hover:bg-[#F3F4F6] p-1.5 rounded-md transition" aria-label={user ? t.myAccount : t.signIn}>
                    <User size={18} />
                  </Link>
                ) : (
                  <span className="p-1.5"><Loader2 size={18} className="animate-spin text-gray-300" /></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category nav - desktop only */}
        <nav className="hidden lg:block bg-white border-b border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto px-10">
            <div className="flex items-center">
              <div className="relative" onMouseEnter={() => setMegaMenuOpen(true)} onMouseLeave={() => setMegaMenuOpen(false)}>
                <button className="flex items-center gap-2 bg-[#00215B] text-white px-3.5 py-2 text-[11px] font-semibold hover:bg-[#001A4A] transition rounded-md">
                  <Menu size={14} />{t.allCategories}<ChevronDown size={10} />
                </button>
                {megaMenuOpen && (
                  <div className="absolute top-full left-0 bg-white border border-[#E5E7EB] rounded-b-md shadow-[rgba(0,0,0,0.1)_0px_2px_4px_0px] w-56 z-50">
                    {categories.map((cat) => (
                      <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="flex items-center gap-2 px-3 py-2 hover:bg-[#F4F7FB] text-[11px] text-[#364152] hover:text-[#EC008C] transition">
                        <span className="text-base">{cat.icon}</span>{getCategoryName(cat.name)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {categories.slice(0, 6).map((cat) => (
                <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="px-2.5 py-2 text-[11px] text-[#364152] hover:text-[#EC008C] hover:bg-[#FCE8F3] transition font-semibold">
                  {getCategoryName(cat.name)}
                </Link>
              ))}
              <Link href="/shop" className="px-2.5 py-2 text-[11px] text-[#EC008C] font-semibold hover:bg-[#FCE8F3] transition">{t.viewAll}</Link>
              <Link href="/custom-request" className="px-2.5 py-2 text-[11px] text-[#364152] hover:text-[#EC008C] hover:bg-[#FCE8F3] transition font-semibold flex items-center gap-1">
                <ClipboardList size={12} />{t.customRequest}
              </Link>
            </div>
          </div>
        </nav>

        {locationOpen && <LocationSelector onClose={() => setLocationOpen(false)} />}
      </header>

      {/* ====== MOBILE ONLY (entire block hidden on lg+) ====== */}
      <div className="fixed inset-0 pointer-events-none lg:hidden" style={{ zIndex: 0 }}>
        {/* Drawer overlay */}
        <div
          className={`fixed inset-0 bg-black/40 transition-opacity pointer-events-auto ${drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl transition-transform duration-200 ease-out pointer-events-auto ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-3 border-b border-[#E5E7EB]">
            <Link href="/" onClick={() => setDrawerOpen(false)}>
              <span className="text-base font-bold text-[#00215B]">Bikroy<span className="text-[#EC008C]">-Mart</span>-BD</span>
            </Link>
            <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-md hover:bg-[#F3F4F6] transition text-[#364152]" aria-label="Close menu">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100%-56px)] pb-20">
            <div className="p-3 border-b border-[#E5E7EB]">
              <Link href={authChecked ? (user ? "/account" : "/signin") : "#"} onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F4F7FB] flex items-center justify-center">
                  <User size={18} className="text-[#667085]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#000000]">{authChecked ? (user ? user.name : t.signIn) : "..."}</p>
                  <p className="text-[10px] text-[#667085]">{authChecked ? (user ? user.email : t.myAccount) : "..."}</p>
                </div>
              </Link>
            </div>

            <div className="p-3 border-b border-[#E5E7EB]">
              <Link href="/track-order" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5 py-2 text-xs text-[#364152] font-medium hover:text-[#EC008C] transition">
                <MapPin size={16} className="text-[#EC008C]" />{t.trackOrder}
              </Link>
              <Link href="/wishlist" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5 py-2 text-xs text-[#364152] font-medium hover:text-[#EC008C] transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                {t.wishlist}
              </Link>
              <Link href="/custom-request" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5 py-2 text-xs text-[#364152] font-medium hover:text-[#EC008C] transition">
                <ClipboardList size={16} className="text-[#EC008C]" />{t.customRequest}
              </Link>
            </div>

            <div className="p-3">
              <p className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-2">{t.allCategories}</p>
              <div className="space-y-0.5">
                {categories.map((cat) => (
                  <Link key={cat.slug} href={`/shop?category=${cat.slug}`} onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5 px-2 py-2.5 hover:bg-[#F4F7FB] rounded-md transition">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-xs font-medium text-[#364152]">{getCategoryName(cat.name)}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-[#E5E7EB]">
              <p className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-2">{t.language}</p>
              <div className="flex gap-2">
                <button onClick={() => { setLang("en"); setDrawerOpen(false); }} className={`flex-1 py-2 rounded-md text-xs font-semibold transition border ${language === "en" ? "bg-[#EC008C] text-white border-[#EC008C]" : "bg-white text-[#364152] border-[#E5E7EB] hover:bg-[#F4F7FB]"}`}>
                  🇺🇸 English
                </button>
                <button onClick={() => { setLang("bn"); setDrawerOpen(false); }} className={`flex-1 py-2 rounded-md text-xs font-semibold transition border ${language === "bn" ? "bg-[#EC008C] text-white border-[#EC008C]" : "bg-white text-[#364152] border-[#E5E7EB] hover:bg-[#F4F7FB]"}`}>
                  🇧🇩 বাংলা
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-[0_-2px_8px_rgba(0,0,0,0.08)] pb-[max(6px,env(safe-area-inset-bottom))] pointer-events-auto">
          <div className="flex items-center justify-around py-1.5">
            <Link href="/" className={`flex flex-col items-center gap-0.5 min-w-[50px] ${pathname === "/" ? "text-[#EC008C]" : "text-[#667085]"}`}>
              <span className="text-base font-bold text-[#00215B] leading-none">BM</span>
              <span className="text-[9px] font-semibold">{t.home}</span>
            </Link>
            <button onClick={() => setDrawerOpen(true)} className="flex flex-col items-center gap-0.5 min-w-[50px] text-[#667085]">
              <Menu size={20} />
              <span className="text-[9px] font-semibold">{t.categories}</span>
            </button>
            <Link href="/cart" className={`relative flex flex-col items-center gap-0.5 min-w-[50px] ${pathname === "/cart" ? "text-[#EC008C]" : "text-[#667085]"}`}>
              <div className="relative">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#EC008C] text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-semibold">{t.cart}</span>
            </Link>
            <Link href={authChecked ? (user ? "/account" : "/signin") : "#"} className={`flex flex-col items-center gap-0.5 min-w-[50px] ${pathname === "/account" || pathname === "/signin" ? "text-[#EC008C]" : "text-[#667085]"}`}>
              <User size={20} />
              <span className="text-[9px] font-semibold">{authChecked ? (user ? t.myAccount : t.signIn) : "..."}</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
