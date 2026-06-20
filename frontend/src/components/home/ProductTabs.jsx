"use client";
import { useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState("trending");
  const { t } = useLanguage();

  const tabs = [
    { label: t.flashDeals, value: "trending" },
    { label: t.viewAllDeals, value: "deals" },
    { label: t.newest, value: "new" },
  ];

  const sampleProducts = [
    { id: "1", name: "Brooke Bond Taaza Tea 400gm", price: 250, images: ["🍵"], deliveryTime: "1-2 hours" },
    { id: "2", name: "ACI Pure Salt 1kg", price: 42, images: ["🧂"], deliveryTime: "1-2 hours" },
    { id: "3", name: "Pran Muri 250gm", price: 40, images: ["🍘"], deliveryTime: "1-2 hours" },
    { id: "4", name: "Wheel Laundry Soap 125gm", price: 30, dealPrice: 29, images: ["🧼"], deliveryTime: "1-2 hours", badge: "OFF" },
    { id: "5", name: "Vim Dish Wash Bar 300gm", price: 40, images: ["🫧"], deliveryTime: "1-2 hours" },
    { id: "6", name: "Dano Daily Pusti Milk 500gm", price: 400, dealPrice: 380, images: ["🥛"], deliveryTime: "1-2 hours", badge: "5% OFF" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-4 mb-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`pb-4 px-2 text-base font-semibold border-b-3 transition ${
              activeTab === tab.value
                ? "border-[#0067A0] text-[#0067A0]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {sampleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
