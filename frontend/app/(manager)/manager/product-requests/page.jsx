"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { X, Eye, ClipboardList, Truck, CheckCircle, Clock, DollarSign, ShoppingCart, Printer, User, MapPin, CreditCard, Package, StickyNote, ExternalLink } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { printCustomRequestInvoice } from "@/lib/generateInvoice";
import { useLanguage } from "@/i18n/LanguageContext";
import OrderStatusStepper from "@/components/admin/OrderStatusStepper";
import { PaymentStatusBadge } from "@/components/admin/OrderStatusBadge";

const STATUS_CONFIG = {
  PENDING: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
  MANAGER_REVIEW: { color: "bg-blue-100 text-blue-700", label: "Under Review" },
  PRICING_SET: { color: "bg-purple-100 text-purple-700", label: "Price Quoted" },
  CUSTOMER_APPROVED: { color: "bg-green-100 text-green-700", label: "Approved" },
  CUSTOMER_REJECTED: { color: "bg-red-100 text-red-700", label: "Rejected" },
  CONFIRMED: { color: "bg-blue-100 text-blue-700", label: "Confirmed" },
  PROCESSING: { color: "bg-indigo-100 text-indigo-700", label: "Processing" },
  SHIPPED: { color: "bg-purple-100 text-purple-700", label: "Shipped" },
  OUT_FOR_DELIVERY: { color: "bg-orange-100 text-orange-700", label: "Out for Delivery" },
  DELIVERED: { color: "bg-green-100 text-green-700", label: "Delivered" },
  CANCELLED: { color: "bg-red-100 text-red-700", label: "Cancelled" },
  RETURNED: { color: "bg-gray-100 text-gray-700", label: "Returned" },
};

