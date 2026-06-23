"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Package, Users, DollarSign, TrendingUp, Truck, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const statusColors = {
  PENDING: "bg-[#FFF8E1] text-[#D4A017]",
  CONFIRMED: "bg-[#E8F4F8] text-[#00AFCC]",
  PROCESSING: "bg-[#E8EDF5] text-[#2E4B8A]",
  SHIPPED: "bg-[#F3E8FF] text-[#7C3AED]",
  OUT_FOR_DELIVERY: "bg-[#FFF0F0] text-[#FF6B6B]",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-500",
};

const STATUS_PIE_COLORS = ["#F59E0B", "#3B82F6", "#8B5CF6", "#6366F1", "#EC008C", "#10B981", "#EF4444"];

export default function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, ordersRes, salesRes, statusRes] = await Promise.all([
        api.get("/analytics/stats"),
        api.get("/analytics/recent-orders?limit=8"),
        api.get("/analytics/sales-trend?days=14"),
        api.get("/analytics/orders-by-status"),
      ]);
      setStats(statsRes.data.data || {});
      setRecentOrders(ordersRes.data.data || []);
      setSalesTrend(salesRes.data.data || []);
      setOrdersByStatus(statusRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-pink-500" size={32} />
      </div>
    );
  }

  const statCards = [
    { label: t.totalOrders, value: stats?.totalOrders?.toLocaleString() || "0", icon: ShoppingCart, color: "text-[#EC008C] bg-[#FCE8F3]" },
    { label: t.totalProducts, value: stats?.totalProducts?.toLocaleString() || "0", icon: Package, color: "text-[#00AFCC] bg-[#E8F4F8]" },
    { label: t.totalUsers, value: stats?.totalUsers?.toLocaleString() || "0", icon: Users, color: "text-[#00215B] bg-[#E8EDF5]" },
    { label: t.revenue, value: `৳${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-[#D4A017] bg-[#FFF8E1]" },
  ];

  return (
    <div>
      <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B] mb-3">{t.dashboard} {t.overview}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {statCards.map((stat) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
          <h3 className="font-semibold text-[#000000] text-xs mb-2 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-pink-500" /> {t.analytics} (14 Days)
          </h3>
          {salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={salesTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#EC008C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-32 sm:h-40 bg-[#F4F7FB] rounded-md flex items-center justify-center text-[#E5E7EB]">
              <p className="text-[10px] sm:text-xs">No sales data yet</p>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
          <h3 className="font-semibold text-[#000000] text-xs mb-2 flex items-center gap-1.5">
            <Truck size={14} className="text-blue-500" /> {t.orders}
          </h3>
          {ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={60} label={({ status, count }) => `${status.replace("_", " ")}: ${count}`}>
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={index} fill={STATUS_PIE_COLORS[index % STATUS_PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-32 sm:h-40 bg-[#F4F7FB] rounded-md flex items-center justify-center text-[#E5E7EB]">
              <p className="text-[10px] sm:text-xs">No order data yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] overflow-x-auto">
        <div className="p-3 border-b border-[#E5E7EB]">
          <h3 className="font-semibold text-[#000000] text-xs">{t.recentOrders}</h3>
        </div>
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="text-left text-[10px] sm:text-[11px] text-[#667085] border-b border-[#E5E7EB]">
              <th className="px-3 py-2 font-medium">Order #</th>
              <th className="px-3 py-2 font-medium">{t.myAccount}</th>
              <th className="px-3 py-2 font-medium">{t.total}</th>
              <th className="px-3 py-2 font-medium">{t.orderStatus}</th>
              <th className="px-3 py-2 font-medium">Payment</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-[#F4F7FB] hover:bg-[#F4F7FB] transition">
                <td className="px-3 py-2 font-medium text-[#EC008C] text-[11px] sm:text-xs">{order.orderNumber || order.id.slice(0, 8)}</td>
                <td className="px-3 py-2 text-[11px] sm:text-xs text-[#000000]">{order.customerName}</td>
                <td className="px-3 py-2 text-[11px] sm:text-xs font-medium text-[#000000]">৳{order.total?.toLocaleString()}</td>
                <td className="px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold ${statusColors[order.orderStatus] || ""}`}>
                    {order.orderStatus?.replace("_", " ")}
                  </span>
                </td>
                <td className="px-3 py-2 text-[10px] sm:text-[11px] text-[#667085]">{order.paymentMethod}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-gray-400">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
