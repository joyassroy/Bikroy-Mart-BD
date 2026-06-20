"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, MapPin, Menu, X, ChevronDown, Globe } from "lucide-react";
import { useSelector } from "react-redux";
import LocationSelector from "./LocationSelector";
import { useLanguage } from "@/i18n/LanguageContext";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.user.data);
  const location = useSelector((state) => state.location);
  const { language, t, setLang } = useLanguage();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getCategoryName = (key) => t[key] || key;

  return (
    <header className="sticky top-0 z-50">
      {/* Promo bar */}
      <div className="bg-[#003050] text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <span>{t.freeDelivery}</span>
          <div className="hidden sm:flex gap-6">
            <Link href="/track-order" className="hover:underline transition">{t.trackOrder}</Link>
            <Link href="/store-locator" className="hover:underline transition">{t.storeLocator}</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-[#0067A0] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-white tracking-tight">
                Bikroy<span className="text-white/80">-Mart</span>-BD
              </span>
            </Link>

            {/* Location */}
            <button
              onClick={() => setLocationOpen(!locationOpen)}
              className="hidden md:flex items-center gap-2 text-white text-sm border border-white/30 rounded-lg px-4 py-2.5 hover:bg-white/10 transition"
            >
              <MapPin size={18} />
              <span>{location.district || t.selectLocation}</span>
              <ChevronDown size={14} />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="w-full rounded-lg px-4 py-2 pr-12 text-base bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label={t.searchPlaceholder}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#005090] text-white p-2.5 rounded-lg hover:bg-[#004070] transition"
                  aria-label={t.searchPlaceholder}
                >
                  <Search size={18} />
                </button>
              </div>
            </div>

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 text-white hover:bg-white/10 p-2.5 rounded-lg transition"
                aria-label={t.language}
              >
                <Globe size={22} />
                <span className="hidden sm:inline text-sm font-medium">
                  {language === "bn" ? "বাং" : "EN"}
                </span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-40 z-50">
                  <button
                    onClick={() => { setLang("en"); setLangOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-50 transition ${
                      language === "en" ? "text-[#0067A0] font-semibold" : "text-gray-700"
                    }`}
                  >
                    <span>🇺🇸</span> English
                    {language === "en" && <span className="ml-auto">✓</span>}
                  </button>
                  <button
                    onClick={() => { setLang("bn"); setLangOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-50 transition ${
                      language === "bn" ? "text-[#0067A0] font-semibold" : "text-gray-700"
                    }`}
                  >
                    <span>🇧🇩</span> বাংলা
                    {language === "bn" && <span className="ml-auto">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/wishlist"
                className="hidden sm:flex text-white hover:bg-white/10 p-2.5 rounded-lg transition"
                aria-label={t.wishlist}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </Link>
              <Link
                href="/cart"
                className="relative text-white hover:bg-white/10 p-2.5 rounded-lg transition"
                aria-label={`${t.cart}, ${cartCount} items`}
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C30000] text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href={user ? "/account" : "/signin"}
                className="text-white hover:bg-white/10 p-2.5 rounded-lg transition"
                aria-label={user ? t.myAccount : t.signIn}
              >
                <User size={24} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="hidden lg:block bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center">
            <div
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button className="flex items-center gap-2 bg-[#323A3E] text-white px-5 py-3 text-sm font-semibold hover:bg-[#222] transition">
                <Menu size={18} />
                {t.allCategories}
                <ChevronDown size={14} />
              </button>

              {megaMenuOpen && (
                <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-b-lg shadow-xl w-72 z-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-sm text-gray-700 hover:text-[#0067A0] transition"
                    >
                      <span className="text-xl">{cat.icon}</span>
                      {getCategoryName(cat.name)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="px-4 py-3 text-sm text-gray-600 hover:text-[#0067A0] hover:bg-blue-50 transition font-medium"
              >
                {getCategoryName(cat.name)}
              </Link>
            ))}

            <Link href="/shop" className="px-4 py-3 text-sm text-[#0067A0] font-semibold hover:bg-blue-50 transition">
              {t.viewAll}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="p-4 space-y-1">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg text-gray-700 transition text-base font-medium"
              >
                <span className="text-xl">{cat.icon}</span>
                {getCategoryName(cat.name)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {locationOpen && (
        <LocationSelector onClose={() => setLocationOpen(false)} />
      )}
    </header>
  );
}
