"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Search, Eye, Printer, Clock, ArrowLeft, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { printInvoice } from "@/lib/generateInvoice";
import Pagination from "@/components/ui/Pagination";
import { useLanguage } from "@/i18n/LanguageContext";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function ManagerPendingTodayPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useLanguage();
  const ITEMS_PER_PAGE = 10;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get("/managers/stats"),
        api.get("/orders/manager/local"),
      ]);
      setStats(statsRes.data.data);
      const allOrders = ordersRes.data.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setOrders(allOrders.filter(o => new Date(o.createdAt) >= today && o.orderStatus === "PENDING"));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = search
    ? orders.filter(o => o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.user?.name?.toLowerCase().includes(search.toLowerCase()))
    : orders;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <Link href="/manager/orders" className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#EC008C] mb-3 transition">
        <ArrowLeft size={14} /> {t.allOrders}
      </Link>

      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B]">{t.pendingToday}</h1>
        <button onClick={fetchData} className="flex items-center gap-1.5 text-[11px] text-[#667085] hover:text-[#EC008C] transition">
          <RefreshCw size={14} /> {t.refresh}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {[
          { label: t.pendingToday, value: stats?.todayPendingOrders || 0, icon: Clock, color: "text-[#D4A017] bg-[#FFF8E1]" },
          { label: t.todayOrders, value: stats?.todayOrders || 0, icon: Clock, color: "text-[#7C3AED] bg-[#F3E8FF]" },
          { label: t.todayDelivered, value: stats?.todayDeliveredOrders || 0, icon: Clock, color: "text-[#10B981] bg-[#ECFDF5]" },
          { label: t.todaySales, value: `৳${(stats?.todaySales || 0).toLocaleString()}`, icon: Clock, color: "text-[#EC008C] bg-[#FCE8F3]" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg p-2.5 sm:p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-[11px] text-[#667085]">{s.label}</p>
                <p className="text-base sm:text-lg font-bold text-[#000000] mt-0.5">{s.value}</p>
              </div>
              <div className={`${s.color} p-2 rounded-lg flex-shrink-0`}>
                <s.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-[11px] sm:text-xs focus:outline-none focus:border-[#EC008C] transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="text-left text-[10px] sm:text-[11px] text-[#667085] border-b border-[#E5E7EB]">
              <th className="px-3 py-2.5 font-medium">{t.orderHash}</th>
              <th className="px-3 py-2.5 font-medium">{t.customer}</th>
              <th className="px-3 py-2.5 font-medium">{t.items}</th>
              <th className="px-3 py-2.5 font-medium">{t.total}</th>
              <th className="px-3 py-2.5 font-medium">{t.status}</th>
              <th className="px-3 py-2.5 font-medium text-right">{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-[11px] text-gray-400">{t.loading}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-[11px] text-gray-400">{t.noOrdersFound}</td></tr>
            ) : (
              paginated.map((order) => (
                <tr key={order.id} className="border-b border-[#F4F7FB] hover:bg-[#F4F7FB] transition">
                  <td className="px-3 py-2.5 font-medium text-[#EC008C] text-[11px] sm:text-xs">{order.orderNumber}</td>
                  <td className="px-3 py-2.5 text-[11px] sm:text-xs text-[#000000]">{order.user?.name}</td>
                  <td className="px-3 py-2.5 text-[11px] sm:text-xs text-[#000000]">{order.items?.length}</td>
                  <td className="px-3 py-2.5 text-[11px] sm:text-xs font-medium text-[#000000]">৳{order.total}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[order.orderStatus] || ""}`}>{order.orderStatus}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-[#667085] hover:text-[#00215B] hover:bg-[#F4F7FB] rounded-lg transition"><Eye size={14} /></button>
                      <button onClick={() => printInvoice(order)} className="p-1.5 text-[#667085] hover:text-[#00215B] hover:bg-[#F4F7FB] rounded-lg transition"><Printer size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold text-[#00215B] mb-4">{t.orderHash}{selectedOrder.orderNumber}</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-[#667085]">{t.customerLabel}</span> {selectedOrder.user?.name}</p>
              <p><span className="text-[#667085]">{t.phoneLabel}</span> {selectedOrder.user?.phone}</p>
              <p><span className="text-[#667085]">{t.addressLabel}</span> {selectedOrder.deliveryAddress}</p>
              <p><span className="text-[#667085]">{t.totalLabel}</span> ৳{selectedOrder.total}</p>
              <div className="border-t border-[#E5E7EB] pt-2 mt-2">
                <p className="font-medium">{t.itemsLabel}</p>
                {selectedOrder.items?.map((item) => (
                  <p key={item.id}>{item.product?.name} × {item.quantity} = ৳{item.totalPrice}</p>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => printInvoice(selectedOrder)} className="flex-1 flex items-center justify-center gap-2 bg-[#00215B] text-white py-2 rounded-lg text-sm hover:bg-[#001A4A] transition">
                <Printer size={14} /> {t.printInvoice || "Print Invoice"}
              </button>
              <button onClick={() => { window.location.href = `/track-order?order=${selectedOrder.orderNumber}`; }} className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#E5E7EB] text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                <ExternalLink size={14} /> Track Order
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 bg-gray-100 py-2 rounded-lg text-sm hover:bg-gray-200">{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
