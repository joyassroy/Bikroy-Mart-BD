"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveRiderMap from "@/components/tracking/LiveRiderMap";
import LocationMapModal from "@/components/ui/LocationMapModal";
import useSocket from "@/helper/useSocket";
import api from "@/lib/axios";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, User, Navigation } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") || "";
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const { liveRiderLocation, connected, orderStatus } = useSocket(order?.id);
  const [showRiderMap, setShowRiderMap] = useState(false);

  const statusSteps = [
    { key: "PENDING", label: t.orderPlaced, icon: Package, color: "#00215B" },
    { key: "CONFIRMED", label: t.confirmed, icon: CheckCircle, color: "#00AFCC" },
    { key: "PROCESSING", label: t.packaging, icon: Clock, color: "#F59E0B" },
    { key: "SHIPPED", label: t.onTheWay, icon: Truck, color: "#EC008C" },
    { key: "DELIVERED", label: t.delivered, icon: CheckCircle, color: "#16A34A" },
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
    if (initialOrder) fetchOrder(initialOrder);
  }, []);

  useEffect(() => {
    if (orderStatus && order?.orderNumber) {
      fetchOrder(order.orderNumber);
    }
  }, [orderStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  const getStatusIndex = (status) => {
    const map = { PENDING: 0, CONFIRMED: 1, PROCESSING: 2, SHIPPED: 3, OUT_FOR_DELIVERY: 3, DELIVERED: 4 };
    return map[status] ?? -1;
  };

  const currentIdx = order ? getStatusIndex(order.orderStatus) : -1;
  const currentStep = statusSteps[currentIdx];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F2F5] to-white">
      <Header />
      <main className="max-w-[800px] mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Page Title */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#00215B]">{t.trackOrder}</h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">{t.trackOrderSubtitle}</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-3 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#E5E7EB] mb-4 sm:mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99A0B4]" />
              <input
                type="text"
                placeholder={`${t.orderId} (e.g., BM-XXXX-XXXX)`}
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC008C]/30 focus:border-[#EC008C] transition"
              />
            </div>
            <button type="submit" disabled={loading} className="bg-[#EC008C] hover:bg-[#D60071] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 flex-shrink-0 disabled:opacity-50">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search size={16} />
              )}
              <span className="hidden sm:inline">{loading ? t.loading : t.trackButton}</span>
            </button>
          </div>
          {error && (
            <div className="mt-3 px-3 py-2 bg-[#FFF0F0] text-[#FF6B6B] text-xs rounded-lg font-medium">{error}</div>
          )}
        </form>

        {/* Order Results */}
        {order && (
          <div className="space-y-4 sm:space-y-5">
            {/* Order Header Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#E5E7EB]">
              {/* Status Banner */}
              <div className={`px-4 sm:px-6 py-4 sm:py-5 ${
                order.orderStatus === "DELIVERED"
                  ? "bg-gradient-to-r from-[#16A34A] to-[#22C55E]"
                  : order.orderStatus === "CANCELLED"
                  ? "bg-gradient-to-r from-[#DC2626] to-[#EF4444]"
                  : "bg-gradient-to-r from-[#00215B] to-[#0044AA]"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Order Number</p>
                    <p className="text-white text-lg sm:text-xl font-mono font-bold tracking-wider mt-0.5">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/20 text-white backdrop-blur-sm">
                      {statusSteps.find((s) => s.key === order.orderStatus)?.label || order.orderStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="px-4 sm:px-6 py-5 sm:py-6">
                <div className="flex items-start justify-between relative">
                  {/* Background line */}
                  <div className="absolute top-[18px] sm:top-[20px] left-[10%] right-[10%] h-[3px] bg-[#E5E7EB] rounded-full" />
                  {/* Active line */}
                  <div
                    className="absolute top-[18px] sm:top-[20px] left-[10%] h-[3px] rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (currentIdx / (statusSteps.length - 1)) * 80)}%`,
                      background: currentStep?.color || "#EC008C",
                    }}
                  />

                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentIdx;
                    const isCurrent = index === currentIdx;
                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                            isCompleted
                              ? "text-white shadow-lg"
                              : "bg-[#F0F2F5] text-[#D0D5DD] border-2 border-[#E5E7EB]"
                          } ${isCurrent ? "scale-110 ring-4 ring-offset-2" : ""}`}
                          style={{
                            backgroundColor: isCompleted ? step.color : undefined,
                            ringColor: isCurrent ? step.color + "30" : undefined,
                          }}
                        >
                          {isCompleted && !isCurrent ? (
                            <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                          ) : (
                            <step.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                          )}
                        </div>
                        <p className={`text-[9px] sm:text-[11px] font-semibold text-center mt-2 leading-tight ${
                          isCompleted ? "text-[#181717]" : "text-[#D0D5DD]"
                        }`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span
                            className="mt-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold text-white"
                            style={{ backgroundColor: step.color }}
                          >
                            {t.currentStatus}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Info Row */}
              <div className="px-4 sm:px-6 py-3 border-t border-[#F0F2F5] flex flex-wrap gap-x-6 gap-y-2 text-[10px] sm:text-[11px] text-[#667085]">
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-[#99A0B4]" />
                  Placed {new Date(order.createdAt).toLocaleDateString("en-BD", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {order.deliveryDistrict && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-[#EC008C]" />
                    {order.deliveryDistrict}{order.deliveryUpazila ? `, ${order.deliveryUpazila}` : ""}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Package size={12} className="text-[#99A0B4]" />
                  {order.items?.length || 0} items
                </span>
              </div>
            </div>

            {/* Rider Info */}
            {order.rider && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#E5E7EB]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#E8F4F8] flex items-center justify-center">
                    <Navigation size={14} className="text-[#00AFCC]" />
                  </div>
                  <h3 className="font-semibold text-[#181717] text-xs sm:text-sm">{t.riderDashboard}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#00215B]/10 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-[#00215B]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#99A0B4] font-medium">Rider Name</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#181717] truncate">{order.rider.user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#16A34A]/10 flex items-center justify-center flex-shrink-0">
                      <Phone size={16} className="text-[#16A34A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#99A0B4] font-medium">Phone</p>
                      <a href={`tel:${order.rider.user?.phone}`} className="text-xs sm:text-sm font-semibold text-[#16A34A] truncate block hover:underline">
                        {order.rider.user?.phone}
                      </a>
                    </div>
                  </div>
                </div>
                {order.rider.currentLat && (
                  <button
                    onClick={() => setShowRiderMap(true)}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-[#00AFCC]/10 hover:bg-[#00AFCC]/20 rounded-xl text-[#00AFCC] text-xs sm:text-sm font-semibold transition"
                  >
                    <MapPin size={14} />
                    {t.viewOnMap}
                  </button>
                )}
              </div>
            )}

            {/* Manager Info */}
            {order.manager && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#E5E7EB]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#FCE8F3] flex items-center justify-center">
                    <User size={14} className="text-[#EC008C]" />
                  </div>
                  <h3 className="font-semibold text-[#181717] text-xs sm:text-sm">Zila Manager</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#EC008C]/10 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-[#EC008C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#99A0B4] font-medium">Manager Name</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#181717] truncate">{order.manager.user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#16A34A]/10 flex items-center justify-center flex-shrink-0">
                      <Phone size={16} className="text-[#16A34A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#99A0B4] font-medium">Phone</p>
                      <a href={`tel:${order.manager.user?.phone}`} className="text-xs sm:text-sm font-semibold text-[#16A34A] truncate block hover:underline">
                        {order.manager.user?.phone}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[10px] sm:text-[11px] text-[#667085]">
                  <MapPin size={12} className="text-[#EC008C]" />
                  {order.manager.assignedDistrict}{order.manager.assignedZila ? `, ${order.manager.assignedZila}` : ""}
                </div>
              </div>
            )}

            {/* Live Map */}
            {order.deliveryLatitude && order.deliveryLongitude && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#E5E7EB]">
                {connected && (
                  <div className="px-4 sm:px-5 py-3 border-b border-[#F0F2F5] flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">Live Tracking Active</span>
                  </div>
                )}
                <div className="h-[250px] sm:h-[300px]">
                  <LiveRiderMap
                    riderLat={liveRiderLocation?.lat || order.rider?.currentLat || null}
                    riderLng={liveRiderLocation?.lng || order.rider?.currentLng || null}
                    destinationLat={order.deliveryLatitude}
                    destinationLng={order.deliveryLongitude}
                  />
                </div>
              </div>
            )}

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#E5E7EB]">
                <div className="px-4 sm:px-5 py-3 border-b border-[#F0F2F5]">
                  <h3 className="font-semibold text-[#181717] text-xs sm:text-sm">{t.items}</h3>
                </div>
                <div className="divide-y divide-[#F0F2F5]">
                  {order.items.map((item) => (
                    <div key={item.id} className="px-4 sm:px-5 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F4F7FB] flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-[#99A0B4]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#181717] truncate">{item.product?.name}</p>
                        <p className="text-[10px] sm:text-[11px] text-[#667085]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#181717] whitespace-nowrap">৳{item.totalPrice}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 sm:px-5 py-3 bg-[#F9FAFB] flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-semibold text-[#667085]">{t.total}</span>
                  <span className="text-sm sm:text-base font-bold text-[#00215B]">৳{order.total}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
      {order?.rider?.currentLat && (
        <LocationMapModal
          show={showRiderMap}
          onClose={() => setShowRiderMap(false)}
          lat={order.rider.currentLat}
          lng={order.rider.currentLng}
          label="Rider Location"
          title="Rider Location"
        />
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-[#EC008C]/30 border-t-[#EC008C] rounded-full animate-spin" />
          <p className="text-xs text-[#667085] font-medium">Loading...</p>
        </div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
