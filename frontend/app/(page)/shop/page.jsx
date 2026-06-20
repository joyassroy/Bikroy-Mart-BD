"use client";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import api from "@/lib/axios";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const { t } = useLanguage();

  const categories = [
    { name: t.allCategoriesShop, slug: "" },
    { name: t.food, slug: "food" },
    { name: t.fruitsVegetables, slug: "fruits-vegetables" },
    { name: t.meatFish, slug: "meat-fish" },
    { name: t.dairyEggs, slug: "dairy-eggs" },
    { name: t.drinks, slug: "drinks-beverages" },
    { name: t.snacks, slug: "snacks-frozen" },
  ];

  useEffect(() => { fetchProducts(); }, [selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (sortBy) params.set("sort", sortBy);
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{t.shopTitle}</h1>
        <div className="flex flex-col lg:flex-row gap-4">
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t.categories}</h3>
              <div className="space-y-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition font-medium ${
                      selectedCategory === cat.slug
                        ? "bg-blue-50 text-[#0067A0]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t.sortBy}</h3>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field">
                  <option value="newest">{t.newest}</option>
                  <option value="price-low">{t.priceLowHigh}</option>
                  <option value="price-high">{t.priceHighLow}</option>
                  <option value="popular">{t.featured}</option>
                </select>
              </div>
            </div>
          </aside>
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-56 animate-pulse"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg">{t.noProductsFound}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
