"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, PackageSearch } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";
import useDistrict from "@/helper/useDistrict";

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState("newest");
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const district = useDistrict();

  const tabs = [
    { label: t.featured, value: "featured" },
    { label: t.newest, value: "newest" },
    { label: t.priceLowHigh, value: "price-low" },
    { label: t.priceHighLow, value: "price-high" },
  ];

  const categoryName = (cat) =>
    language === "bn" ? cat.nameBn || cat.name : cat.name;

  useEffect(() => {
    api.get("/categories")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => {
        console.error(err);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [activeTab, activeCategory, district]);

  const buildParams = (useFeatured) => {
    const params = new URLSearchParams({ limit: "12" });
    if (district) params.set("district", district);
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (useFeatured) {
      params.set("featured", "true");
      params.set("sort", "newest");
    } else if (activeTab !== "featured") {
      params.set("sort", activeTab);
    }
    return params;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let res = await api.get(`/products?${buildParams(activeTab === "featured").toString()}`);
      let data = res.data.data || [];

      // A category may have no featured products — fall back to its full list.
      if (activeTab === "featured" && activeCategory !== "all" && data.length === 0) {
        res = await api.get(`/products?${buildParams(false).toString()}`);
        data = res.data.data || [];
      }

      setProducts(data);
      setTotal(res.data.pagination?.total ?? data.length);
    } catch (err) {
      console.error(err);
      setProducts([
        { id: "1", name: "Brooke Bond Taaza Tea 400gm", price: 250, images: ["🍵"] },
        { id: "2", name: "ACI Pure Salt 1kg", price: 42, images: ["🧂"] },
        { id: "3", name: "Pran Muri 250gm", price: 40, images: ["🍘"] },
        { id: "4", name: "Wheel Laundry Soap 125gm", price: 30, dealPrice: 29, images: ["🧼"], badge: "OFF" },
        { id: "5", name: "Vim Dish Wash Bar 300gm", price: 40, images: ["🫧"] },
        { id: "6", name: "Dano Daily Pusti Milk 500gm", price: 400, dealPrice: 380, images: ["🥛"], badge: "5% OFF" },
      ]);
      setTotal(6);
    } finally {
      setLoading(false);
    }
  };

  const categoryPill = (active) =>
    `px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0 border transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-[#EC008C] to-[#C40074] text-white border-transparent shadow-[0_4px_12px_rgba(236,0,140,0.35)]"
        : "bg-white text-[#364152] border-[#E5E7EB] hover:border-[#EC008C]/50 hover:text-[#EC008C] hover:shadow-sm"
    }`;

  const sortPill = (active) =>
    `px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap flex-shrink-0 border transition-all duration-200 ${
      active
        ? "bg-[#00215B] text-white border-[#00215B] shadow-sm"
        : "bg-white text-[#667085] border-[#E5E7EB] hover:border-[#00215B]/40 hover:text-[#00215B]"
    }`;

  const shopHref = activeCategory === "all" ? "/shop" : `/shop?category=${activeCategory}`;

  return (
    <section className="max-w-[1200px] mx-auto mt-3 md:mt-6 pb-20 lg:pb-10 px-2 sm:px-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#181717] flex items-center gap-2">
          <span className="w-1.5 h-5 sm:h-6 rounded-full bg-gradient-to-b from-[#EC008C] to-[#00215B]" />
          {t.browseProducts}
        </h2>
        <Link
          href={shopHref}
          className="flex items-center gap-0.5 text-xs sm:text-sm font-semibold text-[#EC008C] hover:text-[#C40074] transition-colors"
        >
          {t.viewAll}
          <ChevronRight size={15} />
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-hide py-0.5">
        <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] mr-0.5 flex-shrink-0">
          {t.categories}
        </span>
        <button
          onClick={() => setActiveCategory("all")}
          aria-pressed={activeCategory === "all"}
          className={categoryPill(activeCategory === "all")}
        >
          {t.all}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            aria-pressed={activeCategory === cat.slug}
            className={categoryPill(activeCategory === cat.slug)}
          >
            {categoryName(cat)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 mb-3 border-b border-[#E5E7EB] pb-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
          <SlidersHorizontal size={13} className="text-[#98A2B3] flex-shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#98A2B3] mr-0.5 flex-shrink-0">
            {t.sortBy}
          </span>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              aria-pressed={activeTab === tab.value}
              className={sortPill(activeTab === tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {!loading && total > 0 && (
          <span className="hidden sm:inline text-[11px] sm:text-xs font-medium text-[#667085] whitespace-nowrap flex-shrink-0">
            {total > products.length ? `${products.length}/${total}` : total} {t.products}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-2 animate-pulse">
              <div className="bg-[#E5E7EB] rounded-lg aspect-square"></div>
              <div className="h-3 bg-[#E5E7EB] rounded mt-2.5 w-3/4"></div>
              <div className="h-3 bg-[#E5E7EB] rounded mt-1.5 w-1/2"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F4F7FB] flex items-center justify-center mb-3">
            <PackageSearch size={24} className="text-[#98A2B3]" />
          </div>
          <p className="text-sm font-semibold text-[#364152]">{t.noProductsFound}</p>
          <p className="text-xs text-[#667085] mt-1">{t.noProductsDesc}</p>
          <button
            onClick={() => {
              setActiveCategory("all");
              setActiveTab("newest");
            }}
            className="mt-4 px-4 py-1.5 rounded-full bg-[#EC008C] text-white text-xs font-semibold hover:bg-[#C40074] transition-colors"
          >
            {t.all}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
