"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";

const IMG_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api").replace("/api", "");

const TYPE_LABELS = {
  STOCK_CLEARANCE: "Stock Clearance",
  EXECUTIVE: "Executive",
  COMBO: "Combo",
  BOGO: "Buy One Get One",
};

export default function OfferSection({ type, title, subtitle, bgColor = "from-[#00215B] to-[#00AFCC]", badgeColor = "bg-[#EC008C]" }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/flash-deals?type=${type}`)
      .then((res) => setDeals(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type]);

  if (loading) {
    return (
      <section className="max-w-[1200px] mx-auto mt-4 md:mt-6">
        <div className="h-5 w-40 bg-[#E5E7EB] rounded animate-pulse mb-3"></div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#E5E7EB] rounded-lg h-44 w-[140px] sm:flex-1 animate-pulse flex-shrink-0"></div>
          ))}
        </div>
      </section>
    );
  }

  if (deals.length === 0) return null;

  return (
    <section className="max-w-[1200px] mx-auto mt-4 md:mt-6">
      <div className={`bg-gradient-to-r ${bgColor} rounded-xl p-3 sm:p-4 mb-3`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">{title}</h2>
            <p className="text-[10px] sm:text-[11px] text-white/80 mt-0.5">{subtitle}</p>
          </div>
          <Link href={`/shop?offer=${type}`} className="bg-white/20 hover:bg-white/30 text-white text-[10px] sm:text-[11px] font-semibold px-3 py-1.5 rounded-md transition">
            View All →
          </Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-3 md:gap-4 sm:overflow-visible snap-x snap-mandatory">
        {deals.map((deal) => {
          const product = deal.product || {};
          const discount = product.price ? Math.round(((product.price - deal.dealPrice) / product.price) * 100) : 0;
          return (
            <Link
              key={deal.id}
              href={product.slug ? `/product/${product.slug}` : "#"}
              className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden hover:shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px] transition flex-shrink-0 w-[170px] sm:w-auto snap-start group"
            >
              <div className="relative bg-[#F9FAFB] p-3 sm:p-4 flex items-center justify-center h-32 sm:h-40 md:h-48">
                <span className={`absolute top-2 left-2 ${badgeColor} text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded`}>
                  {discount}% OFF
                </span>
                {product.images?.[0] ? (
                  (product.images[0].startsWith("http") || product.images[0].startsWith("/")) ? (
                    <img src={product.images[0].startsWith("/") ? `${IMG_BASE}${product.images[0]}` : product.images[0]} alt={product.name} className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain group-hover:scale-110 transition-transform duration-200" loading="lazy" />
                  ) : (
                    <span className="text-4xl sm:text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-200">{product.images[0]}</span>
                  )
                ) : (
                  <span className="text-4xl sm:text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-200">📦</span>
                )}
              </div>
              <div className="p-2.5 sm:p-3 md:p-3.5">
                <h3 className="text-xs sm:text-[13px] md:text-sm font-medium text-[#000000] line-clamp-2 mb-1.5 min-h-[32px] sm:min-h-[36px] md:min-h-[40px] leading-tight">{product.name}</h3>
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="text-[#000000] font-bold text-sm sm:text-[15px] md:text-base">৳{deal.dealPrice}</span>
                  <span className="text-[#667085] text-[11px] sm:text-xs line-through">৳{product.price}</span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#00AFCC] flex items-center gap-1">
                  <span className="w-1 h-1 bg-[#00AFCC] rounded-full flex-shrink-0"></span>
                  <span className="truncate">{product.deliveryTime || "1-2 hours"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
