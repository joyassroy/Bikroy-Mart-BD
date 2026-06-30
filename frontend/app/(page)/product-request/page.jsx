"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { removeProductRequest } from "@/redux/productRequestSlice";
import { addToCart } from "@/redux/cartSlice";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import api from "@/lib/axios";
import { useLanguage } from "@/i18n/LanguageContext";
import { Heart, ShoppingCart, Trash2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductRequestPage() {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const productRequestItems = useSelector((state) => state.productRequests.items);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [productRequestItems]);

  const fetchProducts = async () => {
    if (productRequestItems.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const productIds = productRequestItems.map((item) => item.productId);
      const fetchedProducts = [];

      for (const id of productIds) {
        try {
          const res = await api.get(`/products/${id}`);
          if (res.data.data) {
            fetchedProducts.push(res.data.data);
          }
        } catch {
          // Product may have been deleted, skip it
        }
      }

      setProducts(fetchedProducts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeProductRequest(productId));
    toast.success(t.removeFromWishlist);
  };

  const handleAddToCart = (product) => {
    const cartPrice = product.effectiveDiscountPrice || product.discountPrice || product.effectivePrice || product.price;
    dispatch(addToCart({
      productId: product.id,
      name: product.name,
      price: cartPrice,
      image: product.images?.[0],
      quantity: 1,
    }));
    toast.success(t.addToCart);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={18} className="text-[#EC008C]" />
          <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B]">{t.customRequest}</h1>
          <span className="text-[11px] text-[#667085]">({productRequestItems.length})</span>
        </div>

        {productRequestItems.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] p-8 sm:p-12 text-center">
            <Heart size={48} className="mx-auto text-[#E5E7EB] mb-3" />
            <p className="text-sm font-medium text-[#000000] mb-1">{t.wishlistEmpty}</p>
            <p className="text-[11px] text-[#667085] mb-4">{t.wishlistEmptyDesc}</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#EC008C] text-white px-5 py-2.5 rounded-md text-xs font-semibold hover:bg-[#D60071] transition"
            >
              <ShoppingBag size={14} />
              {t.shopNow}
            </Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#E5E7EB] rounded-lg h-48 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {products.map((product) => {
              const isOutOfStock = product.stock <= 0;
              return (
                <div key={product.id} className="bg-white rounded-lg border border-[#E5E7EB] shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] overflow-hidden group">
                  <Link href={`/product/${product.slug}`}>
                    <div className="relative p-3 flex items-center justify-center aspect-square bg-[#F9FAFB]">
                      {product.badges?.length > 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-[#FF6B6B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
                          {product.badges[0]}
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(product.id); }}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/80 hover:bg-white text-[#EC008C] shadow-sm transition z-10"
                      >
                        <Trash2 size={12} />
                      </button>
                      {product.images?.[0] ? (
                        product.images[0].startsWith("http") || product.images[0].startsWith("/") ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200" />
                        ) : (
                          <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{product.images[0]}</span>
                        )
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                    </div>
                  </Link>

                  <div className="p-2.5">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="text-[11px] sm:text-xs font-semibold text-[#364152] line-clamp-2 mb-1 leading-tight hover:text-[#EC008C] transition">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="text-[9px] sm:text-[10px] text-[#00AFCC] mb-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-[#00AFCC] rounded-full flex-shrink-0"></span>
                      <span className="truncate">{product.deliveryTime || "1-2 hours"}</span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                        {product.effectiveDiscountPrice || product.discountPrice ? (
                          <>
                            <span className="text-[#000000] font-bold text-xs sm:text-sm">৳{product.effectiveDiscountPrice || product.discountPrice}</span>
                            <span className="text-[#667085] text-[10px] line-through">৳{product.effectivePrice || product.price}</span>
                          </>
                        ) : (
                          <span className="text-[#000000] font-bold text-xs sm:text-sm">৳{product.effectivePrice || product.price}</span>
                        )}
                    </div>

                    {isOutOfStock ? (
                      <button disabled className="w-full py-1.5 text-[10px] sm:text-[11px] font-semibold bg-gray-200 text-gray-500 rounded cursor-not-allowed">
                        {t.outOfStock}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn-primary w-full py-1.5 text-[10px] sm:text-[11px]"
                      >
                        <ShoppingCart size={11} />
                        {t.addToCart}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
