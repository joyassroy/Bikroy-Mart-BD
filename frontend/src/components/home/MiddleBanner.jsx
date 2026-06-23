"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";

export default function MiddleBanner() {
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const res = await api.get("/banners?position=center");
      const data = res.data.data || [];
      if (data.length > 0) {
        setBanners(data);
      } else {
        setBanners([
          { id: "1", image: null, title: language === "bn" ? "বিশেষ অফার" : "Special Offers", subtitle: language === "bn" ? "সর্বোচ্চ ৫০% পর্যন্ত ছাড়" : "Up to 50% off on selected items", link: "/shop", bgColor: "from-[#EC008C] to-[#E85AA0]" },
          { id: "2", image: null, title: language === "bn" ? "নতুন আগমন" : "New Arrivals", subtitle: language === "bn" ? "সর্বশেষ পণ্য দেখুন" : "Check out the latest products", link: "/shop", bgColor: "from-[#00AFCC] to-[#009AB5]" },
          { id: "3", image: null, title: language === "bn" ? "ফ্ল্যাশ ডিল" : "Flash Deals", subtitle: language === "bn" ? "সীমিত সময়ের জন্য অফার" : "Limited time offers", link: "/shop", bgColor: "from-[#00215B] to-[#001A4A]" },
        ]);
      }
    } catch (err) {
      console.error(err);
      setBanners([
        { id: "1", image: null, title: language === "bn" ? "বিশেষ অফার" : "Special Offers", subtitle: language === "bn" ? "সর্বোচ্চ ৫০% পর্যন্ত ছাড়" : "Up to 50% off on selected items", link: "/shop", bgColor: "from-[#EC008C] to-[#E85AA0]" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto mt-2 md:mt-4">
        <div className="h-16 sm:h-20 md:h-28 lg:h-32 bg-[#E5E7EB] rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto mt-2 md:mt-4">
      <div className="relative h-16 sm:h-20 md:h-28 lg:h-32 rounded-none md:rounded-lg overflow-hidden bg-[#F4F7FB]">
        {banners.map((banner, index) => {
          const bgClass = banner.bgColor || "from-[#EC008C] to-[#E85AA0]";
          return (
            <Link
              key={banner.id}
              href={banner.link || "/shop"}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentBanner ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {banner.image ? (
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-r ${bgClass} flex items-center justify-center`}>
                  <div className="text-center text-white px-4">
                    <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold mb-0.5 md:mb-1">
                      {banner.title}
                    </h2>
                    {banner.subtitle && (
                      <p className="text-[10px] sm:text-xs md:text-sm opacity-90">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
        {banners.length > 1 && (
          <div className="absolute bottom-1.5 md:bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`h-1 md:h-1.5 rounded-full transition-all ${
                  index === currentBanner ? "bg-white w-2.5 md:w-3" : "bg-white/50 w-1 md:w-1.5"
                }`}
                aria-label={`Banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
