"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { CheckCircle, Package, Search, TrendingUp, Calendar, Printer, X, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { printInvoice } from "@/lib/generateInvoice";
import Pagination from "@/components/ui/Pagination";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function RiderHistoryPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

  const filtered = search
    ? orders.filter((o) => (o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.user?.name?.toLowerCase().includes(search.toLowerCase())))
    : orders;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search]);

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
          <table className="w-full min-w-[580px]">
            <thead>
              <tr className="text-left bg-[#F9FAFB]">
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">{t.orderNumber || "Order #"}</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">{t.customer || "Customer"}</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">{t.items || "Items"}</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">{t.total || "Total"}</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider">{t.deliveredOn || "Delivered On"}</th>
                <th className="px-5 py-3 text-[10px] sm:text-[11px] text-[#667085] font-semibold uppercase tracking-wider text-right">{t.printInvoice || "Print"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F7FB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#F4F7FB] flex items-center justify-center mx-auto mb-3">
                      <Package size={24} className="text-[#D0D5DD]" />
                    </div>
                    <p className="text-sm font-medium text-[#667085]">{search ? (t.noSearchResults || "No orders match your search") : (t.noDeliveryHistory || "No delivery history yet")}</p>
                    <p className="text-[11px] text-[#D0D5DD] mt-1">{search ? (t.tryDifferentSearch || "Try a different search term") : (t.completedDeliveriesWillAppear || "Completed deliveries will appear here")}</p>
                  </td>
                </tr>
              ) : (
                paginated.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
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
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); printInvoice(order); }}
                        className="p-1.5 text-[#667085] hover:text-[#00215B] hover:bg-[#F4F7FB] rounded-lg transition"
                        title={t.printInvoice || "Print Invoice"}
                      >
                        <Printer size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="font-bold text-[#00215B] text-base">{t.orderDetails || "Order Details"}</h2>
                <p className="text-[11px] text-[#667085] mt-0.5">{selectedOrder.orderNumber} — ৳{selectedOrder.total}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[selectedOrder.orderStatus] || "bg-gray-100 text-gray-700"}`}>
                  {selectedOrder.orderStatus?.replace(/_/g, " ")}
                </span>
                <span className="text-[11px] text-[#667085]">
                  {selectedOrder.actualDelivery ? new Date(selectedOrder.actualDelivery).toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" }) : ""}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-[#F4F7FB] rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-[#667085]">{t.customer || "Customer"}</p>
                    <p className="text-xs font-medium text-[#000000]">{selectedOrder.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#667085]">{t.phone || "Phone"}</p>
                    <a href={`tel:${selectedOrder.user?.phone}`} className="text-xs font-semibold text-[#EC008C] hover:underline">{selectedOrder.user?.phone}</a>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-[#667085]">{t.deliveryAddress || "Address"}</p>
                    <p className="text-xs font-medium text-[#000000]">{selectedOrder.deliveryAddress}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#667085]">{t.district || "District"}</p>
                    <p className="text-xs font-medium text-[#000000]">{selectedOrder.deliveryDistrict}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#667085]">{t.paymentMethod || "Payment"}</p>
                    <p className="text-xs font-medium text-[#000000]">{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-medium text-[#000000] mb-2">{t.items || "Items"} ({selectedOrder.items?.length || 0})</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#F4F7FB] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#F4F7FB] flex items-center justify-center text-[10px] font-bold text-[#667085]">
                          <Package size={12} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#000000]">{item.product?.name}</p>
                          <p className="text-[10px] text-[#667085]">× {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-[#000000]">৳{item.totalPrice}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Requirement */}
              {selectedOrder.customRequirement && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                  <p className="text-[10px] text-amber-700 font-semibold">{t.customRequirement || "Custom Requirement"}</p>
                  <p className="text-xs text-amber-800 mt-1">{selectedOrder.customRequirement}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 flex gap-2">
              <button onClick={() => printInvoice(selectedOrder)} className="flex-1 flex items-center justify-center gap-2 bg-[#00215B] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#001845] transition">
                <Printer size={14} /> {t.printInvoice || "Print Invoice"}
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
                {t.close || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
