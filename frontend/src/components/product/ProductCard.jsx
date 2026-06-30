"use client";
import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { addToCart } from "@/redux/cartSlice";
import { ShoppingCart, Star, Pencil, Trash2, X } from "lucide-react";
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

  return (
    <>
      <Link href={`/product/${product.slug}`} className="block bg-[#f4f7fb] rounded-lg overflow-hidden hover:shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,rgba(0,0,0,0.1)_0px_1px_2px_-1px] transition-all duration-300 hover:scale-[1.02] group cursor-pointer">
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
          <h3 className="text-[11px] sm:text-xs font-semibold text-[#364152] line-clamp-2 mb-1 sm:mb-1.5 min-h-[28px] sm:min-h-[32px] leading-tight hover:text-[#EC008C] transition">
            {product.name}
          </h3>

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

          <div className="flex items-center gap-1 mb-1 sm:mb-1.5">
            {product.effectiveDiscountPrice || product.discountPrice ? (
              <>
                <span className="text-[#000000] font-bold text-xs sm:text-sm">৳{product.effectiveDiscountPrice || product.discountPrice}</span>
                <span className="text-[#667085] text-[10px] sm:text-xs line-through">৳{product.effectivePrice || product.price}</span>
              </>
            ) : (
              <span className="text-[#000000] font-bold text-xs sm:text-sm">৳{product.effectivePrice || product.price}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-[#667085] mb-1.5 sm:mb-2">
            {product.stock !== undefined && (
              <span className="flex items-center gap-0.5">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                Stock: {product.stock}
              </span>
            )}
            {product._count?.reviews > 0 && (
              <span className="flex items-center gap-0.5">
                <Star size={8} className="fill-yellow-400 text-yellow-400" />
                {product._count.reviews} reviews
              </span>
            )}
          </div>

          {showActions ? (
            <div className="space-y-1.5">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn-primary w-full py-1 sm:py-1.5 text-[10px] sm:text-[11px] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={12} />
                {isOutOfStock ? t.outOfStock : t.addToCart}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] sm:text-[11px] font-semibold bg-[#00215B] text-white rounded-md hover:bg-[#001A4A] transition"
                >
                  <Pencil size={11} /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] sm:text-[11px] font-semibold bg-red-50 text-red-500 border border-red-200 rounded-md hover:bg-red-100 transition"
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="btn-primary w-full py-1 sm:py-1.5 text-[10px] sm:text-[11px] disabled:opacity-40 disabled:cursor-not-allowed"
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
