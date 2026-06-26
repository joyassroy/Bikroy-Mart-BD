"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";

const IMG_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api").replace("/api", "");

function CountdownTimer({ endsAt }) {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const end = new Date(endsAt);
      const diff = Math.max(0, end - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTime({ hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1 text-[#FF6B6B] font-mono font-bold text-[11px] sm:text-xs">
      <Clock size={14} />
      <span>{pad(time.hours)}</span>:<span>{pad(time.minutes)}</span>:<span>{pad(time.seconds)}</span>
    </div>
  );
}

function ProductImage({ src, alt, className }) {
  const imgClass = className || "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32";
  if (!src) return <span className="text-4xl sm:text-5xl md:text-6xl">📦</span>;
  if (src.startsWith("http") || src.startsWith("/")) {
    const url = src.startsWith("/") ? `${IMG_BASE}${src}` : src;
    return <img src={url} alt={alt} className={`${imgClass} object-contain group-hover:scale-110 transition-transform duration-200`} loading="lazy" />;
  }
  return <span className="text-4xl sm:text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-200">{src}</span>;
}

export default function FlashDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchDeals();
  }, []);

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
          deliveryTime: deal.product?.deliveryTime || "1-2 hours",
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
      <section className="max-w-[1200px] mx-auto mt-2 md:mt-4">
        <div className="flex items-center justify-between mb-2 md:mb-3 px-2 sm:px-0">
          <div>
            <div className="h-5 w-28 bg-[#E5E7EB] rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 px-2 sm:px-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#E5E7EB] rounded-lg h-48 w-[140px] sm:w-auto sm:flex-1 animate-pulse flex-shrink-0"></div>
          ))}
        </div>
      </section>
    );
  }

  if (deals.length === 0) return null;

  return (
    <section className="max-w-[1200px] mx-auto mt-2 md:mt-4">
      <div className="flex items-center justify-between mb-2 md:mb-3 px-2 sm:px-0">
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[#181717]">{t.flashDeals}</h2>
          <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5">{t.viewAllDeals}</p>
        </div>
        <CountdownTimer endsAt={deals[0]?.endsAt || new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 px-2 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-3 md:gap-4 sm:overflow-visible snap-x snap-mandatory">
        {deals.map((deal) => (
          <Link
            key={deal.id}
            href={deal.slug ? `/product/${deal.slug}` : "#"}
            className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden hover:shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px] transition flex-shrink-0 w-[170px] sm:w-auto snap-start group"
          >
            <div className="relative bg-[#F9FAFB] p-3 sm:p-4 flex items-center justify-center h-32 sm:h-40 md:h-48">
              <span className="absolute top-2 left-2 bg-[#FF6B6B] text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded">{deal.badge}</span>
              <ProductImage src={deal.image} alt={deal.name} className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32" />
            </div>
            <div className="p-2.5 sm:p-3 md:p-3.5">
              <h3 className="text-xs sm:text-[13px] md:text-sm font-medium text-[#000000] line-clamp-2 mb-1.5 min-h-[32px] sm:min-h-[36px] md:min-h-[40px] leading-tight">{deal.name}</h3>
              <div className="text-[10px] sm:text-[11px] text-[#00AFCC] mb-1.5 flex items-center gap-1">
                <span className="w-1 h-1 bg-[#00AFCC] rounded-full flex-shrink-0"></span>
                <span className="truncate">{deal.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#000000] font-bold text-sm sm:text-[15px] md:text-base">৳{deal.dealPrice}</span>
                <span className="text-[#667085] text-[11px] sm:text-xs line-through">৳{deal.price}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
