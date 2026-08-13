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
            <div key={i} className="bg-[#E5E7EB] rounded-2xl w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px] animate-pulse flex-shrink-0"></div>
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
              className="relative flex-shrink-0 w-[140px] h-[170px] sm:w-[160px] sm:h-[190px] md:w-[180px] md:h-[210px] snap-start group overflow-hidden rounded-3xl bg-white border border-[#E5E7EB] hover:shadow-[0_16px_40px_-4px_rgba(0,33,91,0.2)] hover:border-[#00215B]/40 hover:-translate-y-2 [will-change:transform] transition-all duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              <div className="absolute inset-0 bg-[#F4F7FB] group-hover:bg-[#EDF1F7] transition-colors duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
                {cat.image ? (
                  <img src={cat.image} alt={catName(cat)} className="w-full h-[75%] rounded-3xl p-3 [will-change:transform] group-hover:scale-[1.08] transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]" />
                ) : (
                  <div className="w-full h-[75%] flex items-center justify-center">
                    <span className="text-5xl sm:text-6xl md:text-7xl [will-change:transform] group-hover:scale-110 group-hover:rotate-2 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]">{cat.icon}</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-gradient-to-t from-[#00215B] via-[#00215B]/90 to-[#00215B]/60 flex items-center justify-center px-2">
                <span className="text-white font-bold text-base sm:text-lg text-center leading-tight line-clamp-2 drop-shadow-sm [will-change:transform] group-hover:tracking-wide transition-[transform,letter-spacing] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
                  {catName(cat)}
                </span>
              </div>
              {cat.count > 0 && (
                <span className="absolute top-2.5 right-2.5 bg-gradient-to-br from-[#EC008C] to-[#C40074] text-white text-[10px] sm:text-xs font-bold rounded-full px-2 py-[3px] leading-none shadow-[0_2px_8px_rgba(236,0,140,0.4)] group-hover:shadow-[0_4px_16px_rgba(236,0,140,0.5)] group-hover:scale-110 [will-change:transform] transition-all duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
                  {cat.count}
                </span>
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
