"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { ALL_DISTRICTS } from "@/lib/constants";
import { Search, Eye, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { printInvoice } from "@/lib/generateInvoice";
import Pagination from "@/components/ui/Pagination";
import { useLanguage } from "@/i18n/LanguageContext";
import { statusColors, paymentStatusColors, ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orderConstants";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/OrderStatusBadge";
import OrderDetailModal from "@/components/admin/OrderDetailModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { t, language } = useLanguage();
  const ITEMS_PER_PAGE = 10;

  useEffect(() => { fetchOrders(); }, [districtFilter, search]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (districtFilter) params.set("district", districtFilter);
      if (search) params.set("search", search);
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await api.get(`/orders/admin/all${query}`);
      setOrders(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});

  const filtered = statusFilter
    ? orders.filter((o) => o.orderStatus === statusFilter)
    : orders;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, districtFilter]);

  const updateStatus = async (orderId, newStatus, paymentStatus) => {
    const order = orders.find(o => o.id === orderId);
    const label = newStatus ? newStatus.replace(/_/g, " ") : paymentStatus;
    if (!confirm(`Change ${newStatus ? "status" : "payment"} to "${label}"?`)) return;
    try {
      const body = {};
      if (newStatus) body.status = newStatus;
      if (paymentStatus) body.paymentStatus = paymentStatus;
      await api.put(`/orders/${orderId}/status`, body);
      toast.success(t.statusUpdated);
      fetchOrders();
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.orders}</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:border-[#EC008C] transition"
          />
        </div>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:border-[#EC008C] transition"
        >
          <option value="">{t.allDistricts}</option>
          {ALL_DISTRICTS.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
        </select>
        <div className="flex flex-wrap gap-1.5">
          {ORDER_STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${statusFilter === s ? "bg-primary-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
              {s ? s.replace(/_/g, " ") : t.all} ({s ? (statusCounts[s] || 0) : orders.length})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">#</th>
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
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">{t.loading}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">{t.noOrdersFound}</td></tr>
              ) : (
                paginated.map((order, idx) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
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
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updateStatus(order.id, null, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${paymentStatusColors[order.paymentStatus] || ""}`}
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
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
                        <button onClick={() => setSelectedOrder(order)} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => printInvoice(order, language)} className="text-gray-500 hover:text-gray-700 cursor-pointer" title={language === "bn" ? "ইনভয়েস প্রিন্ট করুন" : t.printInvoice}>
                          <Printer size={16} />
                        </button>
                        <button onClick={() => printInvoice(order, language === "en" ? "bn" : "en")} className="text-[10px] font-semibold text-gray-400 hover:text-[#EC008C] cursor-pointer px-1" title={language === "en" ? "বাংলায় প্রিন্ট" : "Print in English"}>
                          {language === "en" ? "বাং" : "EN"}
                        </button>
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
