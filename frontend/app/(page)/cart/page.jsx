"use client";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQuantity, clearCart } from "@/redux/cartSlice";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import FloatingChatButton from "@/components/layout/FloatingChatButton";

export default function CartPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const { t } = useLanguage();

  const reduxLocation = useSelector((state) => state.location);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isShariatpur = reduxLocation?.district === "Shariatpur";
  const isRangpur = reduxLocation?.division === "Rangpur";
  const districtCharge = isShariatpur ? 20 : isRangpur ? 60 : 150;
  const deliveryCharge = subtotal >= 1500 ? 0 : districtCharge;
  const total = subtotal + deliveryCharge;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B] mb-2 sm:mb-3">{t.shoppingCart}</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-lg border border-[#E5E7EB] shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px]">
            <ShoppingBag size={36} className="mx-auto text-[#E5E7EB] mb-2" />
            <p className="text-xs sm:text-sm text-[#667085] mb-3">{t.cartEmpty}</p>
            <Link href="/shop" className="btn-primary">{t.continueShopping}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="lg:col-span-2 space-y-2">
              {cartItems.map((item) => (
                <div key={item.productId} className="bg-white rounded-lg p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg border border-[#E5E7EB] overflow-hidden bg-gray-50">
                    {item.image && item.image.startsWith("http") ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-2xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#000000] text-sm sm:text-base truncate">{item.name}</h3>
                    <p className="text-[#000000] font-bold text-sm sm:text-base mt-0.5">৳{item.price}</p>
                    {item.endsAt && (
                      <div className="mt-1">
                        <CountdownTimer endsAt={item.endsAt} compact />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) }))}
                      className="w-7 h-7 sm:w-8 sm:h-8 border border-[#E5E7EB] rounded-md flex items-center justify-center hover:bg-[#F4F7FB] transition"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 sm:w-6 text-center font-semibold text-xs sm:text-sm">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                      className="w-7 h-7 sm:w-8 sm:h-8 border border-[#E5E7EB] rounded-md flex items-center justify-center hover:bg-[#F4F7FB] transition"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="text-[#FF6B6B] hover:text-[#FF6B6B] p-1 sm:p-1.5 rounded-md hover:bg-[#FFF0F0] transition flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button onClick={() => dispatch(clearCart())} className="text-xs sm:text-sm text-[#FF6B6B] hover:text-[#FF6B6B] font-semibold">
                {t.emptyCart}
              </button>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] h-fit lg:sticky lg:top-20">
              <h2 className="font-semibold text-[#000000] text-base sm:text-lg mb-2 sm:mb-3">{t.orderSummary}</h2>
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between"><span className="text-[#667085]">{t.subtotal}</span><span>৳{subtotal}</span></div>
                <div className="flex justify-between"><span className="text-[#667085]">{t.shipping}</span><span>{deliveryCharge === 0 ? t.free : `৳${deliveryCharge}`}</span></div>
                <hr className="border-[#E5E7EB]" />
                <div className="flex justify-between font-bold text-sm sm:text-base"><span>{t.total}</span><span className="text-[#000000]">৳{total}</span></div>
              </div>
              {subtotal < 1500 && (
                <p className="text-xs sm:text-sm text-[#00AFCC] mt-2 font-semibold">Add ৳{1500 - subtotal} more for free delivery</p>
              )}
              <Link href="/checkout" className="btn-primary w-full text-center mt-3 block">
                {t.proceedToCheckout}
              </Link>
            </div>
          </div>
        )}
      </main>
      <FloatingChatButton />
      <Footer />
    </div>
  );
}
