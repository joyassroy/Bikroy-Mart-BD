"use client";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { t } = useLanguage();

  const handleAddToCart = () => {
    dispatch(addToCart({
      productId: product.id,
      name: product.name,
      price: product.dealPrice || product.price,
      image: product.images?.[0],
      quantity: 1,
    }));
    toast.success(t.addToCart);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group">
      <div className="relative bg-gray-50 p-5 flex items-center justify-center h-40">
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#C30000] text-white text-xs font-bold px-3 py-1 rounded-lg">
            {product.badge}
          </span>
        )}
        <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
          {product.images?.[0] || "📦"}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-base font-medium text-gray-800 line-clamp-2 mb-2 min-h-[48px]">
          {product.name}
        </h3>
        <div className="text-sm text-green-600 mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          {t.fastDelivery} {product.deliveryTime || "1-2 hours"}
        </div>
        <div className="flex items-center gap-2 mb-3">
          {product.dealPrice ? (
            <>
              <span className="text-[#0067A0] font-bold text-lg">৳{product.dealPrice}</span>
              <span className="text-gray-400 text-sm line-through">৳{product.price}</span>
            </>
          ) : (
            <span className="text-[#0067A0] font-bold text-lg">৳{product.price}</span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          className="btn-primary w-full text-sm py-2.5"
        >
          <ShoppingCart size={18} />
          {t.addToCart}
        </button>
      </div>
    </div>
  );
}
