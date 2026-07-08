"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { CheckCircle, XCircle, Package, Search, TrendingUp, Calendar } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const STATUS_CONFIG = {
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function ManagerHistoryPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => { fetchHistory(); }, 300);
    return () => clearTimeout(debounce);
  }, [search, statusFilter]);

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const qs = params.toString();
      const res = await api.get(`/managers/history${qs ? `?${qs}` : ""}`);
      setOrders(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredCount = orders.filter((o) => o.orderStatus === "DELIVERED").length;
  const cancelledCount = orders.filter((o) => o.orderStatus === "CANCELLED").length;
  const thisMonth = orders.filter((o) => {
    const d = new Date(o.actualDelivery || o.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl h-12 w-48 border border-[#E5E7EB]" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-20 border border-[#E5E7EB]" />
          ))}
        </div>
        <div className="bg-white rounded-2xl h-64 border border-[#E5E7EB]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#000000]">Order History</h1>
          <p className="text-[11px] text-[#667085] mt-0.5">{orders.length} orders in history</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <CheckCircle size={14} className="text-white" />
            </div>
            <p className="text-[10px] text-[#667085] font-medium">Delivered</p>
          </div>
          <p className="text-xl font-bold text-[#000000]">{deliveredCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
              <XCircle size={14} className="text-white" />
            </div>
            <p className="text-[10px] text-[#667085] font-medium">Cancelled</p>
          </div>
          <p className="text-xl font-bold text-[#000000]">{cancelledCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <p className="text-[10px] text-[#667085] font-medium">This Month</p>
          </div>
          <p className="text-xl font-bold text-[#000000]">{thisMonth}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">৳</span>
            </div>
            <p className="text-[10px] text-[#667085] font-medium">Total Revenue</p>
          </div>
          <p className="text-xl font-bold text-[#000000]">৳{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D0D5DD]" />
          <input
            type="text"
            placeholder="Search by order #, customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-[#EC008C] focus:ring-2 focus:ring-[#EC008C]/10 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: "", label: "All" },
            { key: "DELIVERED", label: "Delivered" },
            { key: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-2 rounded-xl text-[11px] font-semibold transition ${
                statusFilter === tab.key
                  ? "bg-[#EC008C] text-white"
                  : "bg-white border border-[#E5E7EB] text-[#667085] hover:bg-[#F4F7FB]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left bg-[#F9FAFB]">
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">Order #</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">Items</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F7FB]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#F4F7FB] flex items-center justify-center mx-auto mb-3">
                      <Package size={24} className="text-[#D0D5DD]" />
                    </div>
                    <p className="text-sm font-medium text-[#667085]">{search ? "No orders match your search" : "No order history yet"}</p>
                    <p className="text-[11px] text-[#D0D5DD] mt-1">{search ? "Try a different search term" : "Completed and cancelled orders will appear here"}</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusCfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.DELIVERED;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-[#EC008C]">{order.orderNumber}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#F4F7FB] flex items-center justify-center text-[9px] font-bold text-[#667085]">
                            {order.user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??"}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#000000]">{order.user?.name}</p>
                            <p className="text-[10px] text-[#99A0B4]">{order.user?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-[#667085] bg-[#F4F7FB] px-2 py-1 rounded-md font-medium">{order.items?.length || 0}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-[#000000]">৳{order.total}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.color}`}>
                          <StatusIcon size={10} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-[#D0D5DD]" />
                          <span className="text-[11px] text-[#667085]">
                            {(order.actualDelivery || order.createdAt)
                              ? new Date(order.actualDelivery || order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
