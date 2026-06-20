"use client";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import api from "@/lib/axios";
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const statusSteps = [
    { key: "PENDING", label: t.orderPlaced, icon: Package },
    { key: "CONFIRMED", label: t.confirmed, icon: CheckCircle },
    { key: "PROCESSING", label: t.processing, icon: Clock },
    { key: "SHIPPED", label: t.shipped, icon: Truck },
    { key: "OUT_FOR_DELIVERY", label: t.outForDelivery, icon: MapPin },
    { key: "DELIVERED", label: t.delivered, icon: CheckCircle },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/tracking/${orderNumber}`);
      setOrder(res.data.data);
    } catch {
      setError(t.orderNotFound);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => statusSteps.findIndex((s) => s.key === status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{t.trackOrder}</h1>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex gap-3">
            <input type="text" placeholder={`${t.orderId} (e.g., BM-XXXX-XXXX)`} value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="input-field flex-1" />
            <button type="submit" disabled={loading} className="btn-primary">
              <Search size={18} />
              {loading ? t.loading : t.trackButton}
            </button>
          </div>
          {error && <div className="alert-error mt-4">{error}</div>}
        </form>

        {order && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-semibold text-gray-900 text-base">Order #{order.orderNumber}</h2>
                <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString("bn-BD")}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                order.orderStatus === "DELIVERED" ? "bg-green-50 text-green-700" :
                order.orderStatus === "CANCELLED" ? "bg-red-50 text-red-700" :
                "bg-blue-50 text-blue-700"
              }`}>
                {order.orderStatus}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {statusSteps.map((step, index) => {
                const currentIndex = getStatusIndex(order.orderStatus);
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? "bg-[#0067A0] text-white" : "bg-gray-100 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-blue-100" : ""}`}>
                      <step.icon size={18} />
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                      {isCurrent && <p className="text-sm text-[#0067A0] font-medium">{t.currentStatus}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {order.rider && (
              <div className="p-3 bg-blue-50 rounded-xl mb-4">
                <h3 className="font-medium text-gray-900 mb-1 text-sm">{t.riderDashboard}</h3>
                <p className="text-sm text-gray-600">Name: {order.rider.user?.name}</p>
                <p className="text-sm text-gray-600">Phone: {order.rider.user?.phone}</p>
                {order.rider.currentLat && (
                  <a href={`https://www.openstreetmap.org/?mlat=${order.rider.currentLat}&mlon=${order.rider.currentLng}#map=15/${order.rider.currentLat}/${order.rider.currentLng}`} target="_blank" rel="noopener noreferrer" className="text-[#0067A0] text-base hover:underline mt-2 inline-block font-medium">
                    {t.viewOnMap}
                  </a>
                )}
              </div>
            )}

            {order.items && (
              <div className="border-t border-gray-200 pt-3">
                <h3 className="font-medium text-gray-900 mb-2 text-sm">{t.items}</h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-500">{item.product?.name} x {item.quantity}</span>
                      <span className="font-medium text-gray-900">৳{item.totalPrice}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-900">{t.total}</span>
                  <span className="text-[#0067A0]">৳{order.total}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
