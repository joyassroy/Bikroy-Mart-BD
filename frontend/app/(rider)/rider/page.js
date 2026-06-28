"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle, MapPin, Phone, Clock, Star, ChevronRight, Navigation } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";

const statusConfig = {
  PENDING: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
  CONFIRMED: { color: "bg-blue-100 text-blue-700", label: "Confirmed" },
  PROCESSING: { color: "bg-indigo-100 text-indigo-700", label: "Processing" },
  SHIPPED: { color: "bg-purple-100 text-purple-700", label: "Shipped" },
  OUT_FOR_DELIVERY: { color: "bg-orange-100 text-orange-700", label: "Out for Delivery" },
  DELIVERED: { color: "bg-green-100 text-green-700", label: "Delivered" },
};

export default function RiderDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

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

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg h-20 animate-pulse border border-[#E5E7EB]" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B]">{t.activeDeliveries || "My Deliveries"}</h1>
        <button
          onClick={toggleAvailability}
          disabled={togglingAvailability}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition ${
            stats?.isAvailable
              ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
              : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${stats?.isAvailable ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
          {stats?.isAvailable ? t.online || "Online" : "Offline"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] text-[#667085]">{t.todayDeliveries || "Today's Delivered"}</p>
              <p className="text-base sm:text-lg font-bold text-[#000000] mt-0.5">{stats?.todayDelivered ?? 0}</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg"><CheckCircle size={18} className="text-green-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] text-[#667085]">{t.pendingDeliveries || "Active"}</p>
              <p className="text-base sm:text-lg font-bold text-[#000000] mt-0.5">{stats?.activeDeliveries ?? 0}</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg"><Truck size={18} className="text-orange-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] text-[#667085]">{t.totalDeliveries || "Total Delivered"}</p>
              <p className="text-base sm:text-lg font-bold text-[#000000] mt-0.5">{stats?.totalDeliveries ?? 0}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg"><Package size={18} className="text-blue-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] text-[#667085]">Rating</p>
              <p className="text-base sm:text-lg font-bold text-[#000000] mt-0.5">{stats?.ratings?.toFixed(1) ?? "0.0"}</p>
            </div>
            <div className="bg-amber-50 p-2 rounded-lg"><Star size={18} className="text-amber-500" /></div>
          </div>
        </div>
      </div>

      {/* Active Delivery */}
      {activeDelivery && (
        <div className="bg-white rounded-lg p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
            <h2 className="font-semibold text-[#000000] text-xs">{t.activeDeliveries || "Active Delivery"}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Package size={12} className="text-[#EC008C] flex-shrink-0" />
                  <span className="font-medium text-[#000000] text-[11px] sm:text-xs">{activeDelivery.orderNumber}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${statusConfig[activeDelivery.orderStatus]?.color || "bg-gray-100 text-gray-600"}`}>
                    {statusConfig[activeDelivery.orderStatus]?.label || activeDelivery.orderStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package size={12} className="text-[#667085] flex-shrink-0" />
                  <span className="text-[10px] sm:text-[11px] text-[#667085]">{activeDelivery.user?.name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={12} className="text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] sm:text-[11px] text-[#000000]">{activeDelivery.deliveryAddress}, {activeDelivery.deliveryDistrict}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-green-500 flex-shrink-0" />
                  <span className="text-[10px] sm:text-[11px] text-[#000000]">{activeDelivery.user?.phone}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#667085]">
                  {t.items || "Items"}: {activeDelivery.items?.length || 0} | {t.total || "Total"}: ৳{activeDelivery.total}
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/rider/delivery/${activeDelivery.id}`}
                  className="bg-green-600 text-white px-4 py-1.5 rounded-md text-[11px] sm:text-xs font-medium hover:bg-green-700 transition flex items-center gap-1.5"
                >
                  <Navigation size={12} /> {t.startDelivery || "Open Delivery"}
                </Link>
                {activeDelivery.deliveryLatitude && activeDelivery.deliveryLongitude && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${activeDelivery.deliveryLatitude}&mlon=${activeDelivery.deliveryLongitude}#map=15/${activeDelivery.deliveryLatitude}/${activeDelivery.deliveryLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-[11px] sm:text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <MapPin size={12} /> {t.viewOnMap || "Map"}
                  </a>
                )}
              </div>
            </div>
            {activeDelivery.deliveryLatitude && activeDelivery.deliveryLongitude && (
              <div className="bg-[#F4F7FB] rounded-md h-40 sm:h-48 flex items-center justify-center text-[#E5E7EB]">
                <div className="text-center">
                  <MapPin size={24} className="mx-auto mb-1" />
                  <p className="text-[10px] sm:text-xs">Map will load with Leaflet</p>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${activeDelivery.deliveryLatitude}&mlon=${activeDelivery.deliveryLongitude}#map=15/${activeDelivery.deliveryLatitude}/${activeDelivery.deliveryLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00AFCC] text-[10px] sm:text-[11px] hover:underline font-semibold mt-1 inline-block"
                  >
                    {t.viewOnMap || "View on OpenStreetMap"}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending / Assigned Orders Queue */}
      <div className="bg-white rounded-lg shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
        <div className="p-3 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="font-semibold text-[#000000] text-xs">{t.pendingDeliveries || "Assigned Orders"} ({pendingOrders.length})</h3>
          <Link href="/rider/history" className="text-[10px] sm:text-[11px] text-[#EC008C] font-semibold hover:underline flex items-center gap-0.5">
            {t.viewHistory || "History"} <ChevronRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-[#F4F7FB]">
          {pendingOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-xs">
              <Package size={24} className="mx-auto mb-2 text-gray-300" />
              <p>No assigned orders yet</p>
            </div>
          ) : (
            pendingOrders.map((order) => (
              <Link
                key={order.id}
                href={`/rider/delivery/${order.id}`}
                className="p-3 flex items-center justify-between gap-3 hover:bg-[#F4F7FB] transition group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#000000] text-[11px] sm:text-xs">{order.orderNumber}</p>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${statusConfig[order.orderStatus]?.color || "bg-gray-100 text-gray-600"}`}>
                      {statusConfig[order.orderStatus]?.label || order.orderStatus}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5 truncate">{order.user?.name} — {order.deliveryAddress}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-[#667085] flex items-center gap-1"><Phone size={10} />{order.user?.phone}</span>
                    <span className="text-[10px] text-[#667085]">{order.items?.length || 0} items</span>
                    <span className="text-[10px] font-medium text-[#000000]">৳{order.total}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-[#EC008C] transition flex-shrink-0" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
