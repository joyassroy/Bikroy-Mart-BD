"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const { t } = useLanguage();

  const banners = [
    { id: 1, title: t.home === "হোম" ? "Bikroy-Mart-BD-তে স্বাগতম" : "Welcome to Bikroy-Mart-BD", subtitle: t.home === "হোম" ? "৬০ মিনিটে তাজা মাল ডেলিভারি" : "Fresh groceries delivered in 60 minutes", bg: "from-[#0067A0] to-[#003050]" },
    { id: 2, title: t.home === "হোম" ? "দৈনিক তাজা শাকসবজি" : "Daily Fresh Vegetables", subtitle: t.home === "হোম" ? "খামার থেকে সরাসরি আপনার রান্নাঘরে" : "Farm to table, straight to your kitchen", bg: "from-[#005090] to-[##004070]" },
    { id: 3, title: t.home === "হোম" ? "মেগা সেভিংস সপ্তাহ" : "Mega Savings Week", subtitle: t.home === "হোম" ? "দৈনিক প্রয়োজনীয় জিনিসে ৫০% পর্যন্ত ছাড়" : "Up to 50% off on daily essentials", bg: "from-[#323A3E] to-[#111827]" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4">
        <div className="relative rounded-2xl overflow-hidden">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 bg-gradient-to-r ${banner.bg} transition-opacity duration-500 ${
                index === current ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="flex items-center justify-center h-[200px] md:h-[320px] text-white text-center px-6">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h1>
                  <p className="text-base md:text-xl opacity-90 mb-4">{banner.subtitle}</p>
                  <Link href="/shop" className="inline-block bg-white text-[#0067A0] px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition text-base">
                    {t.shopNow}
                  </Link>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-20 transition"
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-20 transition"
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full transition ${index === current ? "bg-white" : "bg-white/50"}`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
