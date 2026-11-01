"use client";
import { useState, useEffect, useRef, useCallback, useMemo, Suspense, memo } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import ProductGroupRow from "@/components/product/ProductGroupRow";
import api from "@/lib/axios";
import { useLanguage } from "@/i18n/LanguageContext";
import { SlidersHorizontal, X, ChevronDown, Grid3X3, List, Search, Plus } from "lucide-react";
import useDistrict from "@/helper/useDistrict";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import FloatingChatButton from "@/components/layout/FloatingChatButton";
import FloatingCartButton from "@/components/home/FloatingCartButton";
import { setQuery as setSearchQueryRedux } from "@/redux/searchSlice";

const OFFER_TITLES = {
  FLASH_DEAL: "Flash Deals",
  STOCK_CLEARANCE: "Stock Clearance Sale",
  EXECUTIVE: "Executive Offer",
  COMBO: "Combo Offer",
  BOGO: "Buy One Get One Free",
  CUSTOM: "Custom Offer",
};

const FilterSidebar = memo(function FilterSidebar({ categories, selectedCategory, selectedSubcategory, minPrice, maxPrice, onCategorySelect, onSubcategorySelect, onMinPriceChange, onMaxPriceChange, onPriceFilter, t, language }) {
  const selectedCat = categories.find((c) => c.slug === selectedCategory);
  const subcats = selectedCat?.subcategories || [];
  const catName = (cat) => cat ? (language === "bn" ? (cat.nameBn || cat.name) : cat.name) : "";
  const subName = (sub) => sub ? (language === "bn" ? (sub.nameBn || sub.name) : sub.name) : "";

  return (
    <div>
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px]">
        <h3 className="font-bold text-[#000000] mb-2 text-base sm:text-lg">{t.categories}</h3>
        <div className="space-y-1">
          <button
            onClick={() => onCategorySelect("")}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-base sm:text-lg transition font-semibold ${
              selectedCategory === "" ? "bg-[#FCE8F3] text-[#EC008C]" : "text-[#667085] hover:bg-[#F4F7FB]"
            }`}
          >
            {t.allProducts}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => onCategorySelect(cat.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-base sm:text-lg transition font-semibold flex items-center justify-between ${
                selectedCategory === cat.slug ? "bg-[#FCE8F3] text-[#EC008C]" : "text-[#667085] hover:bg-[#F4F7FB]"
              }`}
            >
              <span className="truncate">{catName(cat)}</span>
              {cat._count?.products > 0 && (
                <span className="text-[10px] sm:text-[11px] bg-[#F4F7FB] px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
                  {cat._count.products}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {subcats.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] mt-3">
          <h3 className="font-bold text-[#000000] mb-2 text-base sm:text-lg">Subcategories</h3>
          <div className="space-y-1">
            <button
              onClick={() => onSubcategorySelect("")}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-base sm:text-lg transition font-semibold ${
                selectedSubcategory === "" ? "bg-[#FCE8F3] text-[#EC008C]" : "text-[#667085] hover:bg-[#F4F7FB]"
              }`}
            >
              All {catName(selectedCat) || "Subcategories"}
            </button>
            {subcats.map((sub) => (
              <button
                key={sub.slug}
                onClick={() => onSubcategorySelect(sub.slug)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-base sm:text-lg transition font-semibold ${
                  selectedSubcategory === sub.slug ? "bg-[#FCE8F3] text-[#EC008C]" : "text-[#667085] hover:bg-[#F4F7FB]"
                }`}
              >
                {subName(sub)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] mt-3">
        <h3 className="font-semibold text-[#000000] mb-2 text-base sm:text-lg">{t.priceRange}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t.minPrice}
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full border border-[#E5E7EB] rounded-md px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:border-[#EC008C]"
          />
          <span className="text-[#667085] text-xs sm:text-sm">-</span>
          <input
            type="number"
            placeholder={t.maxPrice}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full border border-[#E5E7EB] rounded-md px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:border-[#EC008C]"
          />
        </div>
        <button
          onClick={onPriceFilter}
          className="w-full mt-2 bg-[#EC008C] text-white text-xs sm:text-sm font-semibold py-1.5 rounded-md hover:bg-[#D60071] transition"
        >
          {t.applyFilter}
        </button>
      </div>
    </div>
  );
});

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const district = useDistrict();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);
  const searchQueryRedux = useSelector((state) => state.search.query);
  const isAdminOrManager = user && (user.role === "ADMIN" || user.role === "MANAGER");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("subcategory") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "");
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [offerType, setOfferType] = useState(searchParams.get("offer") || "");
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [loadingGrouped, setLoadingGrouped] = useState(false);
  const [shopBanners, setShopBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const { t, language } = useLanguage();
  const fetchIdRef = useRef(0);
  const groupedFetchIdRef = useRef(0);
  const searchDebounceRef = useRef(null);

  const urlCategory = searchParams.get("category") || "";
  const urlSubcategory = searchParams.get("subcategory") || "";
  const urlOffer = searchParams.get("offer") || "";
  const urlSearch = searchParams.get("search") || "";

  const catName = (cat) => cat ? (language === "bn" ? (cat.nameBn || cat.name) : cat.name) : "";
  const subName = (sub) => sub ? (language === "bn" ? (sub.nameBn || sub.name) : sub.name) : "";

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setSelectedCategory(urlCategory);
    setSelectedSubcategory(urlSubcategory);
    setOfferType(urlOffer);
    if (urlSearch) {
      setLocalSearch(urlSearch);
      dispatch(setSearchQueryRedux(urlSearch));
    } else {
      setLocalSearch("");
      dispatch(setSearchQueryRedux(""));
    }
  }, [urlCategory, urlSubcategory, urlOffer, urlSearch, dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      const cat = categories.find(c => c.slug === selectedCategory);
      if (cat) fetchShopBanners({ categoryId: cat.id });
      else setShopBanners([]);
    } else if (offerType) {
      const positionMap = {
        FLASH_DEAL: "offer_flash_deal",
        COMBO: "offer_combo",
        EXECUTIVE: "offer_executive",
        STOCK_CLEARANCE: "offer_stock_clearance",
        BOGO: "offer_bogo",
        CUSTOM: "offer_custom",
      };
      const position = positionMap[offerType];
      if (position) fetchShopBanners({ position });
      else setShopBanners([]);
    } else {
      setShopBanners([]);
    }
    setCurrentBanner(0);
  }, [selectedCategory, offerType, categories]);

  useEffect(() => {
    if (shopBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % shopBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [shopBanners.length]);

  const activeSearch = localSearch || searchQueryRedux;

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts();
    }, 300);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [activeSearch]);

  useEffect(() => {
    fetchProducts();
    if (!selectedSubcategory && !minPrice && !maxPrice && !activeSearch && !offerType) {
      fetchGroupedProducts();
    } else {
      setGroupedProducts([]);
    }
  }, [selectedCategory, selectedSubcategory, sortBy, minPrice, maxPrice, currentPage, offerType, district, activeSearch]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchShopBanners = async ({ categoryId, position }) => {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.set("categoryId", categoryId);
      if (position) params.set("position", position);
      const res = await api.get(`/banners?${params.toString()}`);
      setShopBanners(res.data.data || []);
    } catch (err) {
      console.error(err);
      setShopBanners([]);
    }
  };

  const fetchProducts = async () => {
    const currentFetchId = ++fetchIdRef.current;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedSubcategory) params.set("subcategory", selectedSubcategory);
      if (sortBy) params.set("sort", sortBy);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (activeSearch) params.set("search", activeSearch);
      if (offerType) params.set("offer", offerType);
      if (district) params.set("district", district);
      params.set("page", currentPage.toString());
      params.set("limit", "20");

      const res = await api.get(`/products?${params.toString()}`);
      if (currentFetchId !== fetchIdRef.current) return;
      setProducts(res.data.data || []);
      setTotalProducts(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      if (currentFetchId !== fetchIdRef.current) return;
      console.error(err);
      setProducts([]);
    } finally {
      if (currentFetchId === fetchIdRef.current) setLoading(false);
    }
  };

  const fetchGroupedProducts = async () => {
    const currentId = ++groupedFetchIdRef.current;
    try {
      setLoadingGrouped(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (district) params.set("district", district);
      params.set("limit", "12");
      const res = await api.get(`/products/grouped?${params.toString()}`);
      if (currentId !== groupedFetchIdRef.current) return;
      setGroupedProducts(res.data.data || []);
    } catch (err) {
      if (currentId !== groupedFetchIdRef.current) return;
      console.error(err);
      setGroupedProducts([]);
    } finally {
      if (currentId === groupedFetchIdRef.current) setLoadingGrouped(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategorySelect = useCallback((slug) => {
    setSelectedCategory(slug);
    setSelectedSubcategory("");
    setCurrentPage(1);
  }, []);

  const handleSubcategorySelect = useCallback((slug) => {
    setSelectedSubcategory(slug);
    setCurrentPage(1);
  }, []);

  const handlePriceFilter = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setMinPrice("");
    setMaxPrice("");
    setLocalSearch("");
    dispatch(setSearchQueryRedux(""));
    setSortBy("newest");
    setOfferType("");
    setCurrentPage(1);
    router.push("/shop");
  };

  const handleDeleteProduct = useCallback(async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setTotalProducts((prev) => prev - 1);
      toast.success("Product deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  }, []);

  const sidebarProps = useMemo(() => ({
    categories,
    selectedCategory,
    selectedSubcategory,
    minPrice,
    maxPrice,
    onCategorySelect: handleCategorySelect,
    onSubcategorySelect: handleSubcategorySelect,
    onMinPriceChange: setMinPrice,
    onMaxPriceChange: setMaxPrice,
    onPriceFilter: handlePriceFilter,
    t,
    language,
  }), [categories, selectedCategory, selectedSubcategory, minPrice, maxPrice, handleCategorySelect, handleSubcategorySelect, t, language]);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#00215B]">
              {offerType ? (OFFER_TITLES[offerType] || "Shop") : t.shopTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
              {totalProducts} {t.resultsFound}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 lg:hidden">
          <form onSubmit={handleSearch} className="flex-1 flex">
            <input
              type="text"
              placeholder={t.productSearchPlaceholder}
              value={localSearch}
              onChange={(e) => { setLocalSearch(e.target.value); dispatch(setSearchQueryRedux(e.target.value)); }}
              className="flex-1 rounded-l-md px-3 py-2 text-xs sm:text-sm bg-white text-[#000000] placeholder:text-[#99A0B4] border border-[#E5E7EB] border-r-0 focus:outline-none focus:border-transparent"
            />
            <button type="submit" className="bg-[#EC008C] text-white px-3 rounded-r-md hover:bg-[#D60071] transition flex items-center">
              <Search size={14} />
            </button>
          </form>
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-xs sm:text-sm font-medium text-[#364152] hover:bg-[#F4F7FB] transition"
          >
            <SlidersHorizontal size={14} />
            {t.filters}
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 mb-3">
          <form onSubmit={handleSearch} className="flex-1 flex max-w-md">
            <input
              type="text"
              placeholder={t.productSearchPlaceholder}
              value={localSearch}
              onChange={(e) => { setLocalSearch(e.target.value); dispatch(setSearchQueryRedux(e.target.value)); }}
              className="flex-1 rounded-l-md px-4 py-2 text-sm sm:text-base bg-white text-[#000000] placeholder:text-[#99A0B4] border border-[#E5E7EB] border-r-0 focus:outline-none focus:border-transparent"
            />
            <button type="submit" className="bg-[#EC008C] text-white px-4 rounded-r-md hover:bg-[#D60071] transition flex items-center">
              <Search size={16} />
            </button>
          </form>
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="border border-[#E5E7EB] rounded-md px-3 py-2 text-xs sm:text-sm bg-white text-[#364152] focus:outline-none focus:border-[#EC008C]"
            >
              <option value="newest">{t.newest}</option>
              <option value="price-low">{t.priceLowHigh}</option>
              <option value="price-high">{t.priceHighLow}</option>
              <option value="popular">{t.featured}</option>
            </select>
            <div className="flex border border-[#E5E7EB] rounded-md overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-2 transition ${viewMode === "grid" ? "bg-[#EC008C] text-white" : "bg-white text-[#667085] hover:bg-[#F4F7FB]"}`}>
                <Grid3X3 size={14} />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2 transition ${viewMode === "list" ? "bg-[#EC008C] text-white" : "bg-white text-[#667085] hover:bg-[#F4F7FB]"}`}>
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <FilterSidebar {...sidebarProps} />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 lg:hidden">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="flex-1 border border-[#E5E7EB] rounded-md px-3 py-2 text-xs sm:text-sm bg-white text-[#364152] focus:outline-none focus:border-[#EC008C]"
              >
                <option value="newest">{t.newest}</option>
                <option value="price-low">{t.priceLowHigh}</option>
                <option value="price-high">{t.priceHighLow}</option>
                <option value="popular">{t.featured}</option>
              </select>
              <div className="flex border border-[#E5E7EB] rounded-md overflow-hidden">
                <button onClick={() => setViewMode("grid")} className={`p-2 transition ${viewMode === "grid" ? "bg-[#EC008C] text-white" : "bg-white text-[#667085]"}`}>
                  <Grid3X3 size={14} />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 transition ${viewMode === "list" ? "bg-[#EC008C] text-white" : "bg-white text-[#667085]"}`}>
                  <List size={14} />
                </button>
              </div>
            </div>

            {(selectedCategory || selectedSubcategory || minPrice || maxPrice || activeSearch || offerType) && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs text-[#667085] font-medium">{t.filters}:</span>
                {offerType && (
                  <span className="inline-flex items-center gap-1 bg-[#E8EDF5] text-[#00215B] text-xs font-medium px-2 py-1 rounded-full">
                    {OFFER_TITLES[offerType] || offerType}
                    <button onClick={() => { setOfferType(""); setCurrentPage(1); }} className="hover:text-[#001A4A]"><X size={10} /></button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 bg-[#FCE8F3] text-[#EC008C] text-xs font-medium px-2 py-1 rounded-full">
                    {catName(categories.find(c => c.slug === selectedCategory)) || selectedCategory}
                    <button onClick={() => { setSelectedCategory(""); setSelectedSubcategory(""); setCurrentPage(1); }} className="hover:text-[#D60071]"><X size={10} /></button>
                  </span>
                )}
                {selectedSubcategory && (
                  <span className="inline-flex items-center gap-1 bg-[#E8F4F8] text-[#00AFCC] text-xs font-medium px-2 py-1 rounded-full">
                    {selectedSubcategory}
                    <button onClick={() => { setSelectedSubcategory(""); setCurrentPage(1); }} className="hover:text-[#009AB5]"><X size={10} /></button>
                  </span>
                )}
                {minPrice && (
                  <span className="inline-flex items-center gap-1 bg-[#E8F4F8] text-[#00AFCC] text-xs font-medium px-2 py-1 rounded-full">
                    Min: ৳{minPrice}
                    <button onClick={() => setMinPrice("")} className="hover:text-[#009AB5]"><X size={10} /></button>
                  </span>
                )}
                {maxPrice && (
                  <span className="inline-flex items-center gap-1 bg-[#E8F4F8] text-[#00AFCC] text-xs font-medium px-2 py-1 rounded-full">
                    Max: ৳{maxPrice}
                    <button onClick={() => setMaxPrice("")} className="hover:text-[#009AB5]"><X size={10} /></button>
                  </span>
                )}
                {activeSearch && (
                  <span className="inline-flex items-center gap-1 bg-[#E8EDF5] text-[#00215B] text-xs font-medium px-2 py-1 rounded-full">
                    &quot;{activeSearch}&quot;
                    <button onClick={() => { setLocalSearch(""); dispatch(setSearchQueryRedux("")); }} className="hover:text-[#001A4A]"><X size={10} /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-xs text-[#EC008C] font-semibold hover:underline">{t.clearAll}</button>
              </div>
            )}

            {shopBanners.length > 0 && (
              <div className="mb-4 rounded-xl overflow-hidden relative" style={{ aspectRatio: "3/1" }}>
                {shopBanners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                  >
                    {banner.image ? (
                      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-r ${banner.bgColor || "from-[#00215B] to-[#001A4A]"}`}>
                        <div className="flex items-center justify-center h-full text-white text-center px-5">
                          <div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">{banner.title}</h2>
                            {banner.subtitle && (
                              <p className="text-xs sm:text-sm opacity-90">{banner.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {shopBanners.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {shopBanners.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentBanner(index)}
                        className={`h-1.5 rounded-full transition-all ${index === currentBanner ? "bg-white w-3.5" : "bg-white/50 w-1.5"}`}
                        aria-label={`Banner ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {loading || loadingGrouped ? (
              <div className={`grid gap-2.5 sm:gap-3 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-[#E5E7EB] rounded-lg h-40 sm:h-48 animate-pulse"></div>
                ))}
              </div>
            ) : !selectedSubcategory && groupedProducts.length > 0 && !minPrice && !maxPrice && !activeSearch && !offerType ? (
              <div>
                {groupedProducts.map((group) => (
                  <div key={group.category.id} className="mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-[#00215B] mb-3 flex items-center gap-2">
                      {group.category.icon && <span className="text-xl">{group.category.icon}</span>}
                      {catName(group.category)}
                    </h2>
                    {group.subcategories.map((subGroup) => (
                      <ProductGroupRow
                        key={subGroup.subcategory.id}
                        categorySlug={group.category.slug}
                        subcategory={subGroup.subcategory}
                        products={subGroup.products}
                        showActions={isAdminOrManager}
                        onDelete={handleDeleteProduct}
                        onProductUpdated={fetchProducts}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-lg border border-[#E5E7EB]">
                <p className="text-base sm:text-lg text-[#667085] mb-1">{t.noProductsFound}</p>
                <p className="text-xs sm:text-sm text-[#99A0B4]">{t.noProductsDesc}</p>
                <button onClick={clearFilters} className="mt-3 text-xs sm:text-sm text-[#EC008C] font-semibold hover:underline">{t.clearFilters}</button>
              </div>
            ) : (
              <>
                <div className={`grid gap-2.5 sm:gap-3 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showActions={isAdminOrManager}
                      onDelete={handleDeleteProduct}
                      onProductUpdated={fetchProducts}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-[11px] font-medium border border-[#E5E7EB] rounded-md bg-white text-[#364152] hover:bg-[#F4F7FB] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      {t.previous}
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) page = i + 1;
                      else if (currentPage <= 3) page = i + 1;
                      else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                      else page = currentPage - 2 + i;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 text-[11px] font-medium rounded-md transition ${
                            currentPage === page ? "bg-[#EC008C] text-white" : "border border-[#E5E7EB] bg-white text-[#364152] hover:bg-[#F4F7FB]"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-[11px] font-medium border border-[#E5E7EB] rounded-md bg-white text-[#364152] hover:bg-[#F4F7FB] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      {t.next}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={() => setFilterDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
              <h2 className="text-base sm:text-lg font-semibold text-[#000000]">{t.filterDrawerTitle}</h2>
              <button onClick={() => setFilterDrawerOpen(false)} className="p-1.5 rounded-md hover:bg-[#F3F4F6] transition text-[#364152]">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar {...sidebarProps} />
            </div>
            <div className="sticky bottom-0 p-4 bg-white border-t border-[#E5E7EB]">
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full bg-[#EC008C] text-white text-xs sm:text-sm font-semibold py-2.5 rounded-md hover:bg-[#D60071] transition"
              >
                {t.applyFilter} ({totalProducts} {t.products})
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdminOrManager && (
        <button
          onClick={() => router.push("/dashboard/products/add")}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#EC008C] text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-[0_4px_12px_rgba(236,0,140,0.4)] flex items-center justify-center hover:bg-[#D60071] hover:scale-110 transition-all"
          aria-label="Add Product"
        >
          <Plus size={22} />
        </button>
      )}

      <FloatingCartButton />
      <FloatingChatButton />
      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
