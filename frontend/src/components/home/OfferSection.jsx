"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import { useLanguage } from "@/i18n/LanguageContext";
import CountdownTimer from "@/components/ui/CountdownTimer";

const IMG_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api").replace("/api", "");

export default function OfferSection({ type, title, subtitle, bgColor = "from-[#00215B] to-[#00AFCC]", badgeColor = "bg-[#EC008C]" }) {
  const { t } = useLanguage();
  const TYPE_LABELS = {
    STOCK_CLEARANCE: t.stockClearance,
    EXECUTIVE: t.executive,
    COMBO: t.comboOffer,
    BOGO: t.buyOneGetOne,
  };
  const [deals, setDeals] = useState([]);
  const [promoOffers, setPromoOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const isMulti = type === "COMBO" || type === "BOGO" || type === "CUSTOM";
    const fetches = [];
    if (!isMulti) fetches.push(api.get(`/flash-deals?type=${type}`).catch((err) => { console.error(`OfferSection(${type}) fetch error:`, err); return { data: { data: [] } }; }));
    if (isMulti) fetches.push(api.get(`/offers?type=${type}`).catch((err) => { console.error(`OfferSection(${type}) fetch error:`, err); return { data: { data: [] } }; }));

    Promise.all(fetches).then((results) => {
      if (isMulti) {
        setPromoOffers(results[0].data.data || []);
      } else {
        setDeals(results[0].data.data || []);
      }
    }).finally(() => setLoading(false));
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
  }, [deals, promoOffers]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const displayItems = deals.length > 0
    ? deals.map((deal) => {
        const product = deal.product || {};
        const discount = product.price ? Math.round(((product.price - deal.dealPrice) / product.price) * 100) : 0;
        const stock = deal.quantity - deal.sold;
        return {
          id: deal.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          dealPrice: deal.dealPrice,
          image: product.images?.[0] || null,
          discount,
          stock,
          endsAt: deal.endsAt,
          badge: null,
        };
      })
    : promoOffers.length > 0
    ? promoOffers.map((offer) => {
        const firstItem = offer.items?.[0]?.product;
        const totalOriginal = offer.items?.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0) || 0;
        const discount = totalOriginal > 0 ? Math.round(((totalOriginal - offer.offerPrice) / totalOriginal) * 100) : 0;
        const name = offer.title || (offer.items?.map((i) => i.product?.name).join(" + "));
        const minStock = offer.items?.reduce((min, i) => {
          const s = i.product?.stock ?? 0;
          return min === null ? s : Math.min(min, s);
        }, null);
        return {
          id: offer.id,
          slug: firstItem?.slug,
          name,
          price: totalOriginal,
          dealPrice: offer.offerPrice,
          image: firstItem?.images?.[0] || null,
          discount,
          stock: minStock,
          endsAt: offer.endsAt,
          badge: type === "BOGO" ? `${t.buyXGetY.replace("{buy}", offer.buyQuantity).replace("{get}", offer.getQuantity)}` : type === "COMBO" ? t.bundleDeal : null,
          items: offer.items,
        };
      })
    : [];

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

  if (displayItems.length === 0) return null;

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
          {displayItems.map((item) => {
            const isBogo = type === "BOGO" && item.badge;
            return (
              <Link
                key={item.id}
                href={item.slug ? `/product/${item.slug}` : "#"}
                className={`bg-white rounded-2xl overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-200 flex-shrink-0 w-[160px] sm:w-auto snap-start group ${
                  isBogo ? "border-2 border-[#F59E0B]" : "border border-[#E5E7EB]"
                }`}
              >
                <div className={`relative flex items-center justify-center h-36 sm:h-44 md:h-52 overflow-hidden rounded-t-2xl ${
                  isBogo ? "bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]" : "bg-[#F9FAFB]"
                }`}>
                  {isBogo ? (
                    <span className="absolute top-2 left-2 bg-[#F59E0B] text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
                      🎁 {item.badge}
                    </span>
                  ) : (
                    <span className={`absolute top-2 left-2 ${badgeColor} text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full z-10`}>
                      {item.discount}% OFF
                    </span>
                  )}
                  {isBogo && (
                    <span className="absolute top-2 right-2 bg-[#EC008C] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
                      {t.freeLabel}
                    </span>
                  )}
                  {!isBogo && item.discount >= 40 && (
                    <span className="absolute top-2 right-2 bg-[#DC2626] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
                      {t.hotDeal}
                    </span>
                  )}
                  {item.image ? (
                    (item.image.startsWith("http") || item.image.startsWith("/")) ? (
                      <img
                        src={item.image.startsWith("/") ? `${IMG_BASE}${item.image}` : item.image}
                        alt={item.name}
                        className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl group-hover:scale-110 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-5xl sm:text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-200">{item.image}</span>
                    )
                  ) : (
                    <span className="text-5xl sm:text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-200">📦</span>
                  )}
                </div>
                <div className="p-3 sm:p-3.5">
                  <h3 className="text-base sm:text-lg font-bold text-[#181717] line-clamp-2 mb-1.5 min-h-[36px] sm:min-h-[40px] leading-tight">{item.name}</h3>
                  {item.items && item.items.length > 1 && (
                    <div className="text-[9px] text-gray-400 mb-1">
                      {item.items.map((i) => i.product?.name).filter(Boolean).join(" + ")}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`font-bold text-base sm:text-lg md:text-xl ${isBogo ? "text-[#F59E0B]" : "text-[#EC008C]"}`}>৳{item.dealPrice}</span>
                    <span className="text-[#667085] text-xs sm:text-sm line-through">৳{item.price}</span>
                  </div>
                  {isBogo && (
                    <div className="text-[9px] sm:text-[10px] text-[#16A34A] font-semibold mb-1">
                      {t.youSave.replace("{amount}", `৳${Math.max(0, item.price - item.dealPrice)}`)}
                    </div>
                  )}
                  {item.stock !== undefined && item.stock !== null && (
                    <div className="text-[9px] sm:text-[10px] font-medium text-[#667085]">
                      {item.stock > 0 ? t.stockLabel.replace("{count}", item.stock) : t.outOfStock}
                    </div>
                  )}
                  {item.endsAt && (
                    <div className="mt-1">
                      <CountdownTimer endsAt={item.endsAt} compact />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
