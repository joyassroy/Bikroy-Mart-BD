"use client";
import { useState } from "react";
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
  const { t } = useLanguage();
  const [showCustomReq, setShowCustomReq] = useState(false);
  const [customRequirement, setCustomRequirement] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", address: "", division: "Dhaka", district: "Dhaka", upazila: "",
    paymentMethod: "COD",
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = subtotal >= 1500 ? 0 : 60;
  const total = subtotal + deliveryCharge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error("Cart is empty");
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{t.checkoutTitle}</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 text-base mb-3">{t.deliveryInformation}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.fullName}</label>
                  <input type="text" placeholder={t.fullName} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.phoneNumber}</label>
                  <input type="tel" placeholder={t.phoneNumber} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.selectArea}</label>
                  <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="input-field">
                    <option>Dhaka</option>
                    <option>Gazipur</option>
                    <option>Narayanganj</option>
                    <option>Chattogram</option>
                    <option>Sylhet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.houseStreet}</label>
                  <input type="text" placeholder={t.houseStreet} value={form.upazila} onChange={(e) => setForm({ ...form, upazila: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t.apartment}</label>
                <textarea placeholder={t.apartment} required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <button type="button" onClick={() => setShowCustomReq(!showCustomReq)} className="flex items-center gap-2 text-[#0067A0] hover:text-[#005090] font-semibold text-sm transition">
                <MessageSquare size={20} />
                {showCustomReq ? "Hide" : "Add"} {t.orderNote}
              </button>
              {showCustomReq && (
                <div className="mt-4">
                  <textarea placeholder={t.orderNotePlaceholder} rows={3} value={customRequirement} onChange={(e) => setCustomRequirement(e.target.value)} className="input-field" />
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 text-base mb-3">{t.paymentMethod}</h2>
              <div className="space-y-2">
                {[
                  { value: "COD", label: t.codNote, icon: "💵" },
                  { value: "SSLCOMMERZ", label: t.onlinePayment, icon: "💳" },
                ].map((method) => (
                  <label key={method.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                    <input type="radio" name="payment" value={method.value} checked={form.paymentMethod === method.value} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-4 h-4 accent-[#0067A0]" />
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm text-gray-800">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-fit">
            <h2 className="font-semibold text-gray-900 text-base mb-3">{t.orderSummary}</h2>
            <div className="space-y-2 mb-3 max-h-48 overflow-auto">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-500 truncate mr-2">{item.name} x {item.quantity}</span>
                  <span className="font-medium text-gray-900 whitespace-nowrap">৳{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-gray-200 pt-3">
              <div className="flex justify-between"><span className="text-gray-500">{t.subtotal}</span><span>৳{subtotal}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{t.deliveryFee}</span><span>{deliveryCharge === 0 ? t.free : `৳${deliveryCharge}`}</span></div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-lg"><span>{t.total}</span><span className="text-[#0067A0]">৳{total}</span></div>
            </div>
            <button type="submit" disabled={loading || cartItems.length === 0} className="btn-primary w-full mt-4">
              {loading ? t.loading : t.placeOrderBtn}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
