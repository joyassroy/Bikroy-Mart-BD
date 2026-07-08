"use client";
import { useRef, useCallback, memo } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/i18n/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductGroupRow = memo(function ProductGroupRow({ categorySlug, subcategory, products, showActions, onDelete, onProductUpdated }) {
  const scrollRef = useRef(null);
  const { t, language } = useLanguage();

  const scroll = useCallback((dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="font-semibold text-sm sm:text-base text-[#00215B]">
          {language === "bn" ? (subcategory.nameBn || subcategory.name) : subcategory.name}
        </h3>
        <Link
          href={`/shop?category=${categorySlug}&subcategory=${subcategory.slug}`}
          className="text-[11px] sm:text-xs font-semibold text-[#EC008C] hover:text-[#D60071] transition flex items-center gap-0.5"
        >
          {t.seeAll} <ChevronRight size={14} />
        </Link>
      </div>

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-[#E5E7EB] rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#F4F7FB]"
        >
          <ChevronLeft size={16} className="text-[#364152]" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[150px] sm:w-[170px] md:w-[185px] snap-start">
              <ProductCard
                product={product}
                showActions={showActions}
                onDelete={onDelete}
                onProductUpdated={onProductUpdated}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-[#E5E7EB] rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#F4F7FB]"
        >
          <ChevronRight size={16} className="text-[#364152]" />
        </button>
      </div>
    </div>
  );
});

export default ProductGroupRow;