const TABS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "MANAGER_REVIEW", label: "Under Review" },
  { key: "PRICING_SET", label: "Price Quoted" },
  { key: "CUSTOMER_APPROVED", label: "Approved" },
  { key: "CUSTOMER_REJECTED", label: "Rejected" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function ManagerProductRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [riders, setRiders] = useState([]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [quoteForm, setQuoteForm] = useState({ quotedPrice: "", deliveryCharge: "", managerNotes: "" });
  const { t, language } = useLanguage();

  useEffect(() => { fetchRequests(); fetchRiders(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/custom-requests/manager/all");
      setRequests(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const { data } = await api.get("/riders");
      setRiders(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = activeTab === "ALL" ? requests : requests.filter((r) => r.status === activeTab);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  const handleQuote = (req) => {
    setSelectedRequest(req);
    setQuoteForm({ quotedPrice: req.quotedPrice || "", deliveryCharge: req.deliveryCharge || "", managerNotes: req.managerNotes || "" });
    setShowQuoteModal(true);
  };

  const submitQuote = async () => {
    if (!quoteForm.quotedPrice) {
      toast.error("Please enter a price");
      return;
    }
    try {
      await api.put(`/custom-requests/${selectedRequest.id}/quote`, {
        quotedPrice: parseFloat(quoteForm.quotedPrice),
        deliveryCharge: parseFloat(quoteForm.deliveryCharge) || 0,
        managerNotes: quoteForm.managerNotes,
      });
      toast.success("Quote submitted!");
      setShowQuoteModal(false);
      fetchRequests();
    } catch (err) {
      toast.error("Failed to submit quote");
    }
  };

  const handleAssignRider = (req) => {
    setSelectedRequest(req);
    setShowRiderModal(true);
  };

  const assignRider = async (riderId) => {
    try {
      await api.put(`/custom-requests/${selectedRequest.id}/assign-rider`, { riderId });
      toast.success("Rider assigned!");
      setShowRiderModal(false);
      fetchRequests();
    } catch (err) {
      toast.error("Failed to assign rider");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/custom-requests/${id}/status`, { status });
      toast.success("Status updated");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handlePrintInvoice = (req) => {
    printCustomRequestInvoice(req, language);
  };

  return (
    <div>
      <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B] mb-3">{t.productRequests || "Product Requests"}</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4">
        {[
          { label: "Today Orders", value: requests.filter((r) => {
            const d = new Date(r.createdAt);
            const now = new Date();
            return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length, icon: ShoppingCart, color: "text-[#7C3AED] bg-[#F3E8FF]" },
          { label: "Today Delivery", value: requests.filter((r) => {
            const d = new Date(r.updatedAt || r.createdAt);
            const now = new Date();
            return r.status === "DELIVERED" && d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length, icon: Truck, color: "text-[#10B981] bg-[#ECFDF5]" },
          { label: "Today Sales", value: `৳${requests.filter((r) => {
            const d = new Date(r.createdAt);
            const now = new Date();
            return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).reduce((sum, r) => sum + (r.totalAmount || 0), 0).toLocaleString()}`, icon: DollarSign, color: "text-[#EC008C] bg-[#FCE8F3]" },
          { label: "Total Requests", value: requests.length, icon: ClipboardList, color: "text-[#00AFCC] bg-[#E8F4F8]" },
          { label: "Pending", value: requests.filter((r) => r.status === "PENDING").length, icon: Clock, color: "text-[#D4A017] bg-[#FFF8E1]" },
          { label: "Delivered", value: requests.filter((r) => r.status === "DELIVERED").length, icon: CheckCircle, color: "text-green-500 bg-green-50" },
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

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition ${activeTab === tab.key ? "bg-[#EC008C] text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-[#E5E7EB]"}`}>
            {tab.label}
            {tab.key !== "ALL" && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === tab.key ? "bg-white/20" : "bg-[#F4F7FB]"}`}>
                {requests.filter((r) => r.status === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
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
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.noProductRequests || "No product requests found"}</td></tr>
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
                        <select
                          value={req.status}
                          onChange={(e) => updateStatus(req.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold border-0 cursor-pointer focus:outline-none ${st.color}`}
                        >
                          {["PENDING", "MANAGER_REVIEW", "PRICING_SET", "CUSTOMER_APPROVED", "CUSTOMER_REJECTED", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"].map((s) => (
                            <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 items-center">
                          <button onClick={() => setSelectedRequest(req)} title={t.viewDetails || "View Details"}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-[11px] font-medium">
                            <Eye size={13} /> <span className="hidden sm:inline">{t.viewDetails || "View"}</span>
                          </button>
                          {req.status === "PENDING" && (
                            <button onClick={() => updateStatus(req.id, "MANAGER_REVIEW")} title={t.startReview || "Start Review"}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition text-[11px] font-medium">
                              <ClipboardList size={13} /> <span className="hidden sm:inline">{t.startReview || "Review"}</span>
                            </button>
                          )}
                          {(req.status === "PENDING" || req.status === "MANAGER_REVIEW") && (
                            <button onClick={() => handleQuote(req)} title={t.setQuote || "Set Quote"}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition text-[11px] font-medium">
                              <DollarSign size={13} /> <span className="hidden sm:inline">{t.setQuote || "Quote"}</span>
                            </button>
                          )}
                          {req.status === "CUSTOMER_APPROVED" && !req.riderId && (
                            <button onClick={() => handleAssignRider(req)} title={t.assignRiderAction || "Assign Rider"}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition text-[11px] font-medium">
                              <Truck size={13} /> <span className="hidden sm:inline">{t.assignRiderAction || "Assign"}</span>
                            </button>
                          )}
                          <button onClick={() => handlePrintInvoice(req)} title={t.printInvoiceAction || "Print Invoice"}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition text-[11px] font-medium">
                            <Printer size={13} /> <span className="hidden sm:inline">{t.printInvoiceAction || "Print"}</span>
                          </button>
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

      {/* Detail Modal - Order Details Style */}
      {selectedRequest && !showQuoteModal && !showRiderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between rounded-t-xl z-10">
              <div>
                <h3 className="font-semibold text-gray-800">{selectedRequest.requestNumber}</h3>
                <p className="text-xs text-gray-400">{new Date(selectedRequest.createdAt).toLocaleString("en-BD", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Status Stepper */}
              <OrderStatusStepper orderStatus={selectedRequest.status} />

              {/* Payment Badge */}
              <div className="flex items-center gap-2">
                <PaymentStatusBadge status={selectedRequest.paymentStatus || "PENDING"} />
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_CONFIG[selectedRequest.status]?.color || "bg-gray-100 text-gray-700"}`}>
                  {STATUS_CONFIG[selectedRequest.status]?.label || selectedRequest.status}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <User size={14} className="text-gray-400" />
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.customer || "Customer"}</p>
                </div>
                <p className="text-sm font-medium">{selectedRequest.user?.name}</p>
                <p className="text-sm text-gray-600">{selectedRequest.user?.phone}</p>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-gray-400" />
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.deliveryAddress || "Delivery Address"}</p>
                </div>
                <p className="text-sm">{selectedRequest.deliveryAddress}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {[selectedRequest.deliveryUpazila, selectedRequest.deliveryDistrict, selectedRequest.deliveryDivision].filter(Boolean).join(", ")}
                </p>
              </div>

              {/* Product Details */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={14} className="text-gray-400" />
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.items || "Product"}</p>
                </div>
                <p className="text-sm font-medium">{selectedRequest.productName}</p>
                {selectedRequest.description && <p className="text-xs text-gray-500 mt-1">{selectedRequest.description}</p>}
                <p className="text-xs text-gray-500 mt-1">Qty: {selectedRequest.quantity} {selectedRequest.unit}</p>
              </div>

              {/* Images */}
              {selectedRequest.images?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{t.images || "Images"}</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedRequest.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Notes */}
              {selectedRequest.customerNotes && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <StickyNote size={14} className="text-blue-600" />
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">{t.notes || "Customer Notes"}</p>
                  </div>
                  <p className="text-sm text-blue-800">{selectedRequest.customerNotes}</p>
                </div>
              )}

              {/* Price Breakdown */}
              {selectedRequest.quotedPrice && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-gray-400" />
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.pricing || "Price Breakdown"}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t.unitPrice || "Unit Price"}</span>
                      <span>৳{selectedRequest.quotedPrice}/{selectedRequest.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t.subtotal || "Subtotal"}</span>
                      <span>৳{((selectedRequest.quotedPrice || 0) * (selectedRequest.quantity || 1)).toLocaleString()}</span>
                    </div>
                    {selectedRequest.deliveryCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t.deliveryFee || "Delivery Fee"}</span>
                        <span>৳{selectedRequest.deliveryCharge.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>{t.total || "Total"}</span>
                      <span className="text-[#EC008C]">৳{selectedRequest.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Manager Notes */}
              {selectedRequest.managerNotes && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <StickyNote size={14} className="text-amber-600" />
                    <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">{t.managerNotes || "Manager Notes"}</p>
                  </div>
                  <p className="text-sm text-amber-800">{selectedRequest.managerNotes}</p>
                </div>
              )}

              {/* Rider Info */}
              {selectedRequest.rider && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck size={14} className="text-gray-400" />
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.rider || "Rider"}</p>
                  </div>
                  <p className="text-sm font-medium">{selectedRequest.rider.user?.name}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedRequest.rejectionReason && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-red-700 mb-1">{t.rejectionReason || "Rejection Reason"}</p>
                  <p className="text-sm text-red-800">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {/* Assign Rider Button */}
              {selectedRequest.status === "CUSTOMER_APPROVED" && !selectedRequest.riderId && (
                <button onClick={() => setShowRiderModal(true)}
                  className="w-full bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2">
                  <Truck size={16} /> {t.assignRiderAction || "Assign Rider"}
                </button>
              )}
            </div>

            {/* Footer with Print Invoice */}
            <div className="sticky bottom-0 bg-white border-t px-5 py-3 flex gap-2 rounded-b-xl">
              <button onClick={() => printCustomRequestInvoice(selectedRequest, language)} className="flex-1 flex items-center justify-center gap-2 bg-[#00215B] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#001A4A] transition cursor-pointer">
                <Printer size={14} /> {language === "bn" ? "ইনভয়েস প্রিন্ট" : t.printInvoice || "Print Invoice"}
              </button>
              <button onClick={() => printCustomRequestInvoice(selectedRequest, language === "en" ? "bn" : "en")} className="flex items-center justify-center gap-1 bg-white border border-[#E5E7EB] text-gray-700 py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer" title={language === "en" ? "বাংলায় প্রিন্ট" : "Print in English"}>
                {language === "en" ? "বাং" : "EN"}
              </button>
              <button onClick={() => setSelectedRequest(null)} className="flex-1 bg-gray-100 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-pointer">{t.close || "Close"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowQuoteModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-[#00215B]">Set Quote for {selectedRequest.productName}</h3>
              <button onClick={() => setShowQuoteModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Price per {selectedRequest.unit} (৳)</label>
                <input type="number" value={quoteForm.quotedPrice} onChange={(e) => setQuoteForm({ ...quoteForm, quotedPrice: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Charge (৳)</label>
                <input type="number" value={quoteForm.deliveryCharge} onChange={(e) => setQuoteForm({ ...quoteForm, deliveryCharge: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes to Customer</label>
                <textarea value={quoteForm.managerNotes} onChange={(e) => setQuoteForm({ ...quoteForm, managerNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C] resize-none" rows={2} placeholder="Optional notes..." />
              </div>
              {quoteForm.quotedPrice && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>৳{(parseFloat(quoteForm.quotedPrice) || 0) * selectedRequest.quantity}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>৳{parseFloat(quoteForm.deliveryCharge) || 0}</span></div>
                  <div className="flex justify-between font-bold border-t mt-1 pt-1"><span>Total</span><span className="text-[#EC008C]">৳{((parseFloat(quoteForm.quotedPrice) || 0) * selectedRequest.quantity) + (parseFloat(quoteForm.deliveryCharge) || 0)}</span></div>
                </div>
              )}
              <button onClick={submitQuote} className="w-full bg-[#EC008C] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#D60071] transition">
                Submit Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rider Modal */}
      {showRiderModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRiderModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-[#00215B]">Assign Rider</h3>
              <button onClick={() => setShowRiderModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-4">
              {riders.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm">No riders available</p>
              ) : (
                <div className="space-y-2">
                  {riders.map((rider) => (
                    <div key={rider.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                      <div>
                        <p className="text-sm font-medium">{rider.user?.name}</p>
                        <p className="text-xs text-gray-500">{rider.vehicleType || "Bike"} | {rider.totalDeliveries} deliveries</p>
                      </div>
                      <button onClick={() => assignRider(rider.id)}
                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600 transition">
                        Assign
                      </button>
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
