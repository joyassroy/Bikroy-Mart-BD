"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const catName = (cat) => language === "bn" ? (cat.nameBn || cat.nameEn) : cat.nameEn;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [categories]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      const data = res.data.data || [];
      if (data.length > 0) {
        setCategories(data.map((cat) => ({
          nameEn: cat.name,
          nameBn: cat.nameBn || cat.name,
          slug: cat.slug,
          icon: cat.icon || "📦",
          image: cat.image,
          count: cat._count?.products || 0,
        })));
      } else {
        setCategories(fallbackCategories(t));
      }
    } catch (err) {
      console.error(err);
      setCategories(fallbackCategories(t));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="max-w-[1200px] mx-auto mt-2 md:mt-4">
        <div className="h-5 w-32 bg-[#E5E7EB] rounded animate-pulse mb-2 md:mb-3"></div>
        <div className="flex gap-3 overflow-hidden px-1 sm:px-0">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-[#E5E7EB] rounded-full w-20 h-20 sm:w-24 sm:h-24 animate-pulse flex-shrink-0"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1200px] mx-auto mt-2 md:mt-4">
      <div className="flex items-center justify-between pl-2 pr-1 sm:pr-0 mb-2 md:mb-3">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#181717]">
          {t.shop} {t.byCategory}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#364152] hover:bg-[#F4F7FB] transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#364152] hover:bg-[#F4F7FB] transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 sm:px-0 pb-1 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center justify-center bg-white border border-[#E5E7EB] rounded-2xl p-3 sm:p-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[#EC008C]/30 hover:scale-[1.03] transition-all duration-200 flex-shrink-0 w-[100px] sm:w-[120px] md:w-[130px] snap-start group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl bg-[#F4F7FB] group-hover:bg-[#FCE8F3] flex items-center justify-center transition-colors duration-200 mb-2 sm:mb-2.5">
                {cat.image ? (
                  <img src={cat.image} alt={catName(cat)} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain group-hover:scale-110 transition-transform duration-200" />
                ) : (
                  <span className="text-2xl sm:text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#364152] text-center leading-tight line-clamp-2">
                {catName(cat)}
              </span>
              {cat.count > 0 && (
                <span className="text-[9px] sm:text-[10px] text-[#667085] mt-0.5">{cat.count} {t.itemsCount}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function fallbackCategories(t) {
  return [
    { nameEn: t.food, nameBn: t.food, slug: "food", icon: "🍞" },
    { nameEn: t.fruitsVegetables, nameBn: t.fruitsVegetables, slug: "fruits-vegetables", icon: "🥬" },
    { nameEn: t.meatFish, nameBn: t.meatFish, slug: "meat-fish", icon: "🥩" },
    { nameEn: t.dairyEggs, nameBn: t.dairyEggs, slug: "dairy-eggs", icon: "🥛" },
    { nameEn: t.drinks, nameBn: t.drinks, slug: "drinks-beverages", icon: "☕" },
    { nameEn: t.snacks, nameBn: t.snacks, slug: "snacks-frozen", icon: "🍪" },
    { nameEn: t.cooking, nameBn: t.cooking, slug: "cooking-essentials", icon: "🍳" },
    { nameEn: t.beauty, nameBn: t.beauty, slug: "beauty-health", icon: "✨" },
  ];
}
