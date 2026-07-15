"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { X, Truck, Search, Package, Clock, CheckCircle, MapPin, Phone, User, ChevronDown, RefreshCw, Printer, Banknote, Calendar } from "lucide-react";
import { printInvoice } from "@/lib/generateInvoice";
import { useLanguage } from "@/i18n/LanguageContext";
import { paymentStatusColors } from "@/lib/orderConstants";
import Pagination from "@/components/ui/Pagination";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED: "bg-gray-100 text-gray-700",
};

export default function ManagerOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riders, setRiders] = useState([]);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [approvingPayment, setApprovingPayment] = useState(null);
  const ITEMS_PER_PAGE = 10;
  useEffect(() => { fetchOrders(); fetchRiders(); }, []);

  const statusLabels = {
    PENDING: t.pending,
    CONFIRMED: t.confirmed,
    PROCESSING: t.processing,
    SHIPPED: t.shipped,
    OUT_FOR_DELIVERY: t.outForDelivery,
    DELIVERED: t.delivered,
    CANCELLED: t.cancelled,
    RETURNED: t.returned,
  };

  const filterTabs = [
    { key: "ALL", label: t.all },
    { key: "PENDING", label: t.pending },
    { key: "CONFIRMED", label: t.confirmed },
    { key: "PROCESSING", label: t.processing },
    { key: "SHIPPED", label: t.shipped },
    { key: "OUT_FOR_DELIVERY", label: t.outForDelivery },
    { key: "DELIVERED", label: t.delivered },
    { key: "CANCELLED", label: t.cancelled },
    { key: "RETURNED", label: t.returned },
  ];

  useEffect(() => { fetchOrders(); fetchRiders(); }, []);

  useEffect(() => {
    const debounce = setTimeout(() => { fetchOrders(); }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.get(`/orders/manager/local${params}`);
      setOrders(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchRiders = async () => {
    try { const res = await api.get("/riders"); setRiders(res.data.data || []); }
    catch (err) { console.error(err); }
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingStatus(orderId);
    try { await api.put(`/orders/${orderId}/status`, { status }); toast.success(t.statusUpdatedSuccess); fetchOrders(); }
    catch (err) { toast.error(t.failedToUpdate); }
    finally { setUpdatingStatus(null); }
  };

  const openRiderModal = (order) => {
    setSelectedOrder(order);
    setShowRiderModal(true);
  };

  const assignRider = async (riderId) => {
    try {
      await api.put(`/orders/${selectedOrder.id}/assign-rider`, { riderId });
      toast.success(t.riderAssignedSuccess);
      setShowRiderModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error(t.riderAssignError);
    }
  };

  const approvePayment = async (orderId) => {
    setApprovingPayment(orderId);
    try {
      await api.put(`/orders/${orderId}/approve-payment`);
      toast.success(t.paymentApprovedSuccess);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || t.failedToApprovePayment);
    } finally {
      setApprovingPayment(null);
    }
  };

  const filtered = orders.filter((o) => filter === "ALL" || o.orderStatus === filter);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search, filter]);

  const stats = {
    total: orders.length,
    delivered: orders.filter((o) => o.orderStatus === "DELIVERED").length,
    totalSell: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    todayOrders: orders.filter((o) => {
      const d = new Date(o.createdAt);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    todayDelivery: orders.filter((o) => {
      if (!o.actualDelivery) return false;
      const d = new Date(o.actualDelivery);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && o.orderStatus === "DELIVERED";
    }).length,
    todaySales: orders.filter((o) => {
      if (o.orderStatus !== "DELIVERED" || !o.actualDelivery) return false;
      const d = new Date(o.actualDelivery);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, o) => sum + (o.total || 0), 0),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B]">{t.localOrders}</h1>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 text-[11px] text-[#667085] hover:text-[#EC008C] transition">
          <RefreshCw size={14} /> {t.refresh}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4">
        {[
          { label: t.totalOrders, value: stats.total, icon: Package, color: "text-[#00AFCC] bg-[#E8F4F8]" },
          { label: t.delivered, value: stats.delivered, icon: CheckCircle, color: "text-green-500 bg-green-50" },
          { label: "Total Sell", value: `৳${stats.totalSell.toLocaleString()}`, icon: Banknote, color: "text-[#8B5CF6] bg-purple-50" },
          { label: t.todayOrders, value: stats.todayOrders, icon: Clock, color: "text-[#D4A017] bg-[#FFF8E1]" },
          { label: t.todayDelivery, value: stats.todayDelivery, icon: Truck, color: "text-orange-500 bg-orange-50" },
          { label: t.todaySales, value: `৳${stats.todaySales.toLocaleString()}`, icon: Banknote, color: "text-[#EC008C] bg-pink-50" },
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

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-lg p-3 mb-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#000000] text-xs">Order Status Overview</h3>
          <span className="text-[10px] text-[#667085]">Total: {filtered.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition ${
              filter === "ALL" ? "bg-[#EC008C] text-white" : "bg-white text-[#667085] hover:bg-[#F4F7FB] border border-[#E5E7EB]"
            }`}
          >
            All
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${filter === "ALL" ? "bg-white/20" : "bg-[#F4F7FB]"}`}>
              {orders.length}
            </span>
          </button>
          {filterTabs.filter(t => t.key !== "ALL").map((tab) => {
            const count = orders.filter((o) => o.orderStatus === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(filter === tab.key ? "ALL" : tab.key)}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition ${
                  filter === tab.key ? "bg-[#EC008C] text-white ring-2 ring-offset-1" : "bg-white text-[#667085] hover:bg-[#F4F7FB] border border-[#E5E7EB]"
                }`}
              >
                {tab.label}
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${filter === tab.key ? "bg-white/30" : "bg-[#F4F7FB]"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-[11px] sm:text-xs focus:outline-none focus:border-[#EC008C] transition"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="text-left text-[10px] sm:text-[11px] text-[#667085] border-b border-[#E5E7EB]">
              <th className="px-3 py-2.5 font-medium">#</th>
              <th className="px-3 py-2.5 font-medium">{t.orderHash}</th>
              <th className="px-3 py-2.5 font-medium">{t.customer}</th>
              <th className="px-3 py-2.5 font-medium">{t.date}</th>
              <th className="px-3 py-2.5 font-medium">{t.items}</th>
              <th className="px-3 py-2.5 font-medium">{t.total}</th>
              <th className="px-3 py-2.5 font-medium">{t.paymentStatusLabel}</th>
              <th className="px-3 py-2.5 font-medium">{t.status}</th>
              <th className="px-3 py-2.5 font-medium">{t.rider}</th>
              <th className="px-3 py-2.5 font-medium text-right">{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="px-3 py-8 text-center text-[11px] text-gray-400">{t.loadingOrders}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={10} className="px-3 py-8 text-center text-[11px] text-gray-400">
                <Package size={24} className="mx-auto mb-2 text-gray-300" />
                <p>{search ? t.noSearchResults : t.noOrdersFound}</p>
              </td></tr>
            ) : (
              paginated.map((order, idx) => (
                <tr key={order.id} className="border-b border-[#F4F7FB] hover:bg-[#F4F7FB] transition">
                  <td className="px-3 py-2.5 text-[10px] sm:text-[11px] text-[#667085]">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td className="px-3 py-2.5 font-medium text-[#EC008C] text-[11px] sm:text-xs">{order.orderNumber}</td>
                  <td className="px-3 py-2.5">
                    <p className="text-[11px] sm:text-xs text-[#000000] font-medium">{order.user?.name}</p>
                    <p className="text-[10px] text-[#667085] flex items-center gap-1 mt-0.5">
                      <Phone size={9} />{order.user?.phone || t.notAvailable}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] sm:text-[11px] text-[#667085]">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      <span>{new Date(order.createdAt).toLocaleDateString("en-BD")}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] sm:text-xs text-[#000000]">{order.items?.length || 0}</td>
                  <td className="px-3 py-2.5 text-[11px] sm:text-xs font-semibold text-[#000000]">৳{order.total}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold ${paymentStatusColors[order.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                        {order.paymentStatus}
                      </span>
                      {order.paymentMethod === "COD" && order.orderStatus === "DELIVERED" && order.paymentStatus === "PENDING" && (
                        <button
                          onClick={() => approvePayment(order.id)}
                          disabled={approvingPayment === order.id}
                          className="flex items-center gap-1 text-[10px] sm:text-[11px] bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <Banknote size={10} />
                          {approvingPayment === order.id ? t.approving : t.approve}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      disabled={updatingStatus === order.id}
                      className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold border-0 cursor-pointer focus:outline-none ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-600"}`}
                    >
                      {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"].map((s) => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    {order.rider ? (
                      <span className="text-[10px] sm:text-[11px] text-green-600 font-medium flex items-center gap-1">
                        <Truck size={10} /> {order.rider?.user?.name || t.assigned}
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] text-[#667085]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => printInvoice(order)} className="p-1.5 text-[#667085] hover:text-[#00215B] hover:bg-[#F4F7FB] rounded-lg transition" title={t.printInvoice}>
                        <Printer size={14} />
                      </button>
                      {!order.riderId && order.orderStatus !== "DELIVERED" && order.orderStatus !== "CANCELLED" && (
                        <button onClick={() => openRiderModal(order)}
                          className="flex items-center gap-1 text-[10px] sm:text-[11px] bg-[#00215B] text-white px-3 py-1.5 rounded-lg hover:bg-[#001A4A] transition">
                          <Truck size={11} /> {t.assignRider}
                        </button>
                      )}
                      {order.riderId && (
                        <span className="text-[10px] sm:text-[11px] text-green-600 font-medium">{t.assigned}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />

      {/* Rider Assignment Modal */}
      {showRiderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRiderModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-[#E5E7EB]">
              <div>
                <h3 className="font-bold text-[#00215B] text-sm">{t.assignRider}</h3>
                <p className="text-[10px] text-[#667085] mt-0.5">{selectedOrder.orderNumber} — ৳{selectedOrder.total}</p>
              </div>
              <button onClick={() => setShowRiderModal(false)} className="p-1 hover:bg-[#F4F7FB] rounded-lg transition">
                <X size={18} className="text-[#667085]" />
              </button>
            </div>
            <div className="p-3 overflow-y-auto max-h-[60vh]">
              {riders.length === 0 ? (
                <div className="text-center py-8">
                  <Truck size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-[11px] text-gray-400">{t.noRidersAvailable}</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {riders.map((rider) => (
                    <div key={rider.id} className="flex items-center justify-between p-2.5 border border-[#E5E7EB] rounded-lg hover:bg-[#F4F7FB] transition group">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#FCE8F3] rounded-full flex items-center justify-center">
                          <User size={14} className="text-[#EC008C]" />
                        </div>
                        <div>
                          <p className="text-[11px] sm:text-xs font-medium text-[#000000]">{rider.user?.name}</p>
                          <p className="text-[10px] text-[#667085]">
                            {rider.vehicleType || "Bike"} · {rider.totalDeliveries} deliveries
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${rider.isAvailable ? "bg-green-500" : "bg-gray-400"}`}></span>
                        <button onClick={() => assignRider(rider.id)}
                          className="bg-[#00215B] text-white px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold hover:bg-[#001A4A] transition">
                          {t.assign}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
