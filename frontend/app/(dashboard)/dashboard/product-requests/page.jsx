"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { X, Eye, ClipboardList, Truck, CheckCircle, XCircle, Clock, ShoppingCart, Package, Users, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { useLanguage } from "@/i18n/LanguageContext";

const STATUS_CONFIG = {
  PENDING: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
  MANAGER_REVIEW: { color: "bg-blue-100 text-blue-700", label: "Under Review" },
  PRICING_SET: { color: "bg-purple-100 text-purple-700", label: "Price Quoted" },
  CUSTOMER_APPROVED: { color: "bg-green-100 text-green-700", label: "Approved" },
  CUSTOMER_REJECTED: { color: "bg-red-100 text-red-700", label: "Rejected" },
  PROCESSING: { color: "bg-indigo-100 text-indigo-700", label: "Processing" },
  SHIPPED: { color: "bg-orange-100 text-orange-700", label: "Shipped" },
  OUT_FOR_DELIVERY: { color: "bg-orange-100 text-orange-700", label: "Out for Delivery" },
  DELIVERED: { color: "bg-green-100 text-green-700", label: "Delivered" },
  CANCELLED: { color: "bg-red-100 text-red-700", label: "Cancelled" },
};

const TABS = ["ALL", "PENDING", "MANAGER_REVIEW", "CUSTOMER_APPROVED", "PROCESSING", "DELIVERED"];

