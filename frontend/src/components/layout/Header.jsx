"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, User, MapPin, Menu, X, ChevronDown, ChevronRight, Globe, ClipboardList, Loader2, LayoutDashboard, ChevronUp, Wheat, Apple, Beef, Egg, Coffee, Cookie, Droplets, ChefHat, Cake, Sparkles, SprayCan, Baby, Package, Tag, Gift, TrendingUp, Building2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import LocationSelector from "./LocationSelector";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuthChecked } from "@/helper/AuthInit";
import api from "@/lib/axios";
import { setQuery, setShowDropdown, addRecentSearch, clearRecentSearches as clearAllRecentSearches, fetchSuggestions } from "@/redux/searchSlice";

const CATEGORY_ICON_MAP = {
  Wheat, Apple, Beef, Egg, Coffee, Cookie, Droplets, ChefHat, Cake, Sparkles, SprayCan, Baby,
  Package,
};

const FALLBACK_CATEGORIES = [
  { nameEn: "Rice & Grains", nameBn: "চাল ও খাদ্যশস্য", slug: "rice-grains", icon: "Wheat", subcategories: [] },
  { nameEn: "Fruits & Vegetables", nameBn: "ফল ও সবজি", slug: "fruits-vegetables", icon: "Apple", subcategories: [] },
  { nameEn: "Meat & Fish", nameBn: "মাংস ও মাছ", slug: "meat-fish", icon: "Beef", subcategories: [] },
  { nameEn: "Dairy & Eggs", nameBn: "দুগ্ধজাত ও ডিম", slug: "dairy-eggs", icon: "Egg", subcategories: [] },
  { nameEn: "Drinks & Beverages", nameBn: "পানীয়", slug: "drinks-beverages", icon: "Coffee", subcategories: [] },
  { nameEn: "Snacks & Chips", nameBn: "স্ন্যাক্স", slug: "snacks-chips", icon: "Cookie", subcategories: [] },
  { nameEn: "Oil & Ghee", nameBn: "তেল ও ঘি", slug: "oil-ghee", icon: "Droplets", subcategories: [] },
  { nameEn: "Spices & Condiments", nameBn: "মসলা", slug: "spices-condiments", icon: "ChefHat", subcategories: [] },
  { nameEn: "Bakery & Biscuits", nameBn: "বেকারি ও বিস্কুট", slug: "bakery-biscuits", icon: "Cake", subcategories: [] },
  { nameEn: "Beauty & Health", nameBn: "সৌন্দর্য ও স্বাস্থ্য", slug: "beauty-health", icon: "Sparkles", subcategories: [] },
  { nameEn: "Home Cleaning", nameBn: "বাসা পরিষ্কার", slug: "home-cleaning", icon: "SprayCan", subcategories: [] },
  { nameEn: "Baby Care", nameBn: "শিশু যত্ন", slug: "baby-care", icon: "Baby", subcategories: [] },
];

function CategoryIcon({ icon, size = 22, className = "" }) {
  if (!icon) return <Package size={size} className={className} />;
  const IconComp = CATEGORY_ICON_MAP[icon];
  if (IconComp) return <IconComp size={size} className={className} />;
  return <Package size={size} className={className} />;
}

const NAV_OFFER_LINKS = [
  { label: "Combo Offer", labelBn: "কম্বো অফার", href: "/shop?offer=COMBO", icon: Package },
  { label: "Executive", labelBn: "এক্সিকিউটিভ", href: "/shop?offer=EXECUTIVE", icon: Sparkles },
  { label: "Stock Clearance", labelBn: "স্টক ক্লিয়ারেন্স", href: "/shop?offer=STOCK_CLEARANCE", icon: Tag },
  { label: "BOGO", labelBn: "বাই ওয়ান গেট ওয়ান", href: "/shop?offer=BOGO", icon: Gift },
  { label: "Custom Offer", labelBn: "কাস্টম অফার", href: "/shop?offer=CUSTOM", icon: Tag },
];

