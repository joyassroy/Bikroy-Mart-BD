"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, MapPin, Truck, DollarSign, Clock, CheckCircle, Package, XCircle, RotateCcw, Search } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";

const statusConfig = {
  PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  CONFIRMED: { color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  PROCESSING: { color: "bg-indigo-100 text-indigo-700", icon: Package },
  SHIPPED: { color: "bg-purple-100 text-purple-700", icon: Truck },
  OUT_FOR_DELIVERY: { color: "bg-orange-100 text-orange-700", icon: Truck },
  DELIVERED: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  CANCELLED: { color: "bg-red-100 text-red-700", icon: XCircle },
  RETURNED: { color: "bg-gray-100 text-gray-700", icon: RotateCcw },
};

export default function ManagerDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
        { label: t.totalOrders, value: stats.totalOrders?.toLocaleString() || "0", icon: ShoppingCart, color: "text-[#EC008C] bg-[#FCE8F3]" },
        { label: t.totalDelivery, value: stats.totalDeliveredOrders?.toLocaleString() || "0", icon: Truck, color: "text-[#10B981] bg-[#ECFDF5]" },
        { label: t.totalSell, value: `৳${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-[#D4A017] bg-[#FFF8E1]" },
      ]
    : [];

  const todayCards = stats
    ? [
        { label: t.todayOrders, value: stats.todayOrders?.toLocaleString() || "0", icon: ShoppingCart, color: "text-[#7C3AED] bg-[#F3E8FF]" },
        { label: t.todayDelivery, value: stats.todayDeliveredOrders?.toLocaleString() || "0", icon: Truck, color: "text-[#10B981] bg-[#ECFDF5]" },
        { label: t.todaySales, value: `৳${(stats.todaySales || 0).toLocaleString()}`, icon: DollarSign, color: "text-[#EC008C] bg-[#FCE8F3]" },
      ]
    : [];

  const statusBreakdown = [
    { key: "PENDING", label: t.pending, color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    { key: "CONFIRMED", label: t.confirmed, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { key: "PROCESSING", label: "Processing", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { key: "SHIPPED", label: t.shipped, color: "text-purple-600 bg-purple-50 border-purple-200" },
    { key: "OUT_FOR_DELIVERY", label: t.outForDelivery, color: "text-orange-600 bg-orange-50 border-orange-200" },
    { key: "DELIVERED", label: t.delivered, color: "text-green-600 bg-green-50 border-green-200" },
    { key: "CANCELLED", label: t.cancelled, color: "text-red-600 bg-red-50 border-red-200" },
    { key: "RETURNED", label: t.returned, color: "text-gray-600 bg-gray-50 border-gray-200" },
  ];

  const allOrders = stats ? (stats.totalOrders || 0) : 0;
  const statusCounts = {};
  orders.forEach((o) => {
    statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1;
  });

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = !orderSearch ||
      o.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.user?.phone?.includes(orderSearch);
    const matchesStatus = !statusFilter || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredStatusCounts = {};
  filteredOrders.forEach((o) => {
    filteredStatusCounts[o.orderStatus] = (filteredStatusCounts[o.orderStatus] || 0) + 1;
  });

  return (
    <div>
      <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B] mb-3">{t.managerDashboard}</h1>

      {stats && (
        <div className="bg-white rounded-lg p-3 mb-4 border border-[#E5E7EB] flex items-center gap-2 text-xs text-[#667085]">
          <MapPin size={14} className="text-[#EC008C]" />
          <span>{t.assignedLocation}: <strong className="text-[#000000]">{stats.assignedDistrict}</strong>{stats.assignedZila ? `, ${stats.assignedZila}` : ""}</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4">
        {loading
          ? [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-lg h-20 animate-pulse border border-[#E5E7EB]" />)
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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4">
        {loading
          ? [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-lg h-20 animate-pulse border border-[#E5E7EB]" />)
          : todayCards.map((stat) => (
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

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-lg p-3 mb-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#000000] text-xs">Order Status Overview</h3>
          <span className="text-[10px] text-[#667085]">Total: {filteredOrders.length}</span>
        </div>
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name or phone..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-[11px] sm:text-xs focus:outline-none focus:border-[#EC008C] transition"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition ${
              statusFilter === "" ? "bg-[#EC008C] text-white" : "bg-white text-[#667085] hover:bg-[#F4F7FB] border border-[#E5E7EB]"
            }`}
          >
            All
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${statusFilter === "" ? "bg-white/20" : "bg-[#F4F7FB]"}`}>
              {orderSearch ? filteredOrders.length : allOrders}
            </span>
          </button>
          {statusBreakdown.map((s) => {
            const count = orderSearch
              ? filteredStatusCounts[s.key] || 0
              : statusCounts[s.key] || 0;
            return (
              <button
                key={s.key}
                onClick={() => setStatusFilter(statusFilter === s.key ? "" : s.key)}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition ${
                  statusFilter === s.key ? `${s.color} ring-2 ring-offset-1` : "bg-white text-[#667085] hover:bg-[#F4F7FB] border border-[#E5E7EB]"
                }`}
              >
                {s.label}
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${statusFilter === s.key ? "bg-white/30" : "bg-[#F4F7FB]"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
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
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-[11px] text-gray-400">{t.noPendingOrders}</td></tr>
            ) : (
              filteredOrders.slice(0, 5).map((order) => (
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
