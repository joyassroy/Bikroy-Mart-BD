"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";

const OFFER_TYPES = [
  {
    key: "COMBO",
    position: "offer_combo",
    link: "/shop?offer=COMBO",
    fallbackBg: "from-[#00215B] to-[#00AFCC]",
    fallbackTitleBn: "কম্বো অফার",
    fallbackTitleEn: "Combo Offer",
    fallbackSubBn: "বেশি কিনুন, বেশি সাশ্রয় করুন!",
    fallbackSubEn: "Buy more together, save more!",
    emoji: "📦",
  },
  {
    key: "EXECUTIVE",
    position: "offer_executive",
    link: "/shop?offer=EXECUTIVE",
    fallbackBg: "from-[#EC008C] to-[#D60071]",
    fallbackTitleBn: "এক্সিকিউটিভ অফার",
    fallbackTitleEn: "Executive Offer",
    fallbackSubBn: "প্রিমিয়াম পণ্য বিশেষ দামে!",
    fallbackSubEn: "Premium products at exclusive prices!",
    emoji: "✨",
  },
  {
    key: "STOCK_CLEARANCE",
    position: "offer_stock_clearance",
    link: "/shop?offer=STOCK_CLEARANCE",
    fallbackBg: "from-[#DC2626] to-[#F87171]",
    fallbackTitleBn: "স্টক ক্লিয়ারেন্স",
    fallbackTitleEn: "Stock Clearance",
    fallbackSubBn: "শেষ সুযোগ — অবিশ্বাস্য দামে সীমিত স্টক!",
    fallbackSubEn: "Last chance — limited stock at unbeatable prices!",
    emoji: "🔥",
  },
  {
    key: "BOGO",
    position: "offer_bogo",
    link: "/shop?offer=BOGO",
    fallbackBg: "from-[#059669] to-[#34D399]",
    fallbackTitleBn: "বাই ওয়ান গেট ওয়ান",
    fallbackTitleEn: "Buy One Get One Free",
    fallbackSubBn: "১টি কিনুন, ১টি পান!",
    fallbackSubEn: "Buy 1, Get 1 Free — limited time!",
    emoji: "🎁",
  },
];

export default function OfferCarousel() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const isBn = language === "bn";

  useEffect(() => {
    let cancelled = false;
    const fetchAll = OFFER_TYPES.map((offer) =>
      api.get(`/banners?position=${offer.position}`).then((res) => {
        const list = res.data.data || [];
        if (list.length > 0) {
          return { ...offer, banner: list[0] };
        }
        return {
          ...offer,
          banner: null,
          title: isBn ? offer.fallbackTitleBn : offer.fallbackTitleEn,
          subtitle: isBn ? offer.fallbackSubBn : offer.fallbackSubEn,
          bgClass: offer.fallbackBg,
        };
      }).catch(() => ({
        ...offer,
        banner: null,
        title: isBn ? offer.fallbackTitleBn : offer.fallbackTitleEn,
        subtitle: isBn ? offer.fallbackSubBn : offer.fallbackSubEn,
        bgClass: offer.fallbackBg,
      }))
    );

    Promise.all(fetchAll).then((results) => {
      if (cancelled) return;
      const mapped = results.map((r) => ({
        id: r.key,
        link: r.banner?.link || r.link,
        image: r.banner?.image || null,
        title: r.banner?.title || r.title,
        subtitle: r.banner?.subtitle || r.subtitle,
        bgClass: r.banner?.bgColor || r.bgClass,
        emoji: r.emoji,
      }));
      setBanners(mapped);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [isBn]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const goTo = useCallback((idx) => setCurrent(idx), []);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto mt-2 md:mt-4 px-3 sm:px-4 md:px-6 lg:px-10">
        <div className="h-16 sm:h-20 md:h-28 lg:h-32 bg-[#E5E7EB] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="max-w-[1200px] mx-auto mt-2 md:mt-4 px-3 sm:px-4 md:px-6 lg:px-10">
      <div className="relative h-16 sm:h-20 md:h-28 lg:h-32 rounded-lg overflow-hidden bg-[#F0F2F5]">
        {banners.map((banner, index) => (
          <Link
            key={banner.id}
            href={banner.link}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === current ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
            }`}
          >
            {banner.image ? (
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-r ${banner.bgClass} flex items-center justify-center`}>
                <div className="text-center text-white px-4">
                  <div className="flex items-center justify-center gap-2 mb-0.5 md:mb-1">
                    <span className="text-lg sm:text-xl md:text-2xl">{banner.emoji}</span>
                    <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold">
                      {banner.title}
                    </h2>
                  </div>
                  {banner.subtitle && (
                    <p className="text-[10px] sm:text-xs md:text-sm opacity-90">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}
          </Link>
        ))}

        {banners.length > 1 && (
          <div className="absolute bottom-1.5 md:bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {banners.map((banner, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`h-1 md:h-1.5 rounded-full transition-all ${
                  index === current ? "bg-white w-2.5 md:w-3" : "bg-white/50 w-1 md:w-1.5"
                }`}
                aria-label={banner.title}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
