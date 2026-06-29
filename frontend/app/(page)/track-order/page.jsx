"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveRiderMap from "@/components/tracking/LiveRiderMap";
import useSocket from "@/helper/useSocket";
import api from "@/lib/axios";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Radio } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") || "";
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const { liveRiderLocation, connected } = useSocket(order?.id);

  const statusSteps = [
    { key: "PENDING", label: t.orderPlaced, icon: Package },
    { key: "CONFIRMED", label: t.confirmed, icon: CheckCircle },
    { key: "PROCESSING", label: t.processing, icon: Clock },
    { key: "SHIPPED", label: t.shipped, icon: Truck },
    { key: "OUT_FOR_DELIVERY", label: t.outForDelivery, icon: MapPin },
    { key: "DELIVERED", label: t.delivered, icon: CheckCircle },
  ];

  const fetchOrder = async (number) => {
    if (!number.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/tracking/${number}`);
      setOrder(res.data.data);
    } catch {
      setError(t.orderNotFound);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder) {
      fetchOrder(initialOrder);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  const getStatusIndex = (status) => statusSteps.findIndex((s) => s.key === status);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B] mb-2 sm:mb-3">{t.trackOrder}</h1>

        <form onSubmit={handleSearch} className="bg-white rounded-lg p-3 sm:p-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] mb-3">
          <div className="flex gap-2">
            <input type="text" placeholder={`${t.orderId} (e.g., BM-XXXX-XXXX)`} value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="input-field flex-1" />
            <button type="submit" disabled={loading} className="btn-primary flex-shrink-0">
              <Search size={14} />
              <span className="hidden sm:inline">{loading ? t.loading : t.trackButton}</span>
            </button>
          </div>
          {error && <div className="alert-error mt-2.5">{error}</div>}
        </form>

        {order && (
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="font-semibold text-[#000000] text-xs sm:text-sm">Order #{order.orderNumber}</h2>
                <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString("bn-BD")}</p>
                {order.deliveryDistrict && (
                  <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5">
                    <MapPin size={10} className="inline mr-0.5" />
                    {order.deliveryDistrict}{order.deliveryUpazila ? `, ${order.deliveryUpazila}` : ""}
                  </p>
                )}
              </div>
              <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-semibold ${
                order.orderStatus === "DELIVERED" ? "bg-green-50 text-green-700" :
                order.orderStatus === "CANCELLED" ? "bg-[#FFF0F0] text-[#FF6B6B]" :
                "bg-[#E8F4F8] text-[#00AFCC]"
              }`}>
                {order.orderStatus}
              </span>
            </div>

            <div className="space-y-2 sm:space-y-2.5 mb-3">
              {statusSteps.map((step, index) => {
                const currentIndex = getStatusIndex(order.orderStatus);
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                return (
                  <div key={step.key} className="flex items-center gap-2 sm:gap-2.5">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? "bg-[#EC008C] text-white" : "bg-[#F0F2F5] text-[#E5E7EB]"
                    } ${isCurrent ? "ring-2 sm:ring-3 ring-[#FCE8F3]" : ""}`}>
                      <step.icon size={12} className="sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <p className={`font-medium text-[11px] sm:text-xs ${isCompleted ? "text-[#000000]" : "text-[#E5E7EB]"}`}>{step.label}</p>
                      {isCurrent && <p className="text-[10px] sm:text-[11px] text-[#EC008C] font-semibold">{t.currentStatus}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {order.rider && (
              <div className="p-2.5 bg-[#E8F4F8] rounded-lg mb-3">
                <h3 className="font-medium text-[#000000] mb-0.5 text-[11px] sm:text-xs">{t.riderDashboard}</h3>
                <p className="text-[10px] sm:text-[11px] text-[#5A6C91]">Name: {order.rider.user?.name}</p>
                <p className="text-[10px] sm:text-[11px] text-[#5A6C91]">Phone: {order.rider.user?.phone}</p>
                {order.rider.currentLat && (
                  <a href={`https://www.openstreetmap.org/?mlat=${order.rider.currentLat}&mlon=${order.rider.currentLng}#map=15/${order.rider.currentLat}/${order.rider.currentLng}`} target="_blank" rel="noopener noreferrer" className="text-[#00AFCC] text-[10px] sm:text-[11px] hover:underline mt-1.5 inline-block font-semibold">
                    {t.viewOnMap}
                  </a>
                )}
              </div>
            )}

            {order.manager && (
              <div className="p-2.5 bg-[#FCE8F3] rounded-lg mb-3">
                <h3 className="font-medium text-[#000000] mb-0.5 text-[11px] sm:text-xs">Zila Manager</h3>
                <p className="text-[10px] sm:text-[11px] text-[#5A6C91]">Name: {order.manager.user?.name}</p>
                <p className="text-[10px] sm:text-[11px] text-[#5A6C91]">Phone: {order.manager.user?.phone}</p>
                <p className="text-[10px] sm:text-[11px] text-[#5A6C91]">District: {order.manager.assignedDistrict}</p>
                {order.manager.assignedZila && (
                  <p className="text-[10px] sm:text-[11px] text-[#5A6C91]">Zila: {order.manager.assignedZila}</p>
                )}
              </div>
            )}

            {order.deliveryLatitude && order.deliveryLongitude && (
              <div className="mb-3">
                {connected && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-600">Live Tracking</span>
                  </div>
                )}
                <div className="rounded-lg overflow-hidden border border-[#E5E7EB]" style={{ height: "250px" }}>
                  <LiveRiderMap
                    riderLat={liveRiderLocation?.lat || order.rider?.currentLat || null}
                    riderLng={liveRiderLocation?.lng || order.rider?.currentLng || null}
                    destinationLat={order.deliveryLatitude}
                    destinationLng={order.deliveryLongitude}
                  />
                </div>
              </div>
            )}

            {order.items && (
              <div className="border-t border-[#E5E7EB] pt-2.5">
                <h3 className="font-medium text-[#000000] mb-1.5 text-[11px] sm:text-xs">{t.items}</h3>
                <div className="space-y-1 sm:space-y-1.5">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-[11px] sm:text-xs">
                      <span className="text-[#667085] truncate mr-2">{item.product?.name} x {item.quantity}</span>
                      <span className="font-medium text-[#000000] whitespace-nowrap">৳{item.totalPrice}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-xs sm:text-sm mt-2 pt-2 border-t border-[#E5E7EB]">
                  <span className="text-[#000000]">{t.total}</span>
                  <span className="text-[#000000]">৳{order.total}</span>
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

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">Loading...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
