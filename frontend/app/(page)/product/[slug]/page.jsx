"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { addProductRequest, removeProductRequest } from "@/redux/productRequestSlice";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DeliveryBanner from "@/components/layout/DeliveryBanner";
import ProductCard from "@/components/product/ProductCard";
import api from "@/lib/axios";
import { useLanguage } from "@/i18n/LanguageContext";
import useDistrict from "@/helper/useDistrict";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { ShoppingCart, Heart, Star, StarOff, ChevronRight, Minus, Plus, Truck, Shield, RotateCcw, Clock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { t, language } = useLanguage();
  const district = useDistrict();
  const productRequestItems = useSelector((state) => state.productRequests.items);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const catName = (cat) => cat ? (language === "bn" ? (cat.nameBn || cat.name) : cat.name) : "";

  const isInProductRequests = productRequestItems.some((i) => i.productId === product?.id);

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const districtParam = district ? `?district=${encodeURIComponent(district)}` : "";
      const res = await api.get(`/products/slug/${slug}${districtParam}`);
      const data = res.data.data;
      setProduct(data);

      if (data?.category?.slug) {
        const relatedDistrictParam = district ? `&district=${encodeURIComponent(district)}` : "";
        const relatedRes = await api.get(`/products?category=${data.category.slug}&limit=8${relatedDistrictParam}`);
        setRelatedProducts((relatedRes.data.data || []).filter((p) => p.id !== data.id).slice(0, 4));
      }
    } catch (err) {
      console.error(err);
      toast.error("Product not found");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const cartPrice = product.effectiveDiscountPrice || product.discountPrice || product.effectivePrice || product.price;
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart({
        productId: product.id,
        name: product.name,
        price: cartPrice,
        image: product.images?.[0],
        quantity: 1,
        endsAt: product.flashDealEndsAt || null,
      }));
    }
    toast.success(`${quantity} x ${product.name} added to cart`);
  };

  const handleProductRequest = () => {
    const requestPrice = product.effectiveDiscountPrice || product.discountPrice || product.effectivePrice || product.price;
    if (isInProductRequests) {
      dispatch(removeProductRequest(product.id));
      toast.success(t.removeFromWishlist);
    } else {
      dispatch(addProductRequest({
        productId: product.id,
        name: product.name,
        price: requestPrice,
        image: product.images?.[0],
      }));
      toast.success(t.addToWishlist);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!product) return;
    try {
      setSubmittingReview(true);
      await api.post("/reviews", {
        productId: product.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      toast.success(t.reviewSubmitted);
      setReviewForm({ rating: 5, comment: "" });
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, size = 14) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  const avgRating = product?.reviews?.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-[#EC008C]" size={32} />
        </div>
        <Footer />
        <DeliveryBanner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-sm text-[#667085] mb-2">Product not found</p>
            <Link href="/shop" className="text-xs text-[#EC008C] font-semibold hover:underline">{t.continueShopping}</Link>
          </div>
        </div>
        <Footer />
        <DeliveryBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[#667085] mb-3 sm:mb-4 overflow-x-auto">
          <Link href="/" className="hover:text-[#EC008C] whitespace-nowrap">{t.home}</Link>
          <ChevronRight size={10} />
          <Link href="/shop" className="hover:text-[#EC008C] whitespace-nowrap">{t.shop}</Link>
          <ChevronRight size={10} />
          {product.category && (
            <>
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#EC008C] whitespace-nowrap">{catName(product.category)}</Link>
              <ChevronRight size={10} />
            </>
          )}
          <span className="text-[#000000] truncate">{language === "bn" ? (product.nameBn || product.name) : product.name}</span>
        </nav>

        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Images */}
            <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#E5E7EB]">
              <div className="relative aspect-square bg-[#F9FAFB] rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                {product.badges?.length > 0 && (
                  <span className="absolute top-2 left-2 bg-[#FF6B6B] text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                    {product.badges[0]}
                  </span>
                )}
                {product.images?.[activeImage] ? (
                  product.images[activeImage].startsWith("http") || product.images[activeImage].startsWith("/") ? (
                    <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-contain p-4" />
                  ) : (
                    <span className="text-7xl sm:text-8xl">{product.images[activeImage]}</span>
                  )
                ) : (
                  <span className="text-7xl sm:text-8xl">📦</span>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-md border-2 flex-shrink-0 flex items-center justify-center bg-[#F9FAFB] ${
                        activeImage === i ? "border-[#EC008C]" : "border-[#E5E7EB] hover:border-[#EC008C]"
                      }`}
                    >
                      {img.startsWith("http") || img.startsWith("/") ? (
                        <img src={img} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-xl">{img}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 sm:p-6">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#000000] mb-2 leading-tight">{language === "bn" ? (product.nameBn || product.name) : product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                {renderStars(Math.round(avgRating))}
                <span className="text-[11px] text-[#667085]">
                  {avgRating.toFixed(1)} ({product._count?.reviews || 0} {t.reviews})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-3">
                {product.effectiveDiscountPrice || product.discountPrice ? (
                  <>
                    <span className="text-xl sm:text-2xl font-bold text-[#000000]">৳{product.effectiveDiscountPrice || product.discountPrice}</span>
                    <span className="text-sm text-[#667085] line-through">৳{product.effectivePrice || product.price}</span>
                    <span className="bg-[#FF6B6B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {Math.round((((product.effectivePrice || product.price) - (product.effectiveDiscountPrice || product.discountPrice)) / (product.effectivePrice || product.price)) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-[#000000]">৳{product.effectivePrice || product.price}</span>
                )}
              </div>

              {product.flashDealEndsAt && (
                <div className="mb-3">
                  <CountdownTimer endsAt={product.flashDealEndsAt} />
                </div>
              )}

              {/* Unit */}
              <p className="text-[11px] text-[#667085] mb-3">per {product.unit || "piece"}</p>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] text-[#667085]">{t.stock}:</span>
                {product.stock > 0 ? (
                  <span className="text-[11px] font-medium text-green-600">
                    {t.inStock} ({product.stock} {t.sold})
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-red-500">{t.outOfStock}</span>
                )}
              </div>

              {/* SKU & Category */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-[10px] sm:text-[11px] text-[#667085]">
                {product.sku && <span><span className="font-medium">{t.sku}:</span> {product.sku}</span>}
                {product.category && <span><span className="font-medium">{t.category}:</span> {catName(product.category)}</span>}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-[#E5E7EB] rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-[#F0F2F5] transition text-[#364152]"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-xs font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="p-2 hover:bg-[#F0F2F5] transition text-[#364152]"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-[11px] text-[#667085]">
                  {t.subtotal}: <span className="font-semibold text-[#000000]">৳{((product.effectiveDiscountPrice || product.discountPrice || product.effectivePrice || product.price) * quantity).toLocaleString()}</span>
                </span>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-[#EC008C] text-white py-2.5 rounded-md text-xs font-semibold hover:bg-[#D60071] transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={14} />
                  {t.addToCart}
                </button>
                <button
                  onClick={handleProductRequest}
                  className={`p-2.5 rounded-md border transition ${
                    isInProductRequests
                      ? "bg-[#FFF0F0] border-[#EC008C] text-[#EC008C]"
                      : "border-[#E5E7EB] text-[#667085] hover:border-[#EC008C] hover:text-[#EC008C]"
                  }`}
                >
                  {isInProductRequests ? <Heart size={16} className="fill-current" /> : <Heart size={16} />}
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E5E7EB]">
                <div className="flex flex-col items-center text-center gap-1">
                  <Truck size={16} className="text-[#00AFCC]" />
                  <span className="text-[9px] text-[#667085]">{t.fastDelivery}</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <Shield size={16} className="text-[#00215B]" />
                  <span className="text-[9px] text-[#667085]">{t.qualityAssurance}</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <RotateCcw size={16} className="text-[#EC008C]" />
                  <span className="text-[9px] text-[#667085]">{t.easyReturns}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="p-4 sm:p-6 border-t border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#000000] mb-2">{t.description}</h3>
              <p className="text-[11px] sm:text-xs text-[#667085] leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] mt-4 p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-[#000000] mb-4">{t.reviews} ({product._count?.reviews || 0})</h3>

          {/* Rating Summary */}
          {product.reviews?.length > 0 && (
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#E5E7EB]">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#000000]">{avgRating.toFixed(1)}</p>
                {renderStars(Math.round(avgRating), 16)}
                <p className="text-[10px] text-[#667085] mt-1">{product._count?.reviews} {t.customerReviews}</p>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = product.reviews.filter((r) => r.rating === star).length;
                  const pct = product.reviews.length > 0 ? (count / product.reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-[#667085] w-3">{star}</span>
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[9px] text-[#667085] w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review List */}
          <div className="space-y-3 mb-4">
            {product.reviews?.length > 0 ? (
              product.reviews.map((review) => (
                <div key={review.id} className="pb-3 border-b border-[#F4F7FB] last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-[#FCE8F3] flex items-center justify-center text-[10px] font-bold text-[#EC008C]">
                      {review.user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-[#000000]">{review.user?.name || "Anonymous"}</p>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating, 10)}
                        <span className="text-[9px] text-[#667085]">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-[11px] text-[#667085] ml-9 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-[11px] text-[#667085] text-center py-4">{t.noReviewsYet}</p>
            )}
          </div>

          {/* Write Review Form */}
          <div className="bg-[#F0F2F5] rounded-lg p-4">
            <h4 className="text-xs font-semibold text-[#000000] mb-3">{t.writeReview}</h4>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3">
                <label className="block text-[11px] text-[#667085] mb-1">{t.yourRating}</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      <Star
                        size={20}
                        className={star <= reviewForm.rating ? "fill-yellow-400 text-yellow-400 cursor-pointer" : "text-gray-300 cursor-pointer hover:text-yellow-400"}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder={t.yourReview + "..."}
                rows={3}
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[11px] focus:outline-none focus:border-[#EC008C] resize-none"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="mt-2 bg-[#EC008C] text-white px-4 py-2 rounded-md text-[11px] font-semibold hover:bg-[#D60071] transition disabled:opacity-50 flex items-center gap-2"
              >
                {submittingReview && <Loader2 size={12} className="animate-spin" />}
                {t.submitReview}
              </button>
            </form>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-6 mb-8">
            <h3 className="text-sm font-semibold text-[#000000] mb-3">{t.relatedProducts}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
      <DeliveryBanner />
    </div>
  );
}
