"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import { useLanguage } from "@/i18n/LanguageContext";
import ProductCard from "@/components/product/ProductCard";

const IMG_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api").replace("/api", "");

export default function OfferSection({ type, title, subtitle, bgColor = "from-[#00215B] to-[#00AFCC]", badgeColor = "bg-[#EC008C]" }) {
  const { t } = useLanguage();
  const TYPE_LABELS = {
    STOCK_CLEARANCE: t.stockClearance,
    EXECUTIVE: t.executive,
    COMBO: t.comboOffer,
    BOGO: t.buyOneGetOne,
  };
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    api.get(`/products?offer=${type}&limit=3`)
      .then((res) => {
        setProducts(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      })
      .catch((err) => {
        console.error(`OfferSection(${type}) fetch error:`, err);
      })
      .finally(() => setLoading(false));
  }, [type]);

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
  }, [products]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="max-w-[1200px] mx-auto mt-4 md:mt-6 px-2 sm:px-0">
        <div className="h-5 w-40 bg-[#E5E7EB] rounded animate-pulse mb-3"></div>
        <div className="flex gap-2 overflow-hidden pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#E5E7EB] rounded-xl h-52 w-[170px] sm:flex-1 animate-pulse flex-shrink-0"></div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="max-w-[1200px] mx-auto mt-4 md:mt-6 px-2 sm:px-0">
      <div className={`bg-gradient-to-r ${bgColor} rounded-2xl p-3 sm:p-4 mb-3`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{title}</h2>
            <p className="text-[11px] sm:text-xs text-white/80 mt-0.5">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <Link href={`/shop?offer=${type}`} className="bg-white/20 hover:bg-white/30 text-white text-[10px] sm:text-[11px] font-semibold px-3 py-1.5 rounded-lg transition hidden sm:block">
              {t.viewAll} →
            </Link>
          </div>
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
          className="flex gap-2.5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-0.5 pb-2 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-3 md:gap-4 sm:overflow-visible"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-[160px] sm:w-auto flex-shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
          {total > 3 && (
            <Link
              href={`/shop?offer=${type}`}
              className="w-[160px] sm:w-auto flex-shrink-0 snap-start bg-white rounded-2xl border border-[#E5E7EB] flex flex-col items-center justify-center min-h-[250px] group hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-[#F4F7FB] group-hover:bg-[#EC008C] flex items-center justify-center text-[#EC008C] group-hover:text-white transition-colors duration-300 mb-3">
                <ChevronRight size={28} />
              </div>
              <span className="font-bold text-[#00215B] text-sm sm:text-base group-hover:text-[#EC008C] transition-colors">{t.viewAll}</span>
              <span className="text-xs text-[#667085] mt-1">{total - 3} {t.products} {t.more}</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
