"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      const data = res.data.data || [];
      if (data.length > 0) {
        setCategories(data.map((cat) => ({
          name: cat.nameBn || cat.name,
          slug: cat.slug,
          icon: cat.icon || "📦",
          image: cat.image,
          count: cat._count?.products || 0,
        })));
      } else {
        setCategories([
          { name: t.food, slug: "food", icon: "🍞" },
          { name: t.fruitsVegetables, slug: "fruits-vegetables", icon: "🥬" },
          { name: t.meatFish, slug: "meat-fish", icon: "🥩" },
          { name: t.dairyEggs, slug: "dairy-eggs", icon: "🥛" },
          { name: t.drinks, slug: "drinks-beverages", icon: "☕" },
          { name: t.snacks, slug: "snacks-frozen", icon: "🍪" },
          { name: t.cooking, slug: "cooking-essentials", icon: "🍳" },
          { name: t.beauty, slug: "beauty-health", icon: "✨" },
        ]);
      }
    } catch (err) {
      console.error(err);
      setCategories([
        { name: t.food, slug: "food", icon: "🍞" },
        { name: t.fruitsVegetables, slug: "fruits-vegetables", icon: "🥬" },
        { name: t.meatFish, slug: "meat-fish", icon: "🥩" },
        { name: t.dairyEggs, slug: "dairy-eggs", icon: "🥛" },
        { name: t.drinks, slug: "drinks-beverages", icon: "☕" },
        { name: t.snacks, slug: "snacks-frozen", icon: "🍪" },
        { name: t.cooking, slug: "cooking-essentials", icon: "🍳" },
        { name: t.beauty, slug: "beauty-health", icon: "✨" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="max-w-[1200px] mx-auto mt-2 md:mt-4">
        <div className="h-5 w-32 bg-[#E5E7EB] rounded animate-pulse mb-2 md:mb-3"></div>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-4 px-1 sm:px-0">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-[#E5E7EB] rounded-lg h-32 sm:h-36 md:h-40 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1200px] mx-auto mt-2 md:mt-4">
      <h2 className="pl-2 text-base sm:text-lg md:text-xl font-semibold text-[#181717] mb-2 md:mb-3">
        {t.shop} {t.home === "হোম" ? "শাকসবজি" : "by Category"}
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-4 px-1 sm:px-0">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop?category=${cat.slug}`}
            className="flex flex-col items-center bg-white border border-[#E5E7EB] rounded-lg p-4 md:p-5 hover:shadow-[rgba(0,0,0,0.1)_0px_4px_12px_0px] hover:scale-[1.02] transition-all duration-200"
          >
            {cat.image ? (
              <img src={cat.image} alt={cat.name} className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain mb-2 md:mb-3" />
            ) : (
              <span className="text-4xl sm:text-5xl md:text-6xl mb-2 md:mb-3">{cat.icon}</span>
            )}
            <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-[#364152] text-center px-1 line-clamp-2 leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
