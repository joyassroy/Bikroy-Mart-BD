"use client";
import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { addToCart } from "@/redux/cartSlice";
import { ShoppingCart, Star, Pencil, Trash2, X, Flame, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import EditProductModal from "./EditProductModal";

function DeleteModal({ product, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-5 z-10">
        <button onClick={onCancel} className="absolute top-3 right-3 p-1 rounded-md hover:bg-gray-100 transition text-[#667085]">
          <X size={16} />
        </button>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <h3 className="text-sm font-semibold text-[#000000] mb-1">Delete Product</h3>
          <p className="text-xs text-[#667085] mb-4">
            Are you sure you want to delete <span className="font-medium text-[#000000]">{product.name}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button onClick={onCancel} className="flex-1 px-4 py-2 text-xs font-semibold border border-[#E5E7EB] rounded-lg text-[#364152] hover:bg-[#F4F7FB] transition">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product, showActions, onDelete, onProductUpdated }) {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const cartPrice = product.effectiveDiscountPrice || product.discountPrice || product.effectivePrice || product.price;
    dispatch(addToCart({
      productId: product.id,
      name: product.name,
      price: cartPrice,
      image: product.images?.[0],
      quantity: 1,
    }));
    toast.success(t.addToCart);
  }, [dispatch, product, t]);

  const handleDelete = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  }, []);

  const handleEdit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditModal(true);
  }, []);

  const confirmDelete = useCallback(() => {
    setShowDeleteModal(false);
    onDelete?.(product.id);
  }, [onDelete, product.id]);

  const avgRating = product._count?.reviews > 0
    ? (product.reviews?.reduce?.((sum, r) => sum + r.rating, 0) / product.reviews.length) || 0
    : 0;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const originalPrice = product.effectivePrice || product.price;
  const salePrice = product.effectiveDiscountPrice || product.discountPrice;
  const hasDiscount = salePrice && originalPrice && salePrice < originalPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;
  const savings = hasDiscount ? Math.round(originalPrice - salePrice) : 0;
  const isTrending = (product.totalSales || 0) >= 5;

  return (
    <>
      <Link href={`/product/${product.slug}`} className="block bg-white rounded-xl overflow-hidden border border-[#E5E7EB] hover:border-[#EC008C]/30 hover:shadow-[0_8px_30px_rgba(236,0,140,0.12)] transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
        {/* Image Section */}
        <div className="relative bg-gradient-to-b from-[#F9FAFB] to-[#F4F7FB] flex items-center justify-center overflow-hidden" style={{ aspectRatio: "1/1" }}>
          {hasDiscount && discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF4757] text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg z-10 shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {isTrending && (
            <span className="absolute top-2 right-2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-lg z-10 flex items-center gap-0.5 shadow-sm">
              <Flame size={10} /> HOT
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute top-2 right-2 bg-gray-800/90 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-lg z-10">
              {t.outOfStock}
            </span>
          )}
          {product.images?.[0] && !imgError ? (
            product.images[0].startsWith("http") || product.images[0].startsWith("/") ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-[65%] h-[65%] object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                {product.images[0]}
              </span>
            )
          ) : (
            <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">📦</span>
          )}
        </div>

        {/* Info Section */}
        <div className="p-2.5 sm:p-3 space-y-1.5">
          {/* Row 1: Product Name */}
          <h3 className="text-[11px] sm:text-xs font-semibold text-[#364152] line-clamp-2 min-h-[28px] sm:min-h-[32px] leading-tight group-hover:text-[#EC008C] transition-colors">
            {product.name}
          </h3>

          {/* Row 2: Rating + Sold + Stock — all inline */}
          <div className="flex items-center gap-1 flex-wrap">
            {(product._count?.reviews > 0 || avgRating > 0) && (
              <span className="inline-flex items-center gap-0.5 bg-[#FFFBEB] px-1.5 py-0.5 rounded-md">
                <Star size={9} className="fill-[#F59E0B] text-[#F59E0B]" />
                <span className="text-[9px] font-bold text-[#92400E]">{avgRating.toFixed(1)}</span>
                <span className="text-[8px] text-[#92400E]/60">({product._count?.reviews || 0})</span>
              </span>
            )}
            {product.totalSales > 0 && (
              <span className="inline-flex items-center gap-0.5 bg-[#FFF7ED] text-[#C2410C] px-1.5 py-0.5 rounded-md">
                <Flame size={8} className="text-[#F97316]" />
                <span className="text-[9px] font-medium">{product.totalSales} sold</span>
              </span>
            )}
            {product.stock !== undefined && product.stock > 0 && product.stock <= 10 && (
              <span className="inline-flex items-center bg-[#FEF2F2] text-[#DC2626] px-1.5 py-0.5 rounded-md">
                <span className="text-[9px] font-medium">Only {product.stock} left</span>
              </span>
            )}
          </div>

          {/* Row 3: Price + Discount badge — all inline */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {hasDiscount ? (
              <>
                <span className="text-[#EC008C] font-extrabold text-sm sm:text-base leading-none">৳{salePrice}</span>
                <span className="text-[#99A0B4] text-[10px] line-through">৳{originalPrice}</span>
                <span className="text-[8px] font-bold text-white bg-gradient-to-r from-[#FF6B6B] to-[#FF4757] px-1.5 py-0.5 rounded-md leading-none">
                  -{discountPercent}%
                </span>
              </>
            ) : (
              <span className="text-[#000000] font-extrabold text-sm sm:text-base leading-none">৳{originalPrice}</span>
            )}
          </div>

          {/* Row 4: Save amount */}
          {hasDiscount && savings > 0 && (
            <p className="text-[9px] text-[#16A34A] font-semibold flex items-center gap-0.5">
              <TrendingUp size={9} />
              Save ৳{savings}
            </p>
          )}

          {/* Row 5: Cart Button */}
          {showActions ? (
            <div className="flex gap-1.5 pt-0.5">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-bold text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[#EC008C] to-[#D60071] hover:from-[#D60071] hover:to-[#B80060] shadow-[0_2px_8px_rgba(236,0,140,0.3)]"
              >
                <ShoppingCart size={12} />
                {isOutOfStock ? t.outOfStock : t.addToCart}
              </button>
              <button onClick={handleEdit} className="p-1.5 text-white bg-[#00215B] rounded-lg hover:bg-[#001A4A] transition">
                <Pencil size={11} />
              </button>
              <button onClick={handleDelete} className="p-1.5 text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition">
                <Trash2 size={11} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-bold text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[#EC008C] to-[#D60071] hover:from-[#D60071] hover:to-[#B80060] shadow-[0_2px_8px_rgba(236,0,140,0.3)] pt-0.5"
            >
              <ShoppingCart size={12} />
              {isOutOfStock ? t.outOfStock : t.addToCart}
            </button>
          )}
        </div>
      </Link>

      {showDeleteModal && (
        <DeleteModal product={product} onConfirm={confirmDelete} onCancel={() => setShowDeleteModal(false)} />
      )}
      {showEditModal && (
        <EditProductModal
          productId={product.id}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => onProductUpdated?.()}
        />
      )}
    </>
  );
}
