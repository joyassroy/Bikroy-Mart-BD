"use client";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { addToCart } from "@/redux/cartSlice";
import { ShoppingCart, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { t } = useLanguage();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images?.[0],
      quantity: 1,
    }));
    toast.success(t.addToCart);
  };

  const avgRating = product._count?.reviews > 0
    ? (product.reviews?.reduce?.((sum, r) => sum + r.rating, 0) / product.reviews.length) || 0
    : 0;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="bg-[#f4f7fb] rounded-lg overflow-hidden hover:shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,rgba(0,0,0,0.1)_0px_1px_2px_-1px] transition-all duration-300 hover:scale-[1.02] group cursor-pointer">
        <div className="relative p-2 sm:p-3 flex items-center justify-center" style={{ aspectRatio: "1/1" }}>
          {product.badges?.length > 0 && (
            <span className="absolute top-1.5 left-1.5 bg-[#FF6B6B] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
              {product.badges[0]}
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute top-1.5 right-1.5 bg-gray-800 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
              {t.outOfStock}
            </span>
          )}
          {product.images?.[0] ? (
            product.images[0].startsWith("http") || product.images[0].startsWith("/") ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-200" />
            ) : (
              <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-200">
                {product.images[0]}
              </span>
            )
          ) : (
            <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-200">📦</span>
          )}
        </div>
        <div className="p-2 sm:p-2.5 bg-white">
          <h3 className="text-[11px] sm:text-xs font-semibold text-[#364152] line-clamp-2 mb-1 sm:mb-1.5 min-h-[28px] sm:min-h-[32px] leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
          {(product._count?.reviews > 0 || avgRating > 0) && (
            <div className="flex items-center gap-1 mb-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={9} className={star <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-[9px] text-[#667085]">
                ({product._count?.reviews || 0})
              </span>
            </div>
          )}

          <div className="text-[9px] sm:text-[10px] text-[#00AFCC] mb-1 sm:mb-1.5 flex items-center gap-1">
            <span className="w-1 h-1 bg-[#00AFCC] rounded-full flex-shrink-0"></span>
            <span className="truncate">{t.fastDelivery} {product.deliveryTime || "1-2 hours"}</span>
          </div>

          <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
            {product.discountPrice ? (
              <>
                <span className="text-[#000000] font-bold text-xs sm:text-sm">৳{product.discountPrice}</span>
                <span className="text-[#667085] text-[10px] sm:text-xs line-through">৳{product.price}</span>
              </>
            ) : (
              <span className="text-[#000000] font-bold text-xs sm:text-sm">৳{product.price}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="btn-primary w-full py-1 sm:py-1.5 text-[10px] sm:text-[11px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={12} />
            {isOutOfStock ? t.outOfStock : t.addToCart}
          </button>
        </div>
      </div>
    </Link>
  );
}
