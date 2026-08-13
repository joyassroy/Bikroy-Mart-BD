"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const res = await api.get("/banners?position=hero");
      const data = res.data.data || [];
      if (data.length > 0) {
        setBanners(data);
      } else {
        setBanners([
          { id: "1", title: language === "bn" ? "Bikroymart BD-তে স্বাগতম" : "Welcome to Bikroymart BD", subtitle: language === "bn" ? "৬০ মিনিটে তাজা মাল ডেলিভারি" : "Fresh groceries delivered in 60 minutes", bgColor: "from-[#00215B] to-[#001A4A]" },
          { id: "2", title: language === "bn" ? "দৈনিক তাজা শাকসবজি" : "Daily Fresh Vegetables", subtitle: language === "bn" ? "খামার থেকে সরাসরি আপনার রান্নাঘরে" : "Farm to table, straight to your kitchen", bgColor: "from-[#EC008C] to-[#D60071]" },
          { id: "3", title: language === "bn" ? "মেগা সেভিংস সপ্তাহ" : "Mega Savings Week", subtitle: language === "bn" ? "দৈনিক প্রয়োজনীয় জিনিসে ৫০% পর্যন্ত ছাড়" : "Up to 50% off on daily essentials", bgColor: "from-[#00AFCC] to-[#009AB5]" },
        ]);
      }
    } catch (err) {
      console.error(err);
      setBanners([
        { id: "1", title: language === "bn" ? "Bikroymart BD-তে স্বাগতম" : "Welcome to Bikroymart BD", subtitle: language === "bn" ? "৬০ মিনিটে তাজা মাল ডেলিভারি" : "Fresh groceries delivered in 60 minutes", bgColor: "from-[#00215B] to-[#001A4A]" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="overflow-hidden">
        <div className="max-w-[1200px] mx-auto md:mt-4 md:gap-5">
          <div className="w-full bg-[#E5E7EB] animate-pulse rounded-lg" style={{ aspectRatio: "3/1" }}></div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1200px] mx-auto md:mt-4 md:gap-5">
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/1" }}>
          {banners.map((banner, index) => {
            const bgClass = banner.bgColor || "from-[#00215B] to-[#001A4A]";
            return (
              <Link
                key={banner.id}
                href={banner.link || "/shop"}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === current ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-r ${bgClass}`}>
                    <div className="flex items-center justify-center h-full text-white text-center px-5 md:px-10">
                      <div>
                        <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5 md:mb-2 leading-tight">{banner.title}</h1>
                        {banner.subtitle && (
                          <p className="text-[11px] sm:text-sm md:text-base opacity-90 mb-3 md:mb-4">{banner.subtitle}</p>
                        )}
                        <span className="inline-block bg-[#EC008C] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-md font-semibold hover:bg-[#D60071] transition text-[11px] sm:text-xs shadow-[rgba(0,0,0,0.1)_0px_2px_4px_0px]">
                          {t.shopNow}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}

          {banners.length > 1 && (
            <>
              <button
                onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
                className="hidden sm:flex absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#000000] w-8 h-8 md:w-9 md:h-9 rounded-full items-center justify-center shadow-[rgba(0,0,0,0.1)_0px_2px_4px_0px] z-20 transition"
                aria-label="Previous"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
                className="hidden sm:flex absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#000000] w-8 h-8 md:w-9 md:h-9 rounded-full items-center justify-center shadow-[rgba(0,0,0,0.1)_0px_2px_4px_0px] z-20 transition"
                aria-label="Next"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {banners.length > 1 && (
            <div className="absolute bottom-2.5 md:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-1.5 rounded-full transition-all ${index === current ? "bg-[#EC008C] w-3.5" : "bg-white/60 w-1.5"}`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
