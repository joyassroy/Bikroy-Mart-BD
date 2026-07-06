"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { ShoppingCart, X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { updateQuantity, removeFromCart } from "@/redux/cartSlice";
import { useLanguage } from "@/i18n/LanguageContext";

export default function FloatingCartButton() {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state) => state.cart.items);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cartCount = mounted ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const subtotal = mounted ? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-3.5 top-1/2 z-40 -translate-y-1/2 text-xs font-medium leading-none text-white transition-all duration-300 ease-linear hover:scale-105"
      >
        <span className="relative flex items-center justify-center gap-1.5 rounded-t-[5px] bg-[#00215B] px-3 pb-1.5 pt-6">
          <ShoppingCart size={16} className="absolute top-1.5 left-1/2 -translate-x-1/2" />
          {cartCount} {t.itemsCount}
        </span>
        <span className="relative block rounded-b-[5px] bg-black px-3 py-1.5">
          ৳{subtotal.toLocaleString()}
        </span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[400px] bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[#00215B]" />
            <h2 className="font-semibold text-sm text-[#000000]">{t.myCart}</h2>
            <span className="bg-[#EC008C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F4F7FB] transition"
          >
            <X size={18} className="text-[#667085]" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-[#F4F7FB] flex items-center justify-center mb-3">
                <ShoppingBag size={28} className="text-[#D0D5DD]" />
              </div>
              <p className="text-sm font-medium text-[#667085]">{t.cartEmpty}</p>
              <p className="text-[11px] text-[#D0D5DD] mt-1">{t.cartEmptyDesc}</p>
              <button
                onClick={() => { setOpen(false); router.push("/shop"); }}
                className="btn-primary mt-4 text-xs"
              >
                {t.browseProducts}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E5E7EB] bg-white"
                >
                  <div className="w-14 h-14 flex-shrink-0 rounded-lg border border-[#E5E7EB] overflow-hidden bg-gray-50">
                    {item.image && item.image.startsWith("http") ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#000000] text-[11px] truncate">{item.name}</h3>
                    <p className="text-[#000000] font-bold text-xs mt-0.5">৳{item.price}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        onClick={() =>
                          dispatch(updateQuantity({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) }))
                        }
                        className="w-6 h-6 border border-[#E5E7EB] rounded flex items-center justify-center hover:bg-[#F4F7FB] transition"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="w-5 text-center font-semibold text-[11px]">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))
                        }
                        className="w-6 h-6 border border-[#E5E7EB] rounded flex items-center justify-center hover:bg-[#F4F7FB] transition"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <p className="font-bold text-xs text-[#000000]">৳{(item.price * item.quantity).toLocaleString()}</p>
                    <button
                      onClick={() => dispatch(removeFromCart(item.productId))}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#FF6B6B] hover:bg-[#FFF0F0] transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-[#E5E7EB] px-5 py-4 space-y-3 bg-white">
            {subtotal < 1500 && (
              <p className="text-[10px] text-[#00AFCC] font-semibold text-center">
                {t.addMoreForFreeDelivery.replace("{amount}", `৳${(1500 - subtotal).toLocaleString()}`)}
              </p>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#667085]">{t.subtotal}</span>
              <span className="font-bold text-sm text-[#000000]">৳{subtotal.toLocaleString()}</span>
            </div>
            <button
              onClick={() => { setOpen(false); router.push("/checkout"); }}
              className="btn-primary w-full text-center"
            >
              {t.proceedToCheckout}
            </button>
            <button
              onClick={() => { setOpen(false); router.push("/cart"); }}
              className="btn-secondary w-full text-center"
            >
              {t.viewFullCart}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
