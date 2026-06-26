"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "@/redux/cartSlice";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.user.data);
  const { t } = useLanguage();
  const [showCustomReq, setShowCustomReq] = useState(false);
  const [customRequirement, setCustomRequirement] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", address: "", division: "Dhaka", district: "Dhaka", upazila: "",
    paymentMethod: "COD",
  });

  useEffect(() => {
    const token = localStorage.getItem("bm-token");
    if (!user || !token) {
      toast.error("Please sign in to place an order");
      router.push("/signin");
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = subtotal >= 1500 ? 0 : 60;
  const total = subtotal + deliveryCharge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error("Cart is empty");
    const token = localStorage.getItem("bm-token");
    if (!token || !user) {
      toast.error("Please sign in to place an order");
      router.push("/signin");
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        subtotal, deliveryCharge, total,
        paymentMethod: form.paymentMethod,
        deliveryAddress: form.address,
        deliveryDivision: form.division,
        deliveryDistrict: form.district,
        deliveryUpazila: form.upazila,
        customRequirement: customRequirement || undefined,
      };
      const res = await api.post("/orders", orderData);
      dispatch(clearCart());
      toast.success("Order placed successfully!");
      router.push(`/track-order?order=${res.data.data.orderNumber}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B] mb-2 sm:mb-3">{t.checkoutTitle}</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 space-y-2.5 sm:space-y-3">
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
              <h2 className="font-semibold text-[#000000] text-xs sm:text-sm mb-2 sm:mb-3">{t.deliveryInformation}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-semibold text-[#364152] mb-1">{t.fullName}</label>
                  <input type="text" placeholder={t.fullName} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-semibold text-[#364152] mb-1">{t.phoneNumber}</label>
                  <input type="tel" placeholder={t.phoneNumber} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-semibold text-[#364152] mb-1">{t.selectArea}</label>
                  <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="input-field">
                    <option>Dhaka</option>
                    <option>Gazipur</option>
                    <option>Narayanganj</option>
                    <option>Chattogram</option>
                    <option>Sylhet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-semibold text-[#364152] mb-1">{t.houseStreet}</label>
                  <input type="text" placeholder={t.houseStreet} value={form.upazila} onChange={(e) => setForm({ ...form, upazila: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="mt-2 sm:mt-2.5">
                <label className="block text-[10px] sm:text-[11px] font-semibold text-[#364152] mb-1">{t.apartment}</label>
                <textarea placeholder={t.apartment} required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field !h-auto min-h-[70px]" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
              <button type="button" onClick={() => setShowCustomReq(!showCustomReq)} className="flex items-center gap-1.5 text-[#EC008C] hover:text-[#D60071] font-semibold text-[11px] sm:text-xs transition">
                <MessageSquare size={14} />
                {showCustomReq ? "Hide" : "Add"} {t.orderNote}
              </button>
              {showCustomReq && (
                <div className="mt-2.5">
                  <textarea placeholder={t.orderNotePlaceholder} rows={3} value={customRequirement} onChange={(e) => setCustomRequirement(e.target.value)} className="input-field !h-auto min-h-[70px]" />
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
              <h2 className="font-semibold text-[#000000] text-xs sm:text-sm mb-2 sm:mb-3">{t.paymentMethod}</h2>
              <div className="space-y-1.5 sm:space-y-2">
                {[
                  { value: "COD", label: t.codNote, icon: "💵" },
                  { value: "SSLCOMMERZ", label: t.onlinePayment, icon: "💳" },
                ].map((method) => (
                  <label key={method.value} className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 border border-[#E5E7EB] rounded-md cursor-pointer hover:bg-[#F4F7FB] transition">
                    <input type="radio" name="payment" value={method.value} checked={form.paymentMethod === method.value} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-3 h-3 accent-[#EC008C]" />
                    <span className="text-sm">{method.icon}</span>
                    <span className="text-[11px] sm:text-xs text-[#364152]">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] h-fit lg:sticky lg:top-20">
            <h2 className="font-semibold text-[#000000] text-xs sm:text-sm mb-2 sm:mb-3">{t.orderSummary}</h2>
            <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3 max-h-32 sm:max-h-40 overflow-auto">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between text-[11px] sm:text-xs">
                  <span className="text-[#667085] truncate mr-2">{item.name} x {item.quantity}</span>
                  <span className="font-medium text-[#000000] whitespace-nowrap">৳{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs border-t border-[#E5E7EB] pt-2">
              <div className="flex justify-between"><span className="text-[#667085]">{t.subtotal}</span><span>৳{subtotal}</span></div>
              <div className="flex justify-between"><span className="text-[#667085]">{t.deliveryFee}</span><span>{deliveryCharge === 0 ? t.free : `৳${deliveryCharge}`}</span></div>
              <hr className="border-[#E5E7EB]" />
              <div className="flex justify-between font-bold text-sm sm:text-base"><span>{t.total}</span><span className="text-[#000000]">৳{total}</span></div>
            </div>
            <button type="submit" disabled={loading || cartItems.length === 0} className="btn-primary w-full mt-3">
              {loading ? t.loading : t.placeOrderBtn}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
