"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/axios";

export default function OfferCarousel() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api.get("/banners?position=center")
      .then((res) => {
        if (cancelled) return;
        const list = res.data.data || [];
        setBanners(list);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch center banners:", err);
        setBanners([]);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

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
      <div className="relative h-16 sm:h-20 md:h-28 lg:h-32 rounded-xl overflow-hidden bg-[#F0F2F5]">
        {banners.map((banner, index) => {
          const bgClass = banner.bgColor || "from-[#00215B] to-[#001A4A]";
          return (
            <Link
              key={banner.id}
              href={banner.link || "#"}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === current ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
              }`}
            >
              {banner.image ? (
                <img src={banner.image} alt={banner.title || "Banner"} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-r ${bgClass} flex items-center justify-center`}>
                  <div className="text-center text-white px-4">
                    <div className="flex items-center justify-center gap-2 mb-0.5 md:mb-1">
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
          );
        })}

        {banners.length > 1 && (
          <div className="absolute bottom-1.5 md:bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {banners.map((banner, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`h-1 md:h-1.5 rounded-full transition-all ${
                  index === current ? "bg-white w-2.5 md:w-3" : "bg-white/50 w-1 md:w-1.5"
                }`}
                aria-label={banner.title || "Slide"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
