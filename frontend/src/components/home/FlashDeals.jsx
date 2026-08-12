"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";
import CountdownTimer from "@/components/ui/CountdownTimer";

const IMG_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api").replace("/api", "");

function ProductImage({ src, alt, className }) {
  const imgClass = className || "w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36";
  if (!src) return <span className="text-5xl sm:text-6xl md:text-7xl">📦</span>;
  if (src.startsWith("http") || src.startsWith("/")) {
    const url = src.startsWith("/") ? `${IMG_BASE}${src}` : src;
    return <img src={url} alt={alt} className={`${imgClass} object-contain rounded-xl group-hover:scale-110 transition-transform duration-200`} loading="lazy" />;
  }
  return <span className="text-5xl sm:text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-200">{src}</span>;
}

export default function FlashDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetchDeals();
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
  }, [deals]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const fetchDeals = async () => {
    try {
      const res = await api.get("/flash-deals");
      const data = res.data.data || [];
      if (data.length > 0) {
        setDeals(data.filter(d => d.type === "FLASH_DEAL" || !d.type).map((deal) => ({
          id: deal.id,
          name: deal.product?.name || "Product",
          price: deal.product?.price || 0,
          dealPrice: deal.dealPrice,
          image: deal.product?.images?.[0] || null,
          badge: deal.product?.price
            ? `${Math.round(((deal.product.price - deal.dealPrice) / deal.product.price) * 100)}% OFF`
            : "DEAL",
          endsAt: deal.endsAt,
          slug: deal.product?.slug,
          stock: deal.quantity - deal.sold,
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="max-w-[1200px] mx-auto mt-2 md:mt-4 px-2 sm:px-0">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div>
            <div className="h-5 w-28 bg-[#E5E7EB] rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex gap-2 overflow-hidden pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#E5E7EB] rounded-xl h-52 w-[170px] sm:w-auto sm:flex-1 animate-pulse flex-shrink-0"></div>
          ))}
        </div>
      </section>
    );
  }

  if (deals.length === 0) return null;

  return (
    <section className="max-w-[1200px] mx-auto mt-2 md:mt-4 px-2 sm:px-0">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#181717]">{t.flashDeals}</h2>
          <p className="text-[11px] sm:text-xs text-[#667085] mt-0.5">{t.viewAllDeals}</p>
        </div>
        <div className="flex items-center gap-2">
          <CountdownTimer endsAt={deals[0]?.endsAt || new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()} />
          <div className="flex gap-1 hidden sm:flex">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="w-7 h-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#364152] hover:bg-[#F4F7FB] transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="w-7 h-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#364152] hover:bg-[#F4F7FB] transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
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
          {deals.map((deal) => (
            <Link
              key={deal.id}
              href={deal.slug ? `/product/${deal.slug}` : "#"}
              className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-200 flex-shrink-0 w-[160px] sm:w-auto snap-start group"
            >
              <div className="relative bg-[#F9FAFB] flex items-center justify-center h-36 sm:h-44 md:h-52 overflow-hidden rounded-t-2xl">
                <span className="absolute top-2 left-2 bg-[#FF6B6B] text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full z-10">{deal.badge}</span>
                {deal.stock <= 5 && deal.stock > 0 && (
                  <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
                    {t.onlyLeft.replace("{count}", deal.stock)}
                  </span>
                )}
                <ProductImage src={deal.image} alt={deal.name} />
              </div>
              <div className="p-3 sm:p-3.5">
                <h3 className="text-base sm:text-lg font-bold text-[#181717] line-clamp-2 mb-1.5 min-h-[36px] sm:min-h-[40px] leading-tight">{deal.name}</h3>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[#EC008C] font-bold text-base sm:text-lg md:text-xl">৳{deal.dealPrice}</span>
                  <span className="text-[#667085] text-xs sm:text-sm line-through">৳{deal.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
