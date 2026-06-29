"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { CheckCircle, Package, Search, TrendingUp, Calendar, Download } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function RiderHistoryPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => { fetchHistory(); }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const fetchHistory = async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.get(`/riders/history${params}`);
      setOrders(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const thisMonth = orders.filter((o) => {
    if (!o.actualDelivery) return false;
    const d = new Date(o.actualDelivery);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl h-12 w-48 border border-[#E5E7EB]" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-lg sm:text-xl font-bold text-[#000000]">{t.deliveryHistory || "Delivery History"}</h1>
          <p className="text-[11px] text-[#667085] mt-0.5">{orders.length} {t.totalDeliveries || "total deliveries"}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <CheckCircle size={14} className="text-white" />
            </div>
            <p className="text-[10px] text-[#667085] font-medium">{t.totalDelivered || "Total Delivered"}</p>
          </div>
          <p className="text-xl font-bold text-[#000000]">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <p className="text-[10px] text-[#667085] font-medium">{t.thisMonth || "This Month"}</p>
          </div>
          <p className="text-xl font-bold text-[#000000]">{thisMonth}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">৳</span>
            </div>
            <p className="text-[10px] text-[#667085] font-medium">{t.totalEarnings || "Total Earnings"}</p>
          </div>
          <p className="text-xl font-bold text-[#000000]">৳{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D0D5DD]" />
        <input
          type="text"
          placeholder={t.historySearchPlaceholder || "Search by order # or customer name..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-[#EC008C] focus:ring-2 focus:ring-[#EC008C]/10 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="text-left bg-[#F9FAFB]">
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">{t.orderNumber || "Order #"}</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">{t.customer || "Customer"}</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">{t.items || "Items"}</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">{t.total || "Total"}</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">{t.deliveredOn || "Delivered On"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F7FB]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#F4F7FB] flex items-center justify-center mx-auto mb-3">
                      <Package size={24} className="text-[#D0D5DD]" />
                    </div>
                    <p className="text-sm font-medium text-[#667085]">{search ? (t.noSearchResults || "No orders match your search") : (t.noDeliveryHistory || "No delivery history yet")}</p>
                    <p className="text-[11px] text-[#D0D5DD] mt-1">{search ? (t.tryDifferentSearch || "Try a different search term") : (t.completedDeliveriesWillAppear || "Completed deliveries will appear here")}</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold text-[#EC008C]">{order.orderNumber}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#F4F7FB] flex items-center justify-center text-[9px] font-bold text-[#667085]">
                          {order.user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??"}
                        </div>
                        <p className="text-xs font-medium text-[#000000]">{order.user?.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-[#667085] bg-[#F4F7FB] px-2 py-1 rounded-md font-medium">{order.items?.length || 0}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold text-[#000000]">৳{order.total}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#D0D5DD]" />
                        <span className="text-[11px] text-[#667085]">
                          {order.actualDelivery ? new Date(order.actualDelivery).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
