"use client";
import { useState, useEffect } from "react";
import { Package, ShoppingCart, Clock, CheckCircle, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";

export default function ManagerDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get("/managers/stats"),
          api.get("/orders/manager/local"),
        ]);
        setStats(statsRes.data.data);
        setOrders((ordersRes.data.data || []).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = stats
    ? [
        { label: t.totalProducts, value: stats.totalProducts, icon: Package, color: "text-[#00AFCC] bg-[#E8F4F8]" },
        { label: t.localOrders, value: stats.totalOrders, icon: ShoppingCart, color: "text-[#EC008C] bg-[#FCE8F3]" },
        { label: t.pendingDeliveries, value: stats.pendingOrders, icon: Clock, color: "text-[#D4A017] bg-[#FFF8E1]" },
        { label: t.activeProducts, value: stats.activeProducts, icon: CheckCircle, color: "text-[#00215B] bg-[#E8EDF5]" },
      ]
    : [];

  return (
    <div>
      <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B] mb-3">{t.managerDashboard}</h1>

      {stats && (
        <div className="bg-white rounded-lg p-3 mb-4 border border-[#E5E7EB] flex items-center gap-2 text-xs text-[#667085]">
          <MapPin size={14} className="text-[#EC008C]" />
          <span>Assigned Location: <strong className="text-[#000000]">{stats.assignedDistrict}</strong>{stats.assignedZila ? `, ${stats.assignedZila}` : ""}</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {loading
          ? [...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-lg h-20 animate-pulse border border-[#E5E7EB]" />)
          : statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-2.5 sm:p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-[11px] text-[#667085]">{stat.label}</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-[#000000] mt-0.5">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 sm:p-2.5 rounded-lg flex-shrink-0`}>
                  <stat.icon size={18} className="sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="bg-white rounded-lg shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] overflow-x-auto">
        <div className="p-3 border-b border-[#E5E7EB]">
          <h3 className="font-semibold text-[#000000] text-xs">{t.pendingDeliveries}</h3>
        </div>
        <table className="w-full min-w-[380px]">
          <thead>
            <tr className="text-left text-[10px] sm:text-[11px] text-[#667085] border-b border-[#E5E7EB]">
              <th className="px-3 py-2 font-medium">{t.orderId}</th>
              <th className="px-3 py-2 font-medium">{t.myAccount}</th>
              <th className="px-3 py-2 font-medium">{t.items}</th>
              <th className="px-3 py-2 font-medium">{t.total}</th>
              <th className="px-3 py-2 font-medium">{t.orderStatus}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-[11px] text-gray-400">{t.loading}</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-[11px] text-gray-400">No pending orders</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-[#F4F7FB] hover:bg-[#F4F7FB] transition">
                  <td className="px-3 py-2 font-medium text-[#EC008C] text-[11px] sm:text-xs">{order.orderNumber}</td>
                  <td className="px-3 py-2 text-[11px] sm:text-xs text-[#000000]">{order.user?.name}</td>
                  <td className="px-3 py-2 text-[11px] sm:text-xs text-[#000000]">{order.items?.length}</td>
                  <td className="px-3 py-2 text-[11px] sm:text-xs font-medium text-[#000000]">৳{order.total}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      order.orderStatus === "PENDING" ? "bg-yellow-100 text-yellow-700"
                      : order.orderStatus === "CONFIRMED" ? "bg-blue-100 text-blue-700"
                      : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
