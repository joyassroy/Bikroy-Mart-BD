"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle, MapPin, Phone, Clock, Star, ChevronRight, Navigation, Zap, TrendingUp, RotateCcw, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSelector } from "react-redux";
import api from "@/lib/axios";
import LiveRiderMap from "@/components/tracking/LiveRiderMap";
import useSocket from "@/helper/useSocket";

const statusConfig = {
  PENDING: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500", label: "Pending" },
  CONFIRMED: { color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", label: "Confirmed" },
  PROCESSING: { color: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500", label: "Processing" },
  SHIPPED: { color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500", label: "Shipped" },
  OUT_FOR_DELIVERY: { color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", label: "Out for Delivery" },
  DELIVERED: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Delivered" },
};

const deliverySteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function RiderDashboard() {
  const { t } = useLanguage();
  const user = useSelector((state) => state.user?.data);
  const [stats, setStats] = useState(null);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const { liveRiderLocation, connected } = useSocket(activeDelivery?.id);

  const fetchDashboard = async () => {
    try {
      const [statsRes, activeRes, assignedRes] = await Promise.all([
        api.get("/riders/stats").catch(() => ({ data: { data: null } })),
        api.get("/riders/active-delivery").catch(() => ({ data: { data: null } })),
        api.get("/riders/assigned-orders").catch(() => ({ data: { data: [] } })),
      ]);
      setStats(statsRes.data.data);
      setActiveDelivery(activeRes.data.data);
      setPendingOrders(assignedRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleAvailability = async () => {
    setTogglingAvailability(true);
    try {
      await api.put("/riders/availability");
      setStats((prev) => prev ? { ...prev, isAvailable: !prev.isAvailable } : prev);
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingAvailability(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning || "Good Morning";
    if (hour < 17) return t.goodAfternoon || "Good Afternoon";
    return t.goodEvening || "Good Evening";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl h-24 animate-pulse border border-[#E5E7EB]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-[#E5E7EB]" />
          ))}
        </div>
        <div className="bg-white rounded-2xl h-64 animate-pulse border border-[#E5E7EB]" />
      </div>
    );
  }

  const currentStepIndex = activeDelivery ? deliverySteps.indexOf(activeDelivery.orderStatus) : -1;

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#00215B] via-[#003087] to-[#00AFCC] rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium mb-1">{getGreeting()}</p>
            <h1 className="text-lg sm:text-xl font-bold">{user?.name || "Rider"}</h1>
            <p className="text-white/60 text-[11px] mt-1">{stats?.todayDelivered ?? 0} {t.deliveriesCompleted || "deliveries completed today"}</p>
          </div>
          <button
            onClick={toggleAvailability}
            disabled={togglingAvailability}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
              stats?.isAvailable
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30"
                : "bg-white/10 text-white/60 border border-white/20 hover:bg-white/20"
            }`}
          >
            {togglingAvailability ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className={`w-2 h-2 rounded-full ${stats?.isAvailable ? "bg-emerald-400 animate-pulse" : "bg-white/40"}`} />
            )}
            {stats?.isAvailable ? t.online || "Online" : t.offline || "Offline"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <CheckCircle size={18} className="text-white" />
            </div>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-[#000000]">{stats?.todayDelivered ?? 0}</p>
          <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5 font-medium">{t.todayDeliveries || "Today's Delivered"}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Truck size={18} className="text-white" />
            </div>
            <Zap size={14} className="text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-[#000000]">{stats?.activeDeliveries ?? 0}</p>
          <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5 font-medium">{t.pendingDeliveries || "Active"}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#000000]">{stats?.totalDeliveries ?? 0}</p>
          <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5 font-medium">{t.totalDeliveries || "Total Delivered"}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Star size={18} className="text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#000000]">{stats?.ratings?.toFixed(1) ?? "0.0"}</p>
          <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5 font-medium">{t.rating || "Rating"}</p>
        </div>
      </div>

      {/* Active Delivery */}
      {activeDelivery && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F4F7FB] flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              <h2 className="font-semibold text-[#000000] text-sm">{t.activeDeliveries || "Active Delivery"}</h2>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig[activeDelivery.orderStatus]?.color || "bg-gray-50 text-gray-600 border-gray-200"}`}>
              {statusConfig[activeDelivery.orderStatus]?.label || activeDelivery.orderStatus}
            </span>
          </div>

          {/* Delivery Progress Stepper */}
          <div className="px-5 py-3 border-b border-[#F4F7FB] bg-[#F9FAFB]">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-2 left-4 right-4 h-0.5 bg-gray-200" />
              <div className="absolute top-2 left-4 h-0.5 bg-[#EC008C] transition-all duration-500" style={{ width: `${(currentStepIndex / (deliverySteps.length - 1)) * 100}%`, maxWidth: "calc(100% - 32px)" }} />
              {deliverySteps.map((step, idx) => (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    idx <= currentStepIndex
                      ? "bg-[#EC008C] border-[#EC008C]"
                      : "bg-white border-gray-300"
                  }`}>
                    {idx <= currentStepIndex && <CheckCircle size={10} className="text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-[#EC008C]" />
                  <span className="font-semibold text-[#000000] text-sm">{activeDelivery.orderNumber}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={12} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#667085]">{t.customer || "Customer"}</p>
                      <p className="text-xs font-medium text-[#000000]">{activeDelivery.user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Phone size={12} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#667085]">{t.phone || "Phone"}</p>
                      <a href={`tel:${activeDelivery.user?.phone}`} className="text-xs font-medium text-[#EC008C] hover:underline">{activeDelivery.user?.phone}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin size={12} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#667085]">{t.deliveryAddress || "Address"}</p>
                      <p className="text-xs font-medium text-[#000000]">{activeDelivery.deliveryAddress}, {activeDelivery.deliveryDistrict}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Package size={12} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#667085]">{t.orderTotal || "Order Total"}</p>
                      <p className="text-xs font-semibold text-[#000000]">৳{activeDelivery.total}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    href={`/rider/delivery/${activeDelivery.id}`}
                    className="bg-[#EC008C] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#D4007A] transition-all duration-200 flex items-center gap-2 shadow-lg shadow-[#EC008C]/20"
                  >
                    <Navigation size={14} /> {t.startDelivery || "Open Delivery"}
                  </Link>
                  {activeDelivery.deliveryLatitude && activeDelivery.deliveryLongitude && (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${activeDelivery.deliveryLatitude}&mlon=${activeDelivery.deliveryLongitude}#map=15/${activeDelivery.deliveryLatitude}/${activeDelivery.deliveryLongitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#F4F7FB] text-[#00215B] px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#E8EDF4] transition-all duration-200 flex items-center gap-2 border border-[#E5E7EB]"
                    >
                      <MapPin size={14} /> {t.viewOnMap || "View on Map"}
                    </a>
                  )}
                </div>
              </div>
              {activeDelivery.deliveryLatitude && activeDelivery.deliveryLongitude && (
                <div className="lg:col-span-2 rounded-xl overflow-hidden border border-[#E5E7EB] h-52 lg:h-auto relative">
                  {connected && (
                    <div className="absolute top-2 left-2 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur rounded-lg px-2 py-1 shadow border border-[#E5E7EB]">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-semibold text-emerald-600">Live</span>
                    </div>
                  )}
                  <LiveRiderMap
                    riderLat={liveRiderLocation?.lat || activeDelivery.riderLat}
                    riderLng={liveRiderLocation?.lng || activeDelivery.riderLng}
                    destinationLat={activeDelivery.deliveryLatitude}
                    destinationLng={activeDelivery.deliveryLongitude}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending / Assigned Orders Queue */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F4F7FB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#000000] text-sm">{t.assignedOrders || "Assigned Orders"}</h3>
            <span className="w-5 h-5 rounded-full bg-[#EC008C]/10 text-[#EC008C] text-[10px] font-bold flex items-center justify-center">{pendingOrders.length}</span>
          </div>
          <Link href="/rider/history" className="text-[11px] text-[#EC008C] font-semibold hover:underline flex items-center gap-1 transition">
            {t.viewHistory || "History"} <ChevronRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-[#F4F7FB]">
          {pendingOrders.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F4F7FB] flex items-center justify-center mx-auto mb-3">
                <Package size={28} className="text-[#D0D5DD]" />
              </div>
              <p className="text-sm font-medium text-[#667085]">{t.noAssignedOrders || "No assigned orders yet"}</p>
              <p className="text-[11px] text-[#D0D5DD] mt-1">{t.newOrdersWillAppear || "New orders will appear here"}</p>
            </div>
          ) : (
            pendingOrders.map((order) => (
              <Link
                key={order.id}
                href={`/rider/delivery/${order.id}`}
                className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#F9FAFB] transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EC008C]/10 to-[#EC008C]/5 flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-[#EC008C]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#000000] text-xs">{order.orderNumber}</p>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${statusConfig[order.orderStatus]?.color || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {statusConfig[order.orderStatus]?.label || order.orderStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085] mt-0.5 truncate">{order.user?.name} — {order.deliveryAddress}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-[#667085] flex items-center gap-1"><Phone size={10} />{order.user?.phone}</span>
                      <span className="text-[10px] text-[#667085]">{order.items?.length || 0} {t.items || "items"}</span>
                      <span className="text-[10px] font-semibold text-[#000000]">৳{order.total}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#D0D5DD] group-hover:text-[#EC008C] transition flex-shrink-0" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
