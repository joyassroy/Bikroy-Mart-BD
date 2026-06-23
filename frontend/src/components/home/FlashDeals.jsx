"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";

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
        setDeals(data.map((deal) => ({
          id: deal.id,
          name: deal.product?.name || "Product",
          price: deal.product?.price || 0,
          dealPrice: deal.dealPrice,
          image: deal.product?.images?.[0] || "📦",
          badge: deal.product?.discountPrice
            ? `${Math.round(((deal.product.price - deal.dealPrice) / deal.product.price) * 100)}% OFF`
            : "DEAL",
          endsAt: deal.endsAt,
          slug: deal.product?.slug,
          deliveryTime: deal.product?.deliveryTime || "1-2 hours",
          stock: deal.quantity - deal.sold,
        })));
      } else {
        setDeals([
          { id: "1", name: "Dabur Narikel Tel 200ml", price: 200, dealPrice: 99, image: "🥥", badge: "51% OFF", endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() },
          { id: "2", name: "KFK Plain Paratha 1300gm", price: 320, dealPrice: 272, image: "🫓", badge: "15% OFF", endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() },
          { id: "3", name: "Surf Excel Matic Liquid 1L", price: 400, dealPrice: 299, image: "🧴", badge: "25% OFF", endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() },
          { id: "4", name: "Domex Toilet Cleaner 750ml", price: 180, dealPrice: 99, image: "🧹", badge: "45% OFF", endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() },
        ]);
      }
    } catch (err) {
      console.error(err);
      setDeals([
        { id: "1", name: "Dabur Narikel Tel 200ml", price: 200, dealPrice: 99, image: "🥥", badge: "51% OFF", endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() },
        { id: "2", name: "KFK Plain Paratha 1300gm", price: 320, dealPrice: 272, image: "🫓", badge: "15% OFF", endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() },
        { id: "3", name: "Surf Excel Matic Liquid 1L", price: 400, dealPrice: 299, image: "🧴", badge: "25% OFF", endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() },
        { id: "4", name: "Domex Toilet Cleaner 750ml", price: 180, dealPrice: 99, image: "🧹", badge: "45% OFF", endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() },
      ]);
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

      <div className="flex gap-2 overflow-x-auto pb-2 px-2 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-2.5 md:gap-3 sm:overflow-visible snap-x snap-mandatory">
        {deals.map((deal) => (
          <Link
            key={deal.id}
            href={deal.slug ? `/product/${deal.slug}` : "#"}
            className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden hover:shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px] transition flex-shrink-0 w-[140px] sm:w-auto snap-start group"
          >
            <div className="relative bg-[#F9FAFB] p-2 sm:p-3 flex items-center justify-center h-24 sm:h-28">
              <span className="absolute top-1.5 left-1.5 bg-[#FF6B6B] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded">{deal.badge}</span>
              <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-200">{deal.image}</span>
            </div>
            <div className="p-2 sm:p-2.5">
              <h3 className="text-[11px] sm:text-xs font-medium text-[#000000] line-clamp-2 mb-1 min-h-[30px] sm:min-h-[36px] leading-tight">{deal.name}</h3>
              <div className="text-[9px] sm:text-[10px] text-[#00AFCC] mb-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-[#00AFCC] rounded-full flex-shrink-0"></span>
                <span className="truncate">{deal.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-[#000000] font-bold text-xs sm:text-sm">৳{deal.dealPrice}</span>
                <span className="text-[#667085] text-[10px] sm:text-xs line-through">৳{deal.price}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