function HeaderContent() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [hoveredCatSlug, setHoveredCatSlug] = useState(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);
  const [expandedCats, setExpandedCats] = useState({});
  const [promoTexts, setPromoTexts] = useState({ freeDelivery: "", deliveryCutoff: "" });
  const megaMenuRef = useRef(null);
  const searchWrapperRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.user.data);
  const location = useSelector((state) => state.location);
  const { query: searchQuery, suggestions: searchSuggestions, recentSearches, showDropdown: showSuggestions, loadingSuggestions, isPopular } = useSelector((state) => state.search);
  const dispatch = useDispatch();
  const { language, t, setLang } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { authChecked } = useAuthChecked();
  const activeOffer = searchParams.get("offer");

  const cartCount = mounted ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const categories = apiCategories.length > 0 ? apiCategories : FALLBACK_CATEGORIES;
  const catName = (cat) => language === "bn" ? (cat.nameBn || cat.nameEn) : cat.nameEn;
  const subName = (sub) => language === "bn" ? (sub.nameBn || sub.nameEn) : sub.nameEn;
  const getDashboardHref = () => {
    if (!user) return "/signin";
    if (user.role === "ADMIN") return "/dashboard";
    if (user.role === "MANAGER") return "/manager";
    if (user.role === "RIDER") return "/rider";
    return "/account";
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    api.get("/categories")
      .then((res) => {
        const data = res.data.data || [];
        if (data.length > 0) {
          setApiCategories(data.map((cat) => ({
            nameEn: cat.name,
            nameBn: cat.nameBn || cat.name,
            slug: cat.slug,
            icon: cat.icon || "📦",
            image: cat.image,
            subcategories: (cat.subcategories || []).map((sub) => ({
              nameEn: sub.name,
              nameBn: sub.nameBn || sub.name,
              slug: sub.slug,
              image: sub.image,
            })),
          })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      dispatch(fetchSuggestions(searchQuery));
    }, 300);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [searchQuery, dispatch]);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        dispatch(setShowDropdown(false));
      }
    };
    const closeOnScroll = () => dispatch(setShowDropdown(false));
    document.addEventListener("mousedown", closeDropdown);
    document.addEventListener("touchstart", closeDropdown);
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", closeDropdown);
      document.removeEventListener("touchstart", closeDropdown);
      window.removeEventListener("scroll", closeOnScroll);
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(setShowDropdown(false));
    dispatch(setQuery(""));
  }, [pathname, dispatch]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && drawerOpen) setDrawerOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [drawerOpen]);

  useEffect(() => {
    api.get("/settings/public")
      .then((res) => {
        const s = res.data.data || {};
        const isBn = language === "bn";
        setPromoTexts({
          freeDelivery: isBn ? (s.freeDeliveryTextBn || s.freeDeliveryText || t.freeDelivery) : (s.freeDeliveryText || t.freeDelivery),
          deliveryCutoff: isBn ? (s.deliveryCutoffBn || s.deliveryCutoff || t.deliveryCutoff) : (s.deliveryCutoff || t.deliveryCutoff),
        });
      })
      .catch(() => {});
  }, [language]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleSearchSelect = (term) => {
    dispatch(setQuery(term));
    dispatch(setShowDropdown(false));
    dispatch(addRecentSearch(term));
    router.push(`/shop?search=${encodeURIComponent(term)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(setShowDropdown(false));
      dispatch(addRecentSearch(searchQuery.trim()));
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* Promo bar */}
        <div className="hidden md:block bg-[#00215B] text-white text-xs overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-1.5 flex justify-between items-center">
            <div className="font-semibold whitespace-nowrap overflow-hidden flex-1 mr-4">
              <div className="inline-block animate-marquee">
                <span className="mx-8">{promoTexts.freeDelivery || t.freeDelivery}</span>
                <span className="mx-8">|</span>
                <span className="mx-8">⏰ {promoTexts.deliveryCutoff || t.deliveryCutoff}</span>
                <span className="mx-8">|</span>
                <span className="mx-8">{promoTexts.freeDelivery || t.freeDelivery}</span>
                <span className="mx-8">|</span>
                <span className="mx-8">⏰ {promoTexts.deliveryCutoff || t.deliveryCutoff}</span>
              </div>
            </div>
            <div className="flex gap-5 flex-shrink-0">
              <Link href="/track-order" className="hover:underline transition">{t.trackOrder}</Link>
              <Link href="/store-locator" className="hover:underline transition">{t.storeLocator}</Link>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="bg-white">
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
              <Link href="/" className="hidden lg:flex flex-shrink-0 items-center">
                <img src="/icon.png" alt="Bikroy-Mart-BD" className="h-20 w-auto" />
              </Link>

              {/* Location - mobile */}
              <button
                onClick={() => setLocationOpen(!locationOpen)}
                className="md:hidden flex items-center gap-1 text-[#364152] text-[11px] border border-[#E5E7EB] rounded-md px-2 py-1.5 hover:bg-[#F3F4F6] transition flex-shrink-0"
              >
                <MapPin size={14} className="text-[#EC008C]" />
                <span className="max-w-[70px] truncate">{location.district || t.selectLocation}</span>
                <ChevronDown size={10} />
              </button>

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
              <div className="flex-1 min-w-0 relative" ref={searchWrapperRef}>
                <form onSubmit={handleSearchSubmit} className="relative flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { dispatch(setQuery(e.target.value)); dispatch(setShowDropdown(true)); }}
                    onFocus={() => dispatch(setShowDropdown(true))}
                    placeholder={t.searchPlaceholder}
                    className="w-full rounded-l-md px-3 sm:px-4 text-xs sm:text-[13px] bg-white text-[#000000] placeholder:text-[#99A0B4] border border-[#E5E7EB] border-r-0 focus:outline-none focus:border-transparent h-[38px] md:h-[42px] transition-all"
                    aria-label={t.searchPlaceholder}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="bg-[#EC008C] text-white px-3 sm:px-4 rounded-r-md hover:bg-[#D60071] transition flex items-center justify-center h-[38px] md:h-[42px] flex-shrink-0"
                    aria-label={t.searchPlaceholder}
                  >
                    <Search size={16} />
                  </button>
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && (searchQuery.trim().length === 0 ? recentSearches.length > 0 || loadingSuggestions || isPopular : searchSuggestions.length > 0 || loadingSuggestions) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 max-h-[300px] overflow-y-auto">
                    {searchQuery.trim().length === 0 ? (
                      <div>
                        {recentSearches.length > 0 && (
                          <>
                            <div className="flex items-center justify-between px-3 py-2 border-b border-[#E5E7EB]">
                              <span className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Recent Searches</span>
                              <button onClick={() => dispatch(clearAllRecentSearches())} className="text-[10px] text-[#EC008C] font-semibold hover:underline">Clear all</button>
                            </div>
                            {recentSearches.map((term, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSearchSelect(term)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[#364152] hover:bg-[#F4F7FB] transition text-left"
                              >
                                <span className="text-[#99A0B4] flex-shrink-0"><Search size={12} /></span>
                                <span className="truncate">{term}</span>
                              </button>
                            ))}
                          </>
                        )}
                        {loadingSuggestions && (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 size={16} className="animate-spin text-[#EC008C]" />
                          </div>
                        )}
                        {!loadingSuggestions && isPopular && searchSuggestions.length > 0 && (
                          <>
                            <div className="flex items-center px-3 py-2 border-b border-[#E5E7EB]">
                              <span className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Popular Products</span>
                            </div>
                            {searchSuggestions.map((item, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSearchSelect(typeof item === "string" ? item : item.name)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[#364152] hover:bg-[#F4F7FB] transition text-left"
                              >
                                <span className="text-[#EC008C] flex-shrink-0"><TrendingUp size={12} /></span>
                                <span className="truncate">{typeof item === "string" ? item : item.name}</span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="px-3 py-2 border-b border-[#E5E7EB]">
                          <span className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Suggestions</span>
                        </div>
                        {loadingSuggestions ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 size={16} className="animate-spin text-[#EC008C]" />
                          </div>
                        ) : searchSuggestions.length === 0 ? (
                          <div className="px-3 py-4 text-center text-[11px] text-[#99A0B4]">No suggestions found</div>
                        ) : (
                          searchSuggestions.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSearchSelect(typeof item === "string" ? item : item.name)}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[#364152] hover:bg-[#F4F7FB] transition text-left"
                            >
                              <span className="text-[#99A0B4] flex-shrink-0"><Search size={12} /></span>
                              <span className="truncate">{typeof item === "string" ? item : item.name}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
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
                {authChecked && user && user.role && user.role !== "CUSTOMER" && (user.role === "ADMIN" || user.role === "MANAGER" || user.role === "RIDER") && (
                  <Link href={getDashboardHref()} className="hidden sm:flex items-center gap-1 text-[#364152] hover:bg-[#F3F4F6] p-1.5 rounded-md transition text-[11px] font-semibold" aria-label="Dashboard">
                    <LayoutDashboard size={16} className="text-[#EC008C]" />
                    <span className="hidden md:inline">{user.role === "ADMIN" ? "Admin" : user.role === "MANAGER" ? "Manager" : "Rider"}</span>
                  </Link>
                )}
                <Link href="/product-request" className="hidden sm:flex text-[#364152] hover:bg-[#F3F4F6] p-1.5 rounded-md transition" aria-label={t.customRequest}>
                  <ClipboardList size={18} className="text-[#EC008C]" />
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
                  user ? (
                    <Link href="/account" className="text-[#364152] hover:bg-[#F3F4F6] p-1.5 rounded-md transition" aria-label={t.myAccount}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-[18px] h-[18px] rounded-full object-cover" />
                      ) : (
                        <User size={18} />
                      )}
                    </Link>
                  ) : (
                    <Link href="/signin" className="hidden sm:flex items-center gap-1.5 bg-[#EC008C] hover:bg-[#D60071] text-white px-3 py-1.5 rounded-md transition text-[11px] font-semibold" aria-label={t.signIn}>
                      <User size={14} />
                      <span>{t.signIn}</span>
                    </Link>
                  )
                ) : (
                  <span className="p-1.5"><Loader2 size={18} className="animate-spin text-gray-300" /></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category + Offer nav - desktop only */}
        <nav className="hidden lg:block bg-white">
          <div className="max-w-[1200px] mx-auto px-10">
            <div className="flex items-center">
              {/* Mega Menu Trigger */}
              <div
                ref={megaMenuRef}
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => { setMegaMenuOpen(false); setHoveredCatSlug(null); }}
              >
                <button className="flex items-center gap-2 bg-[#00215B] text-white px-4 py-2.5 text-base sm:text-lg font-semibold hover:bg-[#001A4A] transition rounded-b-md">
                  <Menu size={15} />
                  {t.allCategories}
                  <ChevronDown size={11} className={`transition-transform ${megaMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {megaMenuOpen && (
                  <div className="absolute top-full left-0 bg-white border border-[#E5E7EB] rounded-b-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 flex overflow-hidden" style={{ minWidth: 640, maxHeight: 520 }}>
                    {/* Left: Category List */}
                    <div className="w-[280px] border-r border-[#E5E7EB] overflow-y-auto flex-shrink-0" style={{ background: "linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)" }}>
                      <div className="p-2.5">
                        {categories.map((cat, idx) => {
                          const isActive = hoveredCatSlug === cat.slug;
                          const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                          return (
                            <div
                              key={cat.slug}
                              onMouseEnter={() => setHoveredCatSlug(cat.slug)}
                              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base sm:text-lg cursor-pointer transition-all duration-150 ${
                                isActive
                                  ? "bg-[#FCE8F3] text-[#EC008C] shadow-sm"
                                  : "text-[#364152] hover:bg-white hover:shadow-sm"
                              }`}
                              style={{ animationDelay: `${idx * 20}ms` }}
                            >
                              <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? "bg-[#EC008C]/10 text-[#EC008C]" : "bg-[#F4F7FB] text-[#00215B]"}`}>
                                <CategoryIcon icon={cat.icon} size={22} />
                              </span>
                              <span className="flex-1 font-semibold truncate">{catName(cat)}</span>
                              {hasSubs && (
                                <ChevronRight size={14} className={`flex-shrink-0 transition-transform ${isActive ? "text-[#EC008C] translate-x-0.5" : "text-gray-300"}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Subcategory Panel */}
                    <div className="flex-1 overflow-y-auto" style={{ minWidth: 360 }}>
                      {hoveredCatSlug && (() => {
                        const hovered = categories.find((c) => c.slug === hoveredCatSlug);
                        if (!hovered) return (
                          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <span className="w-16 h-16 rounded-2xl bg-[#F4F7FB] flex items-center justify-center mb-4 text-[#00215B]">
                              <CategoryIcon icon={hovered?.icon} size={32} />
                            </span>
                            <p className="text-base font-bold text-[#364152]">{catName(hovered)}</p>
                            <Link
                              href={`/shop?category=${hoveredCatSlug}`}
                              onClick={() => { setMegaMenuOpen(false); setHoveredCatSlug(null); }}
                              className="mt-3 text-[12px] font-semibold text-[#EC008C] hover:underline"
                            >
                              View All Products →
                            </Link>
                          </div>
                        );
                        if (!hovered.subcategories || hovered.subcategories.length === 0) return (
                          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <span className="w-16 h-16 rounded-2xl bg-[#FCE8F3] flex items-center justify-center mb-4 text-[#EC008C]">
                              <CategoryIcon icon={hovered.icon} size={32} />
                            </span>
                            <p className="text-base font-bold text-[#364152] mb-1">{catName(hovered)}</p>
                            <p className="text-[12px] text-[#667085] mb-4">No subcategories yet</p>
                            <Link
                              href={`/shop?category=${hoveredCatSlug}`}
                              onClick={() => { setMegaMenuOpen(false); setHoveredCatSlug(null); }}
                              className="bg-[#EC008C] text-white text-[12px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#D60071] transition"
                            >
                              Browse {catName(hovered)}
                            </Link>
                          </div>
                        );
                        return (
                          <div className="p-5">
                            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-[#E5E7EB]">
                              <span className="w-12 h-12 rounded-xl bg-[#FCE8F3] flex items-center justify-center text-[#EC008C]">
                                <CategoryIcon icon={hovered.icon} size={26} />
                              </span>
                              <div>
                                <p className="text-base sm:text-lg font-bold text-[#00215B]">{catName(hovered)}</p>
                                <p className="text-[11px] text-[#667085]">{hovered.subcategories.length} subcategories</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {hovered.subcategories.map((sub) => (
                                <Link
                                  key={sub.slug}
                                  href={`/shop?category=${hoveredCatSlug}&subcategory=${sub.slug}`}
                                  onClick={() => { setMegaMenuOpen(false); setHoveredCatSlug(null); }}
                                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-base sm:text-lg text-[#364152] hover:bg-[#FCE8F3] hover:text-[#EC008C] transition-all duration-150 group"
                                >
                                  {sub.image ? (
                                    <img src={sub.image} alt={subName(sub)} className="w-9 h-9 rounded-lg object-contain flex-shrink-0 bg-[#F4F7FB] p-0.5" />
                                  ) : (
                                    <span className="w-9 h-9 rounded-lg bg-[#F4F7FB] flex items-center justify-center flex-shrink-0 group-hover:bg-[#EC008C]/10 group-hover:text-[#EC008C] transition-colors">
                                      <Package size={14} className="text-[#00215B] group-hover:text-[#EC008C] transition-colors" />
                                    </span>
                                  )}
                                  <span className="truncate font-semibold">{subName(sub)}</span>
                                </Link>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                              <Link
                                href={`/shop?category=${hoveredCatSlug}`}
                                onClick={() => { setMegaMenuOpen(false); setHoveredCatSlug(null); }}
                                className="flex items-center justify-center gap-1.5 w-full py-2.5 text-[12px] font-semibold text-[#EC008C] hover:bg-[#FCE8F3] rounded-lg transition"
                              >
                                View All {catName(hovered)} →
                              </Link>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Nav Links - Offer Types */}
              {NAV_OFFER_LINKS.map((link) => {
                const offerType = link.href.split("offer=")[1];
                const isActive = activeOffer && activeOffer === offerType;
                return (
                  <Link key={link.href} href={link.href} className={`px-3 py-2.5 text-base sm:text-lg font-semibold transition ${isActive ? "text-[#EC008C] bg-[#FCE8F3]" : "text-[#364152] hover:text-[#EC008C] hover:bg-[#FCE8F3]"}`}>
                    {language === "bn" ? link.labelBn : link.label}
                  </Link>
                );
              })}
              <Link href="/shop" className={`px-3 py-2.5 text-base sm:text-lg font-semibold transition ${pathname === "/shop" && !activeOffer ? "text-[#EC008C] bg-[#FCE8F3]" : "text-[#364152] hover:text-[#EC008C] hover:bg-[#FCE8F3]"}`}>Shop</Link>
              <Link href="/about" className="px-3 py-2.5 text-base sm:text-lg text-[#364152] hover:text-[#EC008C] hover:bg-[#FCE8F3] transition font-semibold">About</Link>
              <Link href="/product-request" className="px-3 py-2.5 text-base sm:text-lg text-[#364152] hover:text-[#EC008C] hover:bg-[#FCE8F3] transition font-semibold flex items-center gap-1.5">
                <ClipboardList size={18} />{t.customRequest}
              </Link>
            </div>
          </div>
        </nav>

        {locationOpen && <LocationSelector onClose={() => setLocationOpen(false)} />}
      </header>

      {/* ====== MOBILE ONLY (entire block hidden on lg+) ====== */}
      <div className="fixed inset-0 pointer-events-none lg:hidden" style={{ zIndex: 60 }}>
        {/* Drawer overlay */}
        <div
          className={`fixed inset-0 transition-opacity duration-200 pointer-events-auto ${drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={`fixed top-0 left-0 h-full w-[280px] bg-white shadow-2xl transition-transform duration-250 ease-in-out pointer-events-auto ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
            <Link href="/" onClick={() => setDrawerOpen(false)} className="flex items-center">
              <img src="/icon.png" alt="Bikroy-Mart-BD" className="h-16 w-auto" />
            </Link>
            <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-full hover:bg-[#F3F4F6] transition text-[#364152]" aria-label="Close menu">
              <X size={22} />
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100%-64px)] pb-24 overscroll-contain">
            <div className="p-3 border-b border-[#E5E7EB]">
              <Link href={authChecked ? (user ? "/account" : "/signin") : "#"} onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${user ? "bg-[#FCE8F3]" : "bg-[#F4F7FB]"}`}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User size={20} className={user ? "text-[#EC008C]" : "text-[#667085]"} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#000000]">{authChecked ? (user ? user.name : t.signIn) : "..."}</p>
                  <p className="text-[10px] text-[#667085]">{authChecked ? (user ? user.email : t.myAccount) : "..."}</p>
                </div>
              </Link>
              {authChecked && !user && (
                <Link href="/signup" onClick={() => setDrawerOpen(false)} className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-xs font-semibold border border-[#E5E7EB] text-[#364152] hover:bg-[#F4F7FB] transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                  {t.signUp}
                </Link>
              )}
            </div>

            <div className="p-3 border-b border-[#E5E7EB]">
              <Link href="/track-order" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5 py-2 text-xs text-[#364152] font-medium hover:text-[#EC008C] transition">
                <MapPin size={16} className="text-[#EC008C]" />{t.trackOrder}
              </Link>
              <Link href="/product-request" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5 py-2 text-xs text-[#364152] font-medium hover:text-[#EC008C] transition">
                <ClipboardList size={16} className="text-[#EC008C]" />{t.customRequest}
              </Link>
              <Link href="/about" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5 py-2 text-xs text-[#364152] font-medium hover:text-[#EC008C] transition">
                <Building2 size={16} className="text-[#EC008C]" />{language === "bn" ? "আমাদের সম্পর্কে" : "About Us"}
              </Link>
              {authChecked && user && user.role && user.role !== "CUSTOMER" && (user.role === "ADMIN" || user.role === "MANAGER" || user.role === "RIDER") && (
                <Link href={getDashboardHref()} onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5 py-2 text-xs text-[#364152] font-medium hover:text-[#EC008C] transition">
                  <LayoutDashboard size={16} className="text-[#EC008C]" />
                  {user.role === "ADMIN" ? "Admin Dashboard" : user.role === "MANAGER" ? "Manager Panel" : "Rider Dashboard"}
                </Link>
              )}
            </div>

            <div className="p-3">
              <p className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-2 px-2">{language === "bn" ? "অফার" : "OFFERS"}</p>
              <div className="space-y-0.5">
                {NAV_OFFER_LINKS.map((link) => {
                  const Icon = link.icon;
                  const offerType = link.href.split("offer=")[1];
                  const isActive = activeOffer && activeOffer === offerType;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 px-2 py-3 rounded-lg transition ${isActive ? "bg-[#FCE8F3]" : "hover:bg-[#F4F7FB]"}`}
                    >
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? "bg-[#EC008C] text-white" : "bg-[#FCE8F3] text-[#EC008C]"}`}>
                        <Icon size={18} />
                      </span>
                      <span className={`text-base sm:text-lg font-semibold ${isActive ? "text-[#EC008C]" : "text-[#364152]"}`}>{language === "bn" ? link.labelBn : link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="p-3 border-t border-[#E5E7EB]">
              <p className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-2 px-2">{t.allCategories}</p>
              <div className="space-y-0.5">
                {categories.map((cat) => {
                  const isExpanded = expandedCats[cat.slug];
                  const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                  return (
                    <div key={cat.slug}>
                      <div className="flex items-center">
                        <Link
                          href={`/shop?category=${cat.slug}`}
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center gap-3 px-2 py-3 hover:bg-[#F4F7FB] rounded-lg transition flex-1"
                        >
                          <span className="w-10 h-10 rounded-xl bg-[#F4F7FB] flex items-center justify-center text-[#00215B] flex-shrink-0">
                            <CategoryIcon icon={cat.icon} size={20} />
                          </span>
                          <span className="text-base sm:text-lg font-semibold text-[#364152] flex-1">{catName(cat)}</span>
                          {hasSubs && (
                            <span className="text-[9px] bg-[#F4F7FB] text-[#667085] px-1.5 py-0.5 rounded-full">{cat.subcategories.length}</span>
                          )}
                        </Link>
                        {hasSubs && (
                          <button
                            onClick={() => setExpandedCats((prev) => ({ ...prev, [cat.slug]: !prev[cat.slug] }))}
                            className="p-2 text-gray-400 hover:text-[#EC008C] transition"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>
                      {hasSubs && isExpanded && (
                        <div className="pl-10 pr-2 pb-1 space-y-0.5">
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                              onClick={() => setDrawerOpen(false)}
                              className="flex items-center gap-2 px-2 py-2 text-xs sm:text-sm text-[#667085] hover:text-[#EC008C] hover:bg-[#FCE8F3] rounded-lg transition"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E5E7EB] flex-shrink-0"></span>
                              {subName(sub)}
                            </Link>
                          ))}
                          <Link
                            href={`/shop?category=${cat.slug}`}
                            onClick={() => setDrawerOpen(false)}
                            className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold text-[#EC008C] hover:underline"
                          >
                            View All →
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-[0_-2px_12px_rgba(0,0,0,0.1)] pb-[max(6px,env(safe-area-inset-bottom))] pointer-events-auto" style={{ zIndex: 70 }}>
          <div className="flex items-center justify-around py-1.5">
            <Link href="/" className={`flex flex-col items-center gap-0.5 flex-1 min-w-0 ${pathname === "/" ? "text-[#EC008C]" : "text-[#667085]"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition ${pathname === "/" ? "bg-[#FCE8F3]" : "bg-[#F4F7FB]"}`}>
                <img src="/icon.png" alt="Home" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-[9px] font-semibold truncate">{t.home}</span>
            </Link>
            <button onClick={() => setDrawerOpen(true)} className="flex flex-col items-center gap-0.5 flex-1 min-w-0 text-[#667085]">
              <div className="w-8 h-8 rounded-full bg-[#F4F7FB] flex items-center justify-center transition">
                <Menu size={18} />
              </div>
              <span className="text-[9px] font-semibold truncate">{t.categories}</span>
            </button>
            <Link href="/product-request" className={`flex flex-col items-center gap-0.5 flex-1 min-w-0 ${pathname === "/product-request" ? "text-[#EC008C]" : "text-[#667085]"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition ${pathname === "/product-request" ? "bg-[#FCE8F3]" : "bg-[#F4F7FB]"}`}>
                <ClipboardList size={18} />
              </div>
              <span className="text-[9px] font-semibold truncate">{t.customRequest}</span>
            </Link>
            <Link href="/cart" className={`relative flex flex-col items-center gap-0.5 flex-1 min-w-0 ${pathname === "/cart" ? "text-[#EC008C]" : "text-[#667085]"}`}>
              <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition ${pathname === "/cart" ? "bg-[#FCE8F3]" : "bg-[#F4F7FB]"}`}>
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#EC008C] text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-semibold truncate">{t.cart}</span>
            </Link>
            <Link href={authChecked ? (user ? "/account" : "/signin") : "#"} className={`flex flex-col items-center gap-0.5 flex-1 min-w-0 ${pathname === "/account" || pathname === "/signin" ? "text-[#EC008C]" : "text-[#667085]"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden transition ${pathname === "/account" || pathname === "/signin" ? "bg-[#FCE8F3]" : "bg-[#F4F7FB]"}`}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <span className="text-[9px] font-semibold truncate">{authChecked ? (user ? t.myAccount : t.signIn) : "..."}</span>
            </Link>
            {authChecked && user && user.role && user.role !== "CUSTOMER" && (user.role === "ADMIN" || user.role === "MANAGER" || user.role === "RIDER") && (
              <Link href={getDashboardHref()} className={`flex flex-col items-center gap-0.5 flex-1 min-w-0 ${pathname.startsWith(getDashboardHref()) ? "text-[#EC008C]" : "text-[#667085]"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition ${pathname.startsWith(getDashboardHref()) ? "bg-[#FCE8F3]" : "bg-[#F4F7FB]"}`}>
                  <LayoutDashboard size={18} />
                </div>
                <span className="text-[9px] font-semibold">{user.role === "ADMIN" ? "Admin" : user.role === "MANAGER" ? "Manager" : "Rider"}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderContent />
    </Suspense>
  );
}
