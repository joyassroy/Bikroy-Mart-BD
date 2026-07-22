"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { DollarSign, ShoppingCart, Truck, Clock, ArrowLeft, Search, Eye, Printer } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import Pagination from "@/components/ui/Pagination";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/OrderStatusBadge";
import OrderDetailModal from "@/components/admin/OrderDetailModal";
import { printInvoice } from "@/lib/generateInvoice";

export default function TodaySalesPage() {
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
        api.get("/orders/admin/all"),
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
    ? orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.phone?.includes(search)
      )
    : orders;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const todayRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

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

      <h1 className="text-2xl font-bold text-gray-800 mb-4">{t.todaySales}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t.todaySales}</p>
              <p className="text-2xl font-bold text-pink-600 mt-1">৳{todayRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-pink-50 p-2.5 rounded-lg"><DollarSign size={20} className="text-pink-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t.todayDelivered || "Today Delivered"}</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats?.todayDeliveredOrders || 0}</p>
            </div>
            <div className="bg-green-50 p-2.5 rounded-lg"><Truck size={20} className="text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t.pendingToday || "Pending Today"}</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats?.todayPendingOrders || 0}</p>
            </div>
            <div className="bg-yellow-50 p-2.5 rounded-lg"><Clock size={20} className="text-yellow-600" /></div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder || "Search orders..."}
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
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">{t.customer || "Customer"}</th>
                <th className="px-4 py-3 font-medium">{t.items || "Items"}</th>
                <th className="px-4 py-3 font-medium">{t.total}</th>
                <th className="px-4 py-3 font-medium">{t.payment || "Payment"}</th>
                <th className="px-4 py-3 font-medium">{t.status || "Status"}</th>
                <th className="px-4 py-3 font-medium">{t.date || "Date"}</th>
                <th className="px-4 py-3 font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">{t.loading || "Loading..."}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">{t.noOrdersFound || "No orders found"}</td></tr>
              ) : (
                paginated.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#EC008C]">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <p>{order.user?.name}</p>
                      <p className="text-xs text-gray-400">{order.user?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm" title={order.items?.map(i => i.product?.name).join(", ")}>
                      {getItemSummary(order.items)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">৳{order.total?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.orderStatus} />
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
