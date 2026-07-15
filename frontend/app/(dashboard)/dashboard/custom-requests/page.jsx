"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { X, Eye, ClipboardList, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
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
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
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

  const filteredRequests = activeTab === "ALL" ? requests : requests.filter((r) => r.status === activeTab);
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/custom-requests/${id}/status`, { status });
      toast.success("Status updated");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.allCustomRequests}</h1>

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
                <th className="px-4 py-3 font-medium">Product</th>
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
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.noCustomRequests}</td></tr>
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
                            <button onClick={async () => { await api.put(`/custom-requests/${req.id}/payment-status`, { paymentStatus: "PAID" }); toast.success("Marked as paid"); fetchRequests(); }}
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
              <div className="text-sm"><span className="text-gray-500">Payment:</span> <span className={`px-2 py-0.5 rounded text-xs font-medium ${selectedRequest.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{selectedRequest.paymentStatus || "UNPAID"}</span></div>
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
