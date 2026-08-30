"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "@/redux/cartSlice";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { MessageSquare, CheckCircle, Copy, ExternalLink, Home, MapPin, Printer } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuthChecked } from "@/helper/AuthInit";
import { BANGLADESH_LOCATIONS, getUpazilas } from "@/lib/constants";
import dynamic from "next/dynamic";
const DeliveryMapPicker = dynamic(() => import("@/components/checkout/DeliveryMapPicker"), { ssr: false });
import FloatingChatButton from "@/components/layout/FloatingChatButton";
import { printInvoice } from "@/lib/generateInvoice";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.user.data);
  const reduxLocation = useSelector((state) => state.location);
  const { t } = useLanguage();
  const { authChecked } = useAuthChecked();
  const [showCustomReq, setShowCustomReq] = useState(false);
  const [customRequirement, setCustomRequirement] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState("");
  const [placedOrderData, setPlacedOrderData] = useState(null);
  const [form, setForm] = useState({
    name: "", phone: "", address: "", division: reduxLocation.division || "Dhaka", district: reduxLocation.district || "Dhaka", upazila: "",
    paymentMethod: "COD",
  });
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [deliveryCoords, setDeliveryCoords] = useState({ latitude: null, longitude: null });

  const handleLocationDetected = (location) => {
    setForm((prev) => ({
      ...prev,
      division: location.division || prev.division,
      district: location.district || prev.district,
      upazila: location.upazila || prev.upazila,
    }));
  };

  useEffect(() => {
    const div = BANGLADESH_LOCATIONS.find((d) => d.division === form.division);
    setDistricts(div ? div.districts.map((d) => d.name) : []);
  }, [form.division]);

  useEffect(() => {
    const ups = getUpazilas(form.division, form.district);
    setUpazilas(ups);
  }, [form.division, form.district]);

  useEffect(() => {
    if (authChecked && (!user || !localStorage.getItem("bm-token"))) {
      toast.error("Please sign in to place an order");
      router.push("/signin");
    }
  }, [authChecked, user, router]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
      }));
      api.get("/addresses").then((res) => setSavedAddresses(res.data.data || [])).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (selectedAddressId) {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        setForm((prev) => ({
          ...prev,
          name: addr.name,
          phone: addr.phone,
          division: addr.division,
          district: addr.district,
          upazila: addr.upazila,
          address: addr.fullAddress,
        }));
      }
    }
  }, [selectedAddressId, savedAddresses]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isShariatpur = form.district === "Shariatpur";
  const isRangpur = form.division === "Rangpur";
  const districtCharge = isShariatpur ? 20 : isRangpur ? 60 : 150;
  const deliveryCharge = subtotal >= 1500 ? 0 : districtCharge;
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
        deliveryLatitude: deliveryCoords.latitude || undefined,
        deliveryLongitude: deliveryCoords.longitude || undefined,
        customRequirement: customRequirement || undefined,
      };
      const res = await api.post("/orders", orderData);
      dispatch(clearCart());
      setPlacedOrderNumber(res.data.data.orderNumber);
      setPlacedOrderData({
        orderNumber: res.data.data.orderNumber,
        items: cartItems,
        subtotal,
        deliveryCharge,
        total,
        name: form.name,
        phone: form.phone,
        address: form.address,
        district: form.district,
        division: form.division,
        upazila: form.upazila,
        paymentMethod: form.paymentMethod,
        paymentStatus: res.data.data.paymentStatus || "PENDING",
        transactionId: res.data.data.transactionId || "",
        estimatedDelivery: res.data.data.estimatedDelivery || null,
        createdAt: res.data.data.createdAt,
        date: new Date().toLocaleDateString("en-BD"),
      });
      setShowOrderSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingId = () => {
    navigator.clipboard.writeText(placedOrderNumber);
    toast.success("Tracking ID copied!");
  };

  const handlePrintInvoice = async (lang = "en") => {
    if (!placedOrderData) return;
    printInvoice(placedOrderData, lang);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B] mb-2 sm:mb-3">{t.checkoutTitle}</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 space-y-2.5 sm:space-y-3">
            {savedAddresses.length > 0 && (
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
                <label className="block text-xs sm:text-sm font-semibold text-[#364152] mb-1">{t.selectAddress}</label>
                <select value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)} className="input-field">
                  <option value="">{t.fillManually}</option>
                  {savedAddresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.name} - {addr.fullAddress}{addr.isDefault ? " (Default)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
              <h2 className="font-semibold text-[#000000] text-base sm:text-lg mb-2 sm:mb-3">{t.deliveryInformation}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#364152] mb-1">{t.fullName}</label>
                  <input type="text" placeholder={t.fullName} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#364152] mb-1">{t.phoneNumber}</label>
                  <input type="tel" placeholder={t.phoneNumber} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#364152] mb-1">Division</label>
                  <select
                    value={form.division}
                    onChange={(e) => setForm({ ...form, division: e.target.value, district: "", upazila: "" })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Division</option>
                    {BANGLADESH_LOCATIONS.map((d) => (
                      <option key={d.division} value={d.division}>{d.division}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#364152] mb-1">District</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value, upazila: "" })}
                    className="input-field"
                    required
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#364152] mb-1">Upazila</label>
                  <select
                    value={form.upazila}
                    onChange={(e) => setForm({ ...form, upazila: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Upazila</option>
                    {upazilas.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-2 sm:mt-2.5">
                <label className="block text-xs sm:text-sm font-semibold text-[#364152] mb-1">{t.apartment}</label>
                <textarea placeholder={t.apartment} required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field !h-auto min-h-[70px]" />
              </div>
              <DeliveryMapPicker coords={deliveryCoords} onCoordsChange={setDeliveryCoords} onLocationDetected={handleLocationDetected} />
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
              <button type="button" onClick={() => setShowCustomReq(!showCustomReq)} className="flex items-center gap-1.5 text-[#EC008C] hover:text-[#D60071] font-semibold text-xs sm:text-sm transition">
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
              <h2 className="font-semibold text-[#000000] text-base sm:text-lg mb-2 sm:mb-3">{t.paymentMethod}</h2>
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
            <h2 className="font-semibold text-[#000000] text-base sm:text-lg mb-2 sm:mb-3">{t.orderSummary}</h2>
            <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3 max-h-32 sm:max-h-40 overflow-auto">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between text-[11px] sm:text-xs">
                  <span className="text-[#667085] truncate mr-2">{item.name} x {item.quantity}</span>
                  <span className="font-medium text-[#000000] whitespace-nowrap">৳{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm border-t border-[#E5E7EB] pt-2">
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

      {showOrderSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{t.orderPlacedSuccessfully}</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-4">{t.orderConfirmedMsg}</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">{t.yourTrackingId}</p>
              <p className="text-lg sm:text-xl font-mono font-bold text-[#00215B] tracking-wider">{placedOrderNumber}</p>
            </div>

            <button onClick={copyTrackingId} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-base sm:text-lg font-medium text-gray-700 transition mb-3">
              <Copy size={16} />
              {t.copyTrackingId}
            </button>

            <div className="flex gap-2 mb-3">
              <button onClick={() => handlePrintInvoice("en")} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-[#E5E7EB] hover:bg-[#F4F7FB] rounded-xl text-base sm:text-lg font-medium text-[#364152] transition">
                <Printer size={16} />
                {t.printInvoice} (EN)
              </button>
              <button onClick={() => handlePrintInvoice("bn")} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-[#E5E7EB] hover:bg-[#F4F7FB] rounded-xl text-base sm:text-lg font-medium text-[#364152] transition">
                <Printer size={16} />
                {t.printInvoice} (BN)
              </button>
            </div>

            <button onClick={() => router.push(`/track-order?order=${placedOrderNumber}`)} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#EC008C] hover:bg-[#D60071] rounded-xl text-base sm:text-lg font-semibold text-white transition mb-3">
              <ExternalLink size={16} />
              {t.trackYourOrder}
            </button>

            <button onClick={() => router.push("/")} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#00215B] hover:bg-[#001845] rounded-xl text-base sm:text-lg font-semibold text-white transition">
              <Home size={16} />
              {t.continueShopping}
            </button>
          </div>
        </div>
      )}

      <FloatingChatButton />
      <Footer />
    </div>
  );
}
