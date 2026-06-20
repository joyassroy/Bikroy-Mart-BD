"use client";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const sampleDeals = [
  { id: 1, name: "Dabur Narikel Tel 200ml", price: 200, dealPrice: 99, image: "🥥", badge: "51% OFF" },
  { id: 2, name: "KFK Plain Paratha 1300gm", price: 320, dealPrice: 272, image: "🫓", badge: "15% OFF" },
  { id: 3, name: "Surf Excel Matic Liquid 1L", price: 400, dealPrice: 299, image: "🧴", badge: "25% OFF" },
  { id: 4, name: "Domex Toilet Cleaner 750ml", price: 180, dealPrice: 99, image: "🧹", badge: "45% OFF" },
];

function CountdownTimer() {
  const [time, setTime] = useState({ hours: 2, minutes: 45, seconds: 30 });
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) return { hours: 0, minutes: 0, seconds: 0 };
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 text-[#C30000] font-mono font-bold text-lg">
      <Clock size={20} />
      <span>{pad(time.hours)}</span>:<span>{pad(time.minutes)}</span>:<span>{pad(time.seconds)}</span>
    </div>
  );
}

export default function FlashDeals() {
  const { t } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t.flashDeals}</h2>
          <p className="text-sm text-gray-500 mt-1">{t.viewAllDeals}</p>
        </div>
        <CountdownTimer />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {sampleDeals.map((deal) => (
          <div key={deal.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
            <div className="relative bg-gray-50 p-4 flex items-center justify-center h-32">
              <span className="absolute top-3 left-3 bg-[#C30000] text-white text-sm font-bold px-3 py-1 rounded-lg">{deal.badge}</span>
              <span className="text-6xl">{deal.image}</span>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 min-h-[40px]">{deal.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#0067A0] font-bold text-base">৳{deal.dealPrice}</span>
                <span className="text-gray-400 text-sm line-through">৳{deal.price}</span>
              </div>
              <button className="btn-primary w-full text-xs py-2">{t.addToCart}</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
