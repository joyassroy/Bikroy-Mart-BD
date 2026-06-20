"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

const banners = [
  { id: 1, image: "/banners/banner1.jpg", alt: "Bikroy-Mart Special Offers", link: "/shop" },
  { id: 2, image: "/banners/banner2.jpg", alt: "New Arrivals", link: "/shop" },
  { id: 3, image: "/banners/banner3.jpg", alt: "Flash Deals", link: "/shop" },
];

export default function MiddleBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <div className="relative h-20 sm:h-28 md:h-36 rounded-lg overflow-hidden bg-gray-100">
        {banners.map((banner, index) => (
          <Link
            key={banner.id}
            href={banner.link}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentBanner ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="w-full h-full bg-gradient-to-r from-[#0067A0] to-[#005090] flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                  {language === "bn" ? "বিশেষ অফার" : "Special Offers"}
                </h2>
                <p className="text-sm sm:text-base opacity-90">
                  {language === "bn" ? "সর্বোচ্চ ৫০% পর্যন্ত ছাড়" : "Up to 50% off on selected items"}
                </p>
              </div>
            </div>
          </Link>
        ))}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentBanner ? "bg-white w-4" : "bg-white/50"
              }`}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
