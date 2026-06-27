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

const PLACEHOLDER_PRODUCTS = [
  { name: "Premium Basmati Rice 5kg", price: 650, emoji: "🍚" },
  { name: "Fresh Chicken Breast 1kg", price: 380, emoji: "🍗" },
  { name: "Organic Turmeric Powder", price: 120, emoji: "🌿" },
  { name: "Aashirvaad Atta 10kg", price: 520, emoji: "🌾" },
];

export default function OfferSection({ type, title, subtitle, bgColor = "from-[#00215B] to-[#00AFCC]", badgeColor = "bg-[#EC008C]" }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/flash-deals?type=${type}`)
      .then((res) => setDeals(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type]);

  const displayItems = deals.length > 0
    ? deals.map((deal) => {
        const product = deal.product || {};
        const discount = product.price ? Math.round(((product.price - deal.dealPrice) / product.price) * 100) : 0;
        return {
          id: deal.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          dealPrice: deal.dealPrice,
          image: product.images?.[0] || null,
          discount,
          deliveryTime: product.deliveryTime || "1-2 hours",
          isPlaceholder: false,
        };
      })
    : PLACEHOLDER_PRODUCTS.map((p, i) => ({
        id: `placeholder-${i}`,
        slug: null,
        name: p.name,
        price: p.price,
        dealPrice: Math.round(p.price * 0.7),
        image: null,
        emoji: p.emoji,
        discount: 30,
        deliveryTime: "1-2 hours",
        isPlaceholder: true,
      }));

  if (loading) {
    return (
      <section className="max-w-[1200px] mx-auto mt-4 md:mt-6 px-2 sm:px-0">
        <div className="h-5 w-40 bg-[#E5E7EB] rounded animate-pulse mb-3"></div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#E5E7EB] rounded-lg h-52 w-[170px] sm:flex-1 animate-pulse flex-shrink-0"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1200px] mx-auto mt-4 md:mt-6 px-2 sm:px-0">
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
        {displayItems.map((item) => (
          <Link
            key={item.id}
            href={item.slug ? `/product/${item.slug}` : (item.isPlaceholder ? "/shop" : "#")}
            className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 flex-shrink-0 w-[170px] sm:w-auto snap-start group"
          >
            <div className="relative bg-[#F9FAFB] flex items-center justify-center h-36 sm:h-44 md:h-52">
              <span className={`absolute top-2 left-2 ${badgeColor} text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded z-10`}>
                {item.discount}% OFF
              </span>
              {item.isPlaceholder ? (
                <span className="text-5xl sm:text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-200">{item.emoji}</span>
              ) : item.image ? (
                (item.image.startsWith("http") || item.image.startsWith("/")) ? (
                  <img
                    src={item.image.startsWith("/") ? `${IMG_BASE}${item.image}` : item.image}
                    alt={item.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain group-hover:scale-110 transition-transform duration-200"
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
              <h3 className="text-xs sm:text-[13px] md:text-sm font-medium text-[#181717] line-clamp-2 mb-1.5 min-h-[36px] sm:min-h-[40px] leading-tight">{item.name}</h3>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[#181717] font-bold text-sm sm:text-[15px] md:text-base">৳{item.dealPrice}</span>
                <span className="text-[#667085] text-[11px] sm:text-xs line-through">৳{item.price}</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#00AFCC] flex items-center gap-1">
                <span className="w-1 h-1 bg-[#00AFCC] rounded-full flex-shrink-0"></span>
                <span className="truncate">{item.deliveryTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
