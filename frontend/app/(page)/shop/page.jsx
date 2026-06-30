"use client";
import { useState, useEffect, useRef, useCallback, Suspense, memo } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import api from "@/lib/axios";
import { useLanguage } from "@/i18n/LanguageContext";
import { SlidersHorizontal, X, ChevronDown, Grid3X3, List, Search, Plus } from "lucide-react";
import useDistrict from "@/helper/useDistrict";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import FloatingChatButton from "@/components/layout/FloatingChatButton";
import FloatingCartButton from "@/components/home/FloatingCartButton";

const OFFER_TITLES = {
  STOCK_CLEARANCE: "Stock Clearance Sale",
  EXECUTIVE: "Executive Offer",
  COMBO: "Combo Offer",
  BOGO: "Buy One Get One Free",
};

const FilterSidebar = memo(function FilterSidebar({ categories, selectedCategory, selectedSubcategory, minPrice, maxPrice, onCategorySelect, onSubcategorySelect, onMinPriceChange, onMaxPriceChange, onPriceFilter, t }) {
  const selectedCat = categories.find((c) => c.slug === selectedCategory);
  const subcats = selectedCat?.subcategories || [];

  return (
    <div>
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px]">
        <h3 className="font-semibold text-[#000000] mb-2 text-xs">{t.categories}</h3>
        <div className="space-y-1">
          <button
            onClick={() => onCategorySelect("")}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] transition font-medium ${
              selectedCategory === "" ? "bg-[#FCE8F3] text-[#EC008C]" : "text-[#667085] hover:bg-[#F4F7FB]"
            }`}
          >
            {t.allProducts}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => onCategorySelect(cat.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] transition font-medium flex items-center justify-between ${
                selectedCategory === cat.slug ? "bg-[#FCE8F3] text-[#EC008C]" : "text-[#667085] hover:bg-[#F4F7FB]"
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {cat._count?.products > 0 && (
                <span className="text-[9px] bg-[#F4F7FB] px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
                  {cat._count.products}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {subcats.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] mt-3">
          <h3 className="font-semibold text-[#000000] mb-2 text-xs">Subcategories</h3>
          <div className="space-y-1">
            <button
              onClick={() => onSubcategorySelect("")}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] transition font-medium ${
                selectedSubcategory === "" ? "bg-[#FCE8F3] text-[#EC008C]" : "text-[#667085] hover:bg-[#F4F7FB]"
              }`}
            >
              All {selectedCat?.name || "Subcategories"}
            </button>
            {subcats.map((sub) => (
              <button
                key={sub.slug}
                onClick={() => onSubcategorySelect(sub.slug)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] transition font-medium ${
                  selectedSubcategory === sub.slug ? "bg-[#FCE8F3] text-[#EC008C]" : "text-[#667085] hover:bg-[#F4F7FB]"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] mt-3">
        <h3 className="font-semibold text-[#000000] mb-2 text-xs">{t.priceRange}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t.minPrice}
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full border border-[#E5E7EB] rounded-md px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#EC008C]"
          />
          <span className="text-[#667085] text-[11px]">-</span>
          <input
            type="number"
            placeholder={t.maxPrice}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full border border-[#E5E7EB] rounded-md px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#EC008C]"
          />
        </div>
        <button
          onClick={onPriceFilter}
          className="w-full mt-2 bg-[#EC008C] text-white text-[11px] font-semibold py-1.5 rounded-md hover:bg-[#D60071] transition"
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
  const user = useSelector((state) => state.user.data);
  const isAdminOrManager = user && (user.role === "ADMIN" || user.role === "MANAGER");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [offerType, setOfferType] = useState("");
  const { t } = useLanguage();
  const fetchIdRef = useRef(0);

  const urlCategory = searchParams.get("category") || "";
  const urlSubcategory = searchParams.get("subcategory") || "";
  const urlOffer = searchParams.get("offer") || "";
  const urlSearch = searchParams.get("search") || "";

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setSelectedCategory(urlCategory);
    setSelectedSubcategory(urlSubcategory);
    setOfferType(urlOffer);
    setSearchQuery(urlSearch);
  }, [urlCategory, urlSubcategory, urlOffer, urlSearch]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSubcategory, sortBy, minPrice, maxPrice, currentPage, offerType, searchQuery, district]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
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
      if (searchQuery) params.set("search", searchQuery);
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
    setSearchQuery("");
    setSortBy("newest");
    setOfferType("");
    setCurrentPage(1);
    router.push("/shop");
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setTotalProducts((prev) => prev - 1);
      toast.success("Product deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  const sidebarProps = {
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
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B]">
              {offerType ? (OFFER_TITLES[offerType] || "Shop") : t.shopTitle}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5">
              {totalProducts} {t.resultsFound}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 lg:hidden">
          <form onSubmit={handleSearch} className="flex-1 flex">
            <input
              type="text"
              placeholder={t.productSearchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-l-md px-3 py-2 text-xs bg-white text-[#000000] placeholder:text-[#99A0B4] border border-[#E5E7EB] border-r-0 focus:outline-none focus:border-transparent"
            />
            <button type="submit" className="bg-[#EC008C] text-white px-3 rounded-r-md hover:bg-[#D60071] transition flex items-center">
              <Search size={14} />
            </button>
          </form>
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-[11px] font-medium text-[#364152] hover:bg-[#F4F7FB] transition"
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-l-md px-4 py-2 text-sm bg-white text-[#000000] placeholder:text-[#99A0B4] border border-[#E5E7EB] border-r-0 focus:outline-none focus:border-transparent"
            />
            <button type="submit" className="bg-[#EC008C] text-white px-4 rounded-r-md hover:bg-[#D60071] transition flex items-center">
              <Search size={16} />
            </button>
          </form>
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="border border-[#E5E7EB] rounded-md px-3 py-2 text-xs bg-white text-[#364152] focus:outline-none focus:border-[#EC008C]"
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
                className="flex-1 border border-[#E5E7EB] rounded-md px-3 py-2 text-xs bg-white text-[#364152] focus:outline-none focus:border-[#EC008C]"
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

            {(selectedCategory || selectedSubcategory || minPrice || maxPrice || searchQuery || offerType) && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] text-[#667085] font-medium">{t.filters}:</span>
                {offerType && (
                  <span className="inline-flex items-center gap-1 bg-[#E8EDF5] text-[#00215B] text-[10px] font-medium px-2 py-1 rounded-full">
                    {OFFER_TITLES[offerType] || offerType}
                    <button onClick={() => { setOfferType(""); setCurrentPage(1); }} className="hover:text-[#001A4A]"><X size={10} /></button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 bg-[#FCE8F3] text-[#EC008C] text-[10px] font-medium px-2 py-1 rounded-full">
                    {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                    <button onClick={() => { setSelectedCategory(""); setSelectedSubcategory(""); setCurrentPage(1); }} className="hover:text-[#D60071]"><X size={10} /></button>
                  </span>
                )}
                {selectedSubcategory && (
                  <span className="inline-flex items-center gap-1 bg-[#E8F4F8] text-[#00AFCC] text-[10px] font-medium px-2 py-1 rounded-full">
                    {selectedSubcategory}
                    <button onClick={() => { setSelectedSubcategory(""); setCurrentPage(1); }} className="hover:text-[#009AB5]"><X size={10} /></button>
                  </span>
                )}
                {minPrice && (
                  <span className="inline-flex items-center gap-1 bg-[#E8F4F8] text-[#00AFCC] text-[10px] font-medium px-2 py-1 rounded-full">
                    Min: ৳{minPrice}
                    <button onClick={() => setMinPrice("")} className="hover:text-[#009AB5]"><X size={10} /></button>
                  </span>
                )}
                {maxPrice && (
                  <span className="inline-flex items-center gap-1 bg-[#E8F4F8] text-[#00AFCC] text-[10px] font-medium px-2 py-1 rounded-full">
                    Max: ৳{maxPrice}
                    <button onClick={() => setMaxPrice("")} className="hover:text-[#009AB5]"><X size={10} /></button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-[#E8EDF5] text-[#00215B] text-[10px] font-medium px-2 py-1 rounded-full">
                    &quot;{searchQuery}&quot;
                    <button onClick={() => setSearchQuery("")} className="hover:text-[#001A4A]"><X size={10} /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-[10px] text-[#EC008C] font-semibold hover:underline">{t.clearAll}</button>
              </div>
            )}

            {loading ? (
              <div className={`grid gap-2.5 sm:gap-3 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-[#E5E7EB] rounded-lg h-40 sm:h-48 animate-pulse"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-lg border border-[#E5E7EB]">
                <p className="text-sm text-[#667085] mb-1">{t.noProductsFound}</p>
                <p className="text-[11px] text-[#99A0B4]">{t.noProductsDesc}</p>
                <button onClick={clearFilters} className="mt-3 text-[11px] text-[#EC008C] font-semibold hover:underline">{t.clearFilters}</button>
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
              <h2 className="text-sm font-semibold text-[#000000]">{t.filterDrawerTitle}</h2>
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
                className="w-full bg-[#EC008C] text-white text-xs font-semibold py-2.5 rounded-md hover:bg-[#D60071] transition"
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
