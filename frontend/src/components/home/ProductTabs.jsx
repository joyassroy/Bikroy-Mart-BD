"use client";
import { useState, useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";
import useDistrict from "@/helper/useDistrict";

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState("featured");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const district = useDistrict();

  const tabs = [
    { label: t.featured, value: "featured" },
    { label: t.newest, value: "newest" },
    { label: t.priceLowHigh, value: "price-low" },
    { label: t.priceHighLow, value: "price-high" },
  ];

  useEffect(() => {
    fetchProducts();
  }, [activeTab, district]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const districtParam = district ? `&district=${encodeURIComponent(district)}` : "";
      let url = "/products?limit=12";
      if (activeTab === "featured") {
        url = `/products/featured?limit=12${districtParam}`;
      } else {
        url += `&sort=${activeTab}${districtParam}`;
      }
      const res = await api.get(url);
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
      setProducts([
        { id: "1", name: "Brooke Bond Taaza Tea 400gm", price: 250, images: ["🍵"], deliveryTime: "1-2 hours" },
        { id: "2", name: "ACI Pure Salt 1kg", price: 42, images: ["🧂"], deliveryTime: "1-2 hours" },
        { id: "3", name: "Pran Muri 250gm", price: 40, images: ["🍘"], deliveryTime: "1-2 hours" },
        { id: "4", name: "Wheel Laundry Soap 125gm", price: 30, dealPrice: 29, images: ["🧼"], deliveryTime: "1-2 hours", badge: "OFF" },
        { id: "5", name: "Vim Dish Wash Bar 300gm", price: 40, images: ["🫧"], deliveryTime: "1-2 hours" },
        { id: "6", name: "Dano Daily Pusti Milk 500gm", price: 400, dealPrice: 380, images: ["🥛"], deliveryTime: "1-2 hours", badge: "5% OFF" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[1200px] mx-auto mt-2 md:mt-4 pb-20 lg:pb-10">
      <div className="flex items-center gap-3 sm:gap-4 mb-2 md:mb-3 border-b border-[#E5E7EB] overflow-x-auto px-2 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`pb-2 sm:pb-2.5 px-1 text-[11px] sm:text-xs font-semibold border-b-2 transition whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.value
                ? "border-[#EC008C] text-[#EC008C]"
                : "border-transparent text-[#667085] hover:text-[#364152]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 px-2 sm:px-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#E5E7EB] rounded-lg h-40 sm:h-48 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 px-2 sm:px-0">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
