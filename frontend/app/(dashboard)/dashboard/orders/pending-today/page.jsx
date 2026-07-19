"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Search, Eye, Printer, Clock, ShoppingCart, DollarSign, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { printInvoice } from "@/lib/generateInvoice";
import Pagination from "@/components/ui/Pagination";
import { useLanguage } from "@/i18n/LanguageContext";
import { statusColors, paymentStatusColors, ORDER_STATUSES } from "@/lib/orderConstants";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/OrderStatusBadge";
import OrderDetailModal from "@/components/admin/OrderDetailModal";

export default function PendingTodayPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { t, language } = useLanguage();
  const ITEMS_PER_PAGE = 10;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get("/analytics/stats"),
        api.get("/orders/admin/all?status=PENDING"),
      ]);
      setStats(statsRes.data.data);
      const allOrders = ordersRes.data.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setOrders(allOrders.filter(o => new Date(o.createdAt) >= today));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = search
    ? orders.filter(o => o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.user?.name?.toLowerCase().includes(search.toLowerCase()))
    : orders;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const updateStatus = async (orderId, newStatus) => {
    if (!confirm(`Change status to "${newStatus.replace(/_/g, " ")}"?`)) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(t.statusUpdated);
      fetchData();
    } catch (err) { toast.error(t.failedToUpdate); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("en-BD", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const getItemSummary = (items) => {
    if (!items || items.length === 0) return "-";
    if (items.length === 1) return items[0].product?.name || "-";
    return `${items[0].product?.name || ""} +${items.length - 1}`;
  };

  return (
    <div>
      <Link href="/dashboard/orders" className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#EC008C] mb-3 transition">
        <ArrowLeft size={14} /> {t.allOrders}
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-4">{t.pendingToday}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t.pendingToday}</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats?.todayPendingOrders || 0}</p>
            </div>
            <div className="bg-yellow-50 p-2.5 rounded-lg"><Clock size={20} className="text-yellow-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t.todaySales}</p>
              <p className="text-2xl font-bold text-pink-600 mt-1">৳{(stats?.todaySales || 0).toLocaleString()}</p>
            </div>
            <div className="bg-pink-50 p-2.5 rounded-lg"><DollarSign size={20} className="text-pink-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t.totalOrders}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats?.totalOrders || 0}</p>
            </div>
            <div className="bg-indigo-50 p-2.5 rounded-lg"><Package size={20} className="text-indigo-600" /></div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:border-[#EC008C] transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">{t.orderHash}</th>
                <th className="px-4 py-3 font-medium">{t.customer}</th>
                <th className="px-4 py-3 font-medium">{t.items}</th>
                <th className="px-4 py-3 font-medium">{t.total}</th>
                <th className="px-4 py-3 font-medium">{t.payment}</th>
                <th className="px-4 py-3 font-medium">{t.status}</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">{t.loading}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">{t.noOrdersFound}</td></tr>
              ) : (
                paginated.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-primary-600">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <p>{order.user?.name}</p>
                      <p className="text-xs text-gray-400">{order.user?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm" title={order.items?.map(i => i.product?.name).join(", ")}>
                      {getItemSummary(order.items)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">৳{order.total}</td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <select value={order.orderStatus} onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${statusColors[order.orderStatus] || ""}`}>
                        {ORDER_STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="text-blue-500 hover:text-blue-700 cursor-pointer"><Eye size={16} /></button>
                        <button onClick={() => printInvoice(order, language)} className="text-gray-500 hover:text-gray-700 cursor-pointer"><Printer size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
