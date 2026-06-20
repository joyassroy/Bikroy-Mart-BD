"use client";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQuantity, clearCart } from "@/redux/cartSlice";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CartPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const { t } = useLanguage();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = subtotal >= 1500 ? 0 : 60;
  const total = subtotal + deliveryCharge;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{t.shoppingCart}</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-base text-gray-500 mb-4">{t.cartEmpty}</p>
            <Link href="/shop" className="btn-primary">{t.continueShopping}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => (
                <div key={item.productId} className="bg-white rounded-xl p-3 flex items-center gap-4 shadow-sm border border-gray-100">
                  <span className="text-3xl">{item.image || "📦"}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                    <p className="text-[#0067A0] font-bold text-base mt-1">৳{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) }))}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold text-base">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button onClick={() => dispatch(clearCart())} className="text-sm text-red-500 hover:text-red-600 font-medium">
                {t.emptyCart}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-fit">
              <h2 className="font-semibold text-gray-900 text-base mb-3">{t.orderSummary}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">{t.subtotal}</span><span>৳{subtotal}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t.shipping}</span><span>{deliveryCharge === 0 ? t.free : `৳${deliveryCharge}`}</span></div>
                <hr className="border-gray-200" />
                <div className="flex justify-between font-bold text-xl"><span>{t.total}</span><span className="text-[#0067A0]">৳{total}</span></div>
              </div>
              {subtotal < 1500 && (
                <p className="text-sm text-green-600 mt-3">Add ৳{1500 - subtotal} more for free delivery</p>
              )}
              <Link href="/checkout" className="btn-primary w-full text-center mt-4 block">
                {t.proceedToCheckout}
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