export default function AdminCustomRequestsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [activePeriod, setActivePeriod] = useState("all");
  const ITEMS_PER_PAGE = 10;

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchStats(); }, [activePeriod]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/custom-requests/admin/all");
      setRequests(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get(`/analytics/stats?period=${activePeriod}`);
      setStats(data.data || {});
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = activeTab === "ALL" ? requests : requests.filter((r) => r.status === activeTab);
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/custom-requests/${id}/status`, { status });
      toast.success("Status updated");
      fetchAll();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const statCards = [
    { label: t.totalOrders, value: stats?.totalOrders?.toLocaleString() || "0", icon: ShoppingCart, color: "text-[#EC008C] bg-[#FCE8F3]" },
    { label: t.totalProducts, value: stats?.totalProducts?.toLocaleString() || "0", icon: Package, color: "text-[#00AFCC] bg-[#E8F4F8]" },
    { label: t.totalUsers, value: stats?.totalUsers?.toLocaleString() || "0", icon: Users, color: "text-[#00215B] bg-[#E8EDF5]" },
    { label: t.revenue, value: `৳${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-[#D4A017] bg-[#FFF8E1]" },
  ];

  const periodCards = [
    { label: t.totalOrders, value: stats?.periodOrders?.toLocaleString() || "0", icon: ShoppingCart, color: "text-[#EC008C] bg-[#FCE8F3]" },
    { label: t.todayDelivered, value: stats?.periodDelivered?.toLocaleString() || "0", icon: Truck, color: "text-[#10B981] bg-[#ECFDF5]" },
    { label: t.todaySales, value: `৳${(stats?.periodSales || 0).toLocaleString()}`, icon: DollarSign, color: "text-[#EC008C] bg-[#FCE8F3]" },
    { label: t.totalSell || "Total Sell", value: `৳${(stats?.periodSell || 0).toLocaleString()}`, icon: TrendingUp, color: "text-[#7C3AED] bg-[#F3E8FF]" },
  ];

  const periodLabels = { today: "Today", week: "This Week", month: "This Month", all: "All Time" };

  const orderStatusCounts = [
    { label: "All", status: "", count: stats?.totalOrders || 0, color: "bg-gray-100 text-gray-700" },
    { label: "Pending", status: "PENDING", count: stats?.pendingOrders || 0, color: "bg-[#FFF8E1] text-[#D4A017]" },
    { label: "Confirmed", status: "CONFIRMED", count: stats?.confirmedOrders || 0, color: "bg-[#E8F4F8] text-[#00AFCC]" },
    { label: "Processing", status: "PROCESSING", count: stats?.processingOrders || 0, color: "bg-[#E8EDF5] text-[#2E4B8A]" },
    { label: "Shipped", status: "SHIPPED", count: stats?.shippedOrders || 0, color: "bg-[#F3E8FF] text-[#7C3AED]" },
    { label: "Out for Delivery", status: "OUT_FOR_DELIVERY", count: stats?.outForDeliveryOrders || 0, color: "bg-[#FFF0F0] text-[#FF6B6B]" },
    { label: "Delivered", status: "DELIVERED", count: stats?.deliveredOrders || 0, color: "bg-green-50 text-green-700" },
    { label: "Cancelled", status: "CANCELLED", count: stats?.cancelledOrders || 0, color: "bg-red-50 text-red-500" },
    { label: "Returned", status: "RETURNED", count: stats?.returnedOrders || 0, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div>
      <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B] mb-3">{t.allProductRequests}</h1>

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

      <div className="flex flex-wrap gap-1.5 mb-4">
        {Object.entries(periodLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActivePeriod(key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition cursor-pointer ${
              activePeriod === key ? "bg-[#EC008C] text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-[#E5E7EB]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {periodCards.map((stat) => (
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

      <div className="flex flex-wrap gap-2 mb-4">
        {orderStatusCounts.map((s) => (
          <button
            key={s.label}
            onClick={() => router.push(`/dashboard/orders${s.status ? `?status=${s.status}` : ""}`)}
            className={`${s.color} hover:opacity-80 px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition cursor-pointer`}
          >
            {s.label} {s.count}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${activeTab === tab ? "bg-[#EC008C] text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
            {tab === "ALL" ? "All" : STATUS_CONFIG[tab]?.label || tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Request #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">{t.productName}</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.loading}</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.noProductRequests}</td></tr>
              ) : (
                paginatedRequests.map((req) => {
                  const st = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={req.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-sm text-[#00215B]">{req.requestNumber}</td>
                      <td className="px-4 py-3 text-sm">{req.user?.name}</td>
                      <td className="px-4 py-3 text-sm">{req.productName}</td>
                      <td className="px-4 py-3 text-sm">{req.quantity} {req.unit}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${req.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {req.paymentStatus || "UNPAID"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => setSelectedRequest(req)} title="View"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                            <Eye size={14} />
                          </button>
                          {req.status === "DELIVERED" && req.paymentStatus !== "PAID" && (
                            <button onClick={async () => { await api.put(`/custom-requests/${req.id}/payment-status`, { paymentStatus: "PAID" }); toast.success("Marked as paid"); fetchAll(); }}
                              title="Mark Paid" className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition">
                              <CheckCircle size={14} />
                            </button>
                          )}
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

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredRequests.length} itemsPerPage={ITEMS_PER_PAGE} />

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-[#00215B]">{t.viewRequest}</h3>
              <button onClick={() => setSelectedRequest(null)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Request #</span><span className="font-medium">{selectedRequest.requestNumber}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Customer</span><span className="font-medium">{selectedRequest.user?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Phone</span><span className="font-medium">{selectedRequest.user?.phone}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Product</span><span className="font-medium">{selectedRequest.productName}</span></div>
              {selectedRequest.description && <div className="text-sm"><span className="text-gray-500">Description:</span><p className="mt-1">{selectedRequest.description}</p></div>}
              <div className="flex justify-between text-sm"><span className="text-gray-500">Quantity</span><span className="font-medium">{selectedRequest.quantity} {selectedRequest.unit}</span></div>
              {selectedRequest.quotedPrice != null && (
                <div className="bg-purple-50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Quoted Price</span><span className="font-medium">৳{selectedRequest.quotedPrice}/{selectedRequest.unit}</span></div>
                  {selectedRequest.deliveryCharge > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery</span><span>৳{selectedRequest.deliveryCharge}</span></div>}
                  <div className="flex justify-between text-sm font-bold border-t pt-1"><span>Total</span><span className="text-[#EC008C]">৳{selectedRequest.totalAmount}</span></div>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment:</span>
                <div className="flex gap-1.5">
                  {["UNPAID", "PAID", "REFUNDED"].map((status) => (
                    <button
                      key={status}
                      onClick={async () => {
                        try {
                          await api.put(`/custom-requests/${selectedRequest.id}/payment-status`, { paymentStatus: status });
                          toast.success(`Payment marked as ${status}`);
                          setSelectedRequest({ ...selectedRequest, paymentStatus: status });
                          fetchAll();
                        } catch (err) {
                          toast.error("Failed to update payment status");
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                        (selectedRequest.paymentStatus || "UNPAID") === status
                          ? status === "PAID" ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                          : status === "REFUNDED" ? "bg-orange-100 text-orange-700 ring-1 ring-orange-300"
                          : "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-sm"><span className="text-gray-500">Delivery:</span><p className="mt-1">{selectedRequest.deliveryAddress}, {selectedRequest.deliveryUpazila}, {selectedRequest.deliveryDistrict}</p></div>
              {selectedRequest.images?.length > 0 && (
                <div><span className="text-gray-500 text-sm">Images:</span><div className="flex gap-2 mt-1 flex-wrap">{selectedRequest.images.map((img, i) => <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border" />)}</div></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
