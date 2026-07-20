"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import api from "@/lib/axios";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuthChecked } from "@/helper/AuthInit";
import OrderStatusStepper from "@/components/admin/OrderStatusStepper";
import { BANGLADESH_LOCATIONS, getUpazilas } from "@/lib/constants";
import { ClipboardList, Clock, CheckCircle, Truck, Package, X, Ban, Printer, DollarSign, MapPin, FileText, Copy, Check, Eye, Pencil, Trash2, Plus, Send } from "lucide-react";
import { printInvoice, printCustomRequestInvoice } from "@/lib/generateInvoice";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  MANAGER_REVIEW: { color: "bg-blue-100 text-blue-800", icon: Eye },
  PRICING_SET: { color: "bg-purple-100 text-purple-800", icon: ClipboardList },
  CUSTOMER_APPROVED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  CUSTOMER_REJECTED: { color: "bg-red-100 text-red-800", icon: X },
  PROCESSING: { color: "bg-indigo-100 text-indigo-800", icon: ClipboardList },
  SHIPPED: { color: "bg-orange-100 text-orange-800", icon: Truck },
  OUT_FOR_DELIVERY: { color: "bg-orange-100 text-orange-800", icon: Truck },
  DELIVERED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { color: "bg-red-100 text-red-800", icon: X },
};

const STATUS_LABELS = {
  PENDING: { en: "Pending", bn: "অপেক্ষমান" },
  MANAGER_REVIEW: { en: "Under Review", bn: "পর্যালোচনাধীন" },
  PRICING_SET: { en: "Price Set", bn: "মূল্য নির্ধারিত" },
  CUSTOMER_APPROVED: { en: "Approved", bn: "অনুমোদিত" },
  CUSTOMER_REJECTED: { en: "Rejected", bn: "প্রত্যাখ্যাত" },
  PROCESSING: { en: "Processing", bn: "প্রক্রিয়াকরণ" },
  SHIPPED: { en: "Shipped", bn: "পাঠানো হয়েছে" },
  OUT_FOR_DELIVERY: { en: "Out for Delivery", bn: "ডেলিভারি হচ্ছে" },
  DELIVERED: { en: "Delivered", bn: "ডেলিভারি সম্পন্ন" },
  CANCELLED: { en: "Cancelled", bn: "বাতিল" },
};

const CANCELLABLE_STATUSES = ["PENDING", "MANAGER_REVIEW", "PRICING_SET", "CUSTOMER_APPROVED"];
const EDITABLE_ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING"];

function StatusBadge({ status, language }) {
  const cfg = STATUS_CONFIG[status] || { color: "bg-gray-100 text-gray-800" };
  const Icon = cfg.icon;
  const label = STATUS_LABELS[status]?.[language] || status;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.color}`}>
      <Icon size={10} /> {label}
    </span>
  );
}

export default function ProductRequestPage() {
  const router = useRouter();
  const { authChecked } = useAuthChecked();
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingLoading, setCancellingLoading] = useState(false);

  const [editingOrder, setEditingOrder] = useState(false);
  const [orderEditForm, setOrderEditForm] = useState({
    items: [], subtotal: 0, total: 0, paymentMethod: "",
    deliveryAddress: "", deliveryDivision: "", deliveryDistrict: "", deliveryUpazila: "",
    deliveryLatitude: null, deliveryLongitude: null,
  });
  const [orderEditDistricts, setOrderEditDistricts] = useState([]);
  const [orderEditUpazilas, setOrderEditUpazilas] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [editingRequest, setEditingRequest] = useState(false);
  const [requestEditForm, setRequestEditForm] = useState({
    productName: "", description: "", quantity: 1, unit: "piece",
    deliveryAddress: "", deliveryDivision: "", deliveryDistrict: "", deliveryUpazila: "",
    deliveryLatitude: null, deliveryLongitude: null, customerNotes: "",
  });
  const [requestEditDistricts, setRequestEditDistricts] = useState([]);
  const [requestEditUpazilas, setRequestEditUpazilas] = useState([]);
  const [savingRequest, setSavingRequest] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    productName: "", description: "", quantity: 1, unit: "piece",
    deliveryDivision: "", deliveryDistrict: "", deliveryUpazila: "",
    deliveryAddress: "", customerNotes: "",
  });
  const [createDistricts, setCreateDistricts] = useState([]);
  const [createUpazilas, setCreateUpazilas] = useState([]);

  useEffect(() => {
    if (authChecked) fetchRequests();
  }, [authChecked]);

  useEffect(() => {
    const div = BANGLADESH_LOCATIONS.find((d) => d.division === orderEditForm.deliveryDivision);
    setOrderEditDistricts(div ? div.districts.map((d) => d.name) : []);
  }, [orderEditForm.deliveryDivision]);

  useEffect(() => {
    setOrderEditUpazilas(getUpazilas(orderEditForm.deliveryDivision, orderEditForm.deliveryDistrict));
  }, [orderEditForm.deliveryDivision, orderEditForm.deliveryDistrict]);

  useEffect(() => {
    if (!productSearchQuery.trim()) { setProductSearchResults([]); return; }
    const t = setTimeout(() => {
      setSearchingProducts(true);
      api.get(`/products?search=${encodeURIComponent(productSearchQuery.trim())}&limit=8`)
        .then((res) => setProductSearchResults(res.data.data || []))
        .catch(() => setProductSearchResults([]))
        .finally(() => setSearchingProducts(false));
    }, 300);
    return () => clearTimeout(t);
  }, [productSearchQuery]);

  useEffect(() => {
    const div = BANGLADESH_LOCATIONS.find((d) => d.division === requestEditForm.deliveryDivision);
    setRequestEditDistricts(div ? div.districts.map((d) => d.name) : []);
  }, [requestEditForm.deliveryDivision]);

  useEffect(() => {
    setRequestEditUpazilas(getUpazilas(requestEditForm.deliveryDivision, requestEditForm.deliveryDistrict));
  }, [requestEditForm.deliveryDivision, requestEditForm.deliveryDistrict]);

  useEffect(() => {
    const div = BANGLADESH_LOCATIONS.find((d) => d.division === createForm.deliveryDivision);
    setCreateDistricts(div ? div.districts.map((d) => d.name) : []);
  }, [createForm.deliveryDivision]);

  useEffect(() => {
    setCreateUpazilas(getUpazilas(createForm.deliveryDivision, createForm.deliveryDistrict));
  }, [createForm.deliveryDivision, createForm.deliveryDistrict]);

  const handleCreateRequest = async () => {
    if (!createForm.productName.trim()) {
      toast.error(language === "bn" ? "পণ্যের নাম দিন" : "Product name is required");
      return;
    }
    if (!createForm.deliveryDivision) {
      toast.error(language === "bn" ? "বিভাগ নির্বাচন করুন" : "Delivery division is required");
      return;
    }
    if (!createForm.deliveryDistrict) {
      toast.error(language === "bn" ? "জেলা নির্বাচন করুন" : "Delivery district is required");
      return;
    }
    setCreating(true);
    try {
      await api.post("/custom-requests", {
        productName: createForm.productName.trim(),
        description: createForm.description.trim(),
        quantity: createForm.quantity,
        unit: createForm.unit,
        deliveryDivision: createForm.deliveryDivision,
        deliveryDistrict: createForm.deliveryDistrict,
        deliveryUpazila: createForm.deliveryUpazila,
        deliveryAddress: createForm.deliveryAddress.trim() || `${createForm.deliveryUpazila || ""}, ${createForm.deliveryDistrict}, ${createForm.deliveryDivision}`,
        customerNotes: createForm.customerNotes.trim(),
      });
      toast.success(language === "bn" ? "অনুরোধ তৈরি হয়েছে!" : "Request submitted!");
      setShowCreateModal(false);
      setCreateForm({ productName: "", description: "", quantity: 1, unit: "piece", deliveryDivision: "", deliveryDistrict: "", deliveryUpazila: "", deliveryAddress: "", customerNotes: "" });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || (language === "bn" ? "তৈরি ব্যর্থ" : "Failed to create"));
    } finally {
      setCreating(false);
    }
  };

  const startEditRequest = () => {
    if (!selected) return;
    setRequestEditForm({
      productName: selected.productName || "",
      description: selected.description || "",
      quantity: selected.quantity || 1,
      unit: selected.unit || "piece",
      deliveryAddress: selected.deliveryAddress || "",
      deliveryDivision: selected.deliveryDivision || "",
      deliveryDistrict: selected.deliveryDistrict || "",
      deliveryUpazila: selected.deliveryUpazila || "",
      deliveryLatitude: selected.deliveryLatitude,
      deliveryLongitude: selected.deliveryLongitude,
      customerNotes: selected.customerNotes || "",
    });
    setEditingRequest(true);
  };

  const handleRequestEditSave = async () => {
    if (!selected) return;
    setSavingRequest(true);
    try {
      const res = await api.put(`/custom-requests/${selected.id}/edit`, {
        productName: requestEditForm.productName,
        description: requestEditForm.description,
        quantity: requestEditForm.quantity,
        unit: requestEditForm.unit,
        deliveryAddress: requestEditForm.deliveryAddress,
        deliveryDivision: requestEditForm.deliveryDivision,
        deliveryDistrict: requestEditForm.deliveryDistrict,
        deliveryUpazila: requestEditForm.deliveryUpazila,
        deliveryLatitude: requestEditForm.deliveryLatitude,
        deliveryLongitude: requestEditForm.deliveryLongitude,
        customerNotes: requestEditForm.customerNotes,
      });
      setSelected(res.data.data);
      setEditingRequest(false);
      fetchRequests();
      toast.success(language === "bn" ? "আপডেট হয়েছে" : "Updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || (language === "bn" ? "আপডেট ব্যর্থ" : "Failed to update"));
    } finally {
      setSavingRequest(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/custom-requests/my-requests");
      const items = res?.data?.data;
      setRequests(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshSelected = async (id) => {
    try {
      const res = await api.get(`/custom-requests/${id}`);
      setSelected(res.data.data);
    } catch {}
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/custom-requests/${id}/approve`);
      toast.success(language === "bn" ? "অনুমোদিত হয়েছে" : "Approved");
      fetchRequests();
      refreshSelected(id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/custom-requests/${id}/reject`, { rejectionReason: "Not interested" });
      toast.success(language === "bn" ? "প্রত্যাখ্যাত হয়েছে" : "Rejected");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handlePay = async (id) => {
    try {
      await api.put(`/custom-requests/${id}/pay`);
      toast.success(language === "bn" ? "পেমেন্ট কনফার্ম হয়েছে" : "Payment confirmed");
      fetchRequests();
      refreshSelected(id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim() || !selected) return;
    setCancellingLoading(true);
    try {
      await api.put(`/custom-requests/${selected.id}/cancel`, { cancelReason: cancelReason.trim() });
      toast.success(language === "bn" ? "বাতিল হয়েছে" : "Cancelled");
      setShowCancelModal(false);
      setCancelReason("");
      fetchRequests();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    } finally {
      setCancellingLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(language === "bn" ? "কপি হয়েছে" : "Copied!");
  };

  const startEditOrder = () => {
    if (!selected?.order) return;
    const order = selected.order;
    setOrderEditForm({
      items: (order.items || []).map((item) => ({
        productId: item.productId,
        productName: item.product?.name || "Unknown",
        productImage: item.product?.images?.[0] || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      subtotal: order.subtotal,
      total: order.total,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress || "",
      deliveryDivision: order.deliveryDivision || "",
      deliveryDistrict: order.deliveryDistrict || "",
      deliveryUpazila: order.deliveryUpazila || "",
      deliveryLatitude: order.deliveryLatitude,
      deliveryLongitude: order.deliveryLongitude,
    });
    setEditingOrder(true);
    setProductSearchQuery("");
    setProductSearchResults([]);
  };

  const handleOrderItemQty = (idx, delta) => {
    setOrderEditForm((prev) => {
      const items = [...prev.items];
      const newQty = Math.max(1, items[idx].quantity + delta);
      items[idx].quantity = newQty;
      items[idx].totalPrice = items[idx].unitPrice * newQty;
      const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
      return { ...prev, items, subtotal, total: subtotal };
    });
  };

  const handleOrderItemRemove = (idx) => {
    setOrderEditForm((prev) => {
      const items = prev.items.filter((_, i) => i !== idx);
      const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
      return { ...prev, items, subtotal, total: subtotal };
    });
  };

  const handleOrderItemAdd = (product) => {
    setOrderEditForm((prev) => {
      const existing = prev.items.find((i) => i.productId === product.id);
      let items;
      if (existing) {
        items = prev.items.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, totalPrice: i.unitPrice * (i.quantity + 1) }
            : i
        );
      } else {
        const price = product.discountPrice || product.price;
        items = [...prev.items, {
          productId: product.id,
          productName: product.name,
          productImage: product.images?.[0] || null,
          quantity: 1,
          unitPrice: price,
          totalPrice: price,
        }];
      }
      const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
      return { ...prev, items, subtotal, total: subtotal };
    });
    setProductSearchQuery("");
    setProductSearchResults([]);
  };

  const handleOrderEditSave = async () => {
    if (!selected?.order) return;
    if (orderEditForm.items.length === 0) {
      toast.error(language === "bn" ? "অর্ডারে কমপক্ষে একটি আইটেম থাকতে হবে" : "Order must have at least one item");
      return;
    }
    setSavingOrder(true);
    try {
      const res = await api.put(`/orders/${selected.order.id}`, {
        items: orderEditForm.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })),
        subtotal: orderEditForm.subtotal,
        total: orderEditForm.total,
        paymentMethod: orderEditForm.paymentMethod,
        deliveryAddress: orderEditForm.deliveryAddress,
        deliveryDivision: orderEditForm.deliveryDivision,
        deliveryDistrict: orderEditForm.deliveryDistrict,
        deliveryUpazila: orderEditForm.deliveryUpazila,
        deliveryLatitude: orderEditForm.deliveryLatitude,
        deliveryLongitude: orderEditForm.deliveryLongitude,
      });
      setSelected((prev) => ({ ...prev, order: res.data.data }));
      setEditingOrder(false);
      toast.success(language === "bn" ? "অর্ডার আপডেট হয়েছে" : "Order updated!");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || (language === "bn" ? "আপডেট ব্যর্থ" : "Failed to update order"));
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <main className="max-w-[900px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-[#EC008C]" />
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B]">
              {language === "bn" ? "পণ্যের অনুরোধ" : "Product Requests"}
            </h1>
            <span className="text-[11px] text-[#667085]">({requests.length})</span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-[#EC008C] hover:bg-[#D60071] text-white px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition"
          >
            <Plus size={14} />
            {language === "bn" ? "নতুন অনুরোধ" : "New Request"}
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-8 sm:p-12 text-center">
            <ClipboardList size={48} className="mx-auto text-[#E5E7EB] mb-3" />
            <p className="text-sm font-medium text-[#000000] mb-1">
              {language === "bn" ? "এখনো কোনো অনুরোধ নেই" : "No requests yet"}
            </p>
            <p className="text-[11px] text-[#667085]">
              {language === "bn" ? "আপনার পছন্দের পণ্য অনুরোধ করুন" : "Request products you need"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {requests.map((req, idx) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 sm:p-5 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex items-start justify-between" onClick={() => setSelected(req)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] text-[#667085]">#{idx + 1}</span>
                      <span className="flex items-center gap-1 text-[10px] text-[#99A0B4] font-mono hover:text-[#00215B] transition">
                        {req.requestNumber}
                        {copiedId === req.requestNumber ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                      </span>
                      <StatusBadge status={req.status} language={language} />
                    </div>
                    <p className="text-sm font-semibold text-[#00215B]">{req.productName}</p>
                    <p className="text-[11px] text-[#667085]">{req.quantity} {req.unit}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3" onClick={() => setSelected(req)}>
                    {req.totalAmount > 0 && (
                      <p className="text-sm font-bold text-[#00215B]">৳{req.totalAmount}</p>
                    )}
                    <p className="text-[10px] text-[#99A0B4]">
                      {new Date(req.createdAt).toLocaleDateString("en-BD", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    {req.paymentStatus === "PAID" && (
                      <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-green-100 text-green-700">
                        <CheckCircle size={8} /> {language === "bn" ? "পরিশোধিত" : "Paid"}
                      </span>
                    )}
                  </div>
                </div>
                {/* Invoice quick-action on card */}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#F0F2F5]">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(req.requestNumber); }}
                    className="flex items-center gap-1 text-[10px] text-[#99A0B4] hover:text-[#00215B] font-semibold transition"
                  >
                    <Copy size={10} /> {copiedId === req.requestNumber ? (language === "bn" ? "কপি হয়েছে!" : "Copied!") : (language === "bn" ? "কপি" : "Copy #")}
                  </button>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {req.order ? (
                      <div className="flex rounded-lg border border-[#E5E7EB] overflow-hidden">
                        <button onClick={() => printInvoice(req.order, "en")} className="px-2 py-1 text-[10px] font-semibold bg-[#00215B] text-white hover:bg-[#001a4a] transition">EN</button>
                        <button onClick={() => printInvoice(req.order, "bn")} className="px-2 py-1 text-[10px] font-semibold bg-white text-[#667085] hover:bg-gray-50 transition border-l border-[#E5E7EB]">বাং</button>
                      </div>
                    ) : (
                      <div className="flex rounded-lg border border-[#E5E7EB] overflow-hidden">
                        <button onClick={() => printCustomRequestInvoice(req, "en")} className="px-2 py-1 text-[10px] font-semibold bg-[#00215B] text-white hover:bg-[#001a4a] transition">EN</button>
                        <button onClick={() => printCustomRequestInvoice(req, "bn")} className="px-2 py-1 text-[10px] font-semibold bg-white text-[#667085] hover:bg-gray-50 transition border-l border-[#E5E7EB]">বাং</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* ===== ORDER DETAIL MODAL ===== */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => { setSelected(null); setEditingOrder(false); setEditingRequest(false); }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-5 py-3.5 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="font-bold text-[#00215B] text-sm">{language === "bn" ? "অনুরোধের বিবরণ" : "Request Details"}</h2>
              <button onClick={() => { setSelected(null); setEditingOrder(false); setEditingRequest(false); }} className="p-1 hover:bg-[#F4F7FB] rounded-lg transition">
                <X size={18} className="text-[#667085]" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Request Number + Status */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCopy(selected.requestNumber)} className="flex items-center gap-1 text-sm font-mono font-bold text-[#00215B] hover:text-[#EC008C] transition">
                      {selected.requestNumber}
                      {copiedId === selected.requestNumber ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#99A0B4] mt-0.5">
                    {new Date(selected.createdAt).toLocaleDateString("en-BD", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <StatusBadge status={selected.status} language={language} />
              </div>

              {/* Cancel & Edit buttons */}
              {CANCELLABLE_STATUSES.includes(selected.status) && !editingOrder && !editingRequest && (
                <div className="flex gap-3">
                  <button
                    onClick={startEditRequest}
                    className="flex items-center gap-1.5 text-xs text-[#0067A0] hover:text-[#00215B] font-semibold transition"
                  >
                    <Pencil size={14} /> {language === "bn" ? "অনুরোধ এডিট" : "Edit Request"}
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold transition"
                  >
                    <Ban size={14} /> {language === "bn" ? "বাতিল করুন" : "Cancel Order"}
                  </button>
                </div>
              )}
              {(editingOrder || editingRequest) && (
                <button onClick={() => { setEditingOrder(false); setEditingRequest(false); }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-semibold transition">
                  <X size={14} /> {language === "bn" ? "এডিট বাতিল" : "Cancel Edit"}
                </button>
              )}

              {/* Status Stepper - when order exists */}
              {selected.order && (
                <div className="bg-[#F9FAFB] rounded-xl p-3">
                  <OrderStatusStepper orderStatus={selected.order.orderStatus} />
                </div>
              )}

              {/* Custom Request Tracking - before order is created */}
              {!selected.order && ["PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(selected.status) && (
                <div className="bg-[#F9FAFB] rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-[#00215B] mb-2 flex items-center gap-1">
                    <Package size={11} /> {language === "bn" ? "ট্র্যাকিং" : "Tracking"}
                  </p>
                  <div className="flex items-center gap-0">
                    {["PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].map((step, i) => {
                      const stepIndex = ["PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].indexOf(selected.status);
                      const isCompleted = i <= stepIndex;
                      const isCurrent = i === stepIndex;
                      const labels = {
                        PROCESSING: language === "bn" ? "প্রক্রিয়াকরণ" : "Processing",
                        SHIPPED: language === "bn" ? "পাঠানো" : "Shipped",
                        OUT_FOR_DELIVERY: language === "bn" ? "ডেলিভারি হচ্ছে" : "Out",
                        DELIVERED: language === "bn" ? "সম্পন্ন" : "Done",
                      };
                      return (
                        <div key={step} className="flex-1 flex flex-col items-center relative">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold z-10 ${isCurrent ? "bg-[#EC008C] text-white ring-2 ring-[#EC008C]/30" : isCompleted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                            {isCompleted ? <CheckCircle size={10} /> : i + 1}
                          </div>
                          <span className={`text-[8px] mt-1 text-center leading-tight ${isCurrent ? "text-[#EC008C] font-bold" : isCompleted ? "text-green-600" : "text-gray-400"}`}>
                            {labels[step]}
                          </span>
                          {i < 3 && <div className={`absolute top-2.5 left-1/2 w-full h-0.5 ${i < stepIndex ? "bg-green-500" : "bg-gray-200"}`} style={{ zIndex: 0 }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Images */}
              {Array.isArray(selected.images) && selected.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {selected.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-[#E5E7EB] flex-shrink-0" />
                  ))}
                </div>
              )}

              {/* Description */}
              {selected.description && !editingRequest && (
                <p className="text-xs text-[#364152] bg-[#F9FAFB] rounded-lg p-3">{selected.description}</p>
              )}

              {/* Edit Request Form */}
              {editingRequest && (
                <div className="bg-yellow-50 rounded-lg p-3 space-y-2.5">
                  <p className="text-[11px] font-semibold text-yellow-800 flex items-center gap-1">
                    <Pencil size={11} /> {language === "bn" ? "অনুরোধ এডিট করুন" : "Edit Request"}
                  </p>
                  <div>
                    <label className="text-[10px] text-gray-600 mb-0.5 block">{language === "bn" ? "পণ্যের নাম" : "Product Name"}</label>
                    <input type="text" value={requestEditForm.productName} onChange={(e) => setRequestEditForm({ ...requestEditForm, productName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 mb-0.5 block">{language === "bn" ? "বিবরণ" : "Description"}</label>
                    <textarea value={requestEditForm.description} onChange={(e) => setRequestEditForm({ ...requestEditForm, description: e.target.value })} rows={2}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0] resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-600 mb-0.5 block">{language === "bn" ? "পরিমাণ" : "Quantity"}</label>
                      <input type="number" min="1" value={requestEditForm.quantity} onChange={(e) => setRequestEditForm({ ...requestEditForm, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-600 mb-0.5 block">{language === "bn" ? "একক" : "Unit"}</label>
                      <select value={requestEditForm.unit} onChange={(e) => setRequestEditForm({ ...requestEditForm, unit: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0]">
                        <option value="piece">{language === "bn" ? "পিস" : "Piece"}</option>
                        <option value="kg">{language === "bn" ? "কেজি" : "Kg"}</option>
                        <option value="liter">{language === "bn" ? "লিটার" : "Liter"}</option>
                        <option value="dozen">{language === "bn" ? "ডজন" : "Dozen"}</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-yellow-700 pt-1 border-t border-yellow-200">{language === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Address"}</p>
                  <select value={requestEditForm.deliveryDivision} onChange={(e) => setRequestEditForm({ ...requestEditForm, deliveryDivision: e.target.value, deliveryDistrict: "", deliveryUpazila: "" })} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0]">
                    <option value="">{language === "bn" ? "বিভাগ নির্বাচন" : "Select Division"}</option>
                    {BANGLADESH_LOCATIONS.map((d) => <option key={d.division} value={d.division}>{d.division}</option>)}
                  </select>
                  <select value={requestEditForm.deliveryDistrict} onChange={(e) => setRequestEditForm({ ...requestEditForm, deliveryDistrict: e.target.value, deliveryUpazila: "" })} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0]">
                    <option value="">{language === "bn" ? "জেলা নির্বাচন" : "Select District"}</option>
                    {requestEditDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={requestEditForm.deliveryUpazila} onChange={(e) => setRequestEditForm({ ...requestEditForm, deliveryUpazila: e.target.value })} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0]">
                    <option value="">{language === "bn" ? "উপজেলা নির্বাচন" : "Select Upazila"}</option>
                    {requestEditUpazilas.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <textarea value={requestEditForm.deliveryAddress} onChange={(e) => setRequestEditForm({ ...requestEditForm, deliveryAddress: e.target.value })} rows={2}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0] resize-none" placeholder={language === "bn" ? "পূর্ণ ঠিকানা" : "Full address"} />
                  <div>
                    <label className="text-[10px] text-gray-600 mb-0.5 block">{language === "bn" ? "অতিরিক্ত নোট" : "Additional Notes"}</label>
                    <textarea value={requestEditForm.customerNotes} onChange={(e) => setRequestEditForm({ ...requestEditForm, customerNotes: e.target.value })} rows={2}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0] resize-none" />
                  </div>
                  <button onClick={handleRequestEditSave} disabled={savingRequest}
                    className="w-full bg-[#EC008C] text-white py-2 rounded-lg text-[11px] font-semibold hover:bg-[#D60071] transition disabled:opacity-50 flex items-center justify-center gap-1.5">
                    {savingRequest ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={12} />}
                    {savingRequest ? (language === "bn" ? "সেভ হচ্ছে..." : "Saving...") : (language === "bn" ? "সেভ করুন" : "Save Changes")}
                  </button>
                </div>
              )}

              {/* Pricing */}
              {selected.quotedPrice != null && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-[11px] font-semibold text-purple-800 mb-2">{language === "bn" ? "মূল্য বিবরণ" : "Price Breakdown"}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#667085]">{language === "bn" ? "একক মূল্য" : "Unit Price"} × {selected.quantity} {selected.unit}</span>
                      <span className="font-medium text-[#00215B]">৳{selected.quotedPrice * selected.quantity}</span>
                    </div>
                    {selected.deliveryCharge > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[#667085]">{language === "bn" ? "ডেলিভারি ফি" : "Delivery Fee"}</span>
                        <span className="font-medium text-[#00215B]">৳{selected.deliveryCharge}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-bold border-t border-purple-200 pt-1">
                      <span className="text-[#00215B]">{language === "bn" ? "মোট" : "Total"}</span>
                      <span className="text-[#EC008C]">৳{selected.totalAmount}</span>
                    </div>
                  </div>
                  {selected.managerNotes && (
                    <p className="text-[10px] text-[#667085] mt-2 italic">{language === "bn" ? "ম্যানেজার নোট" : "Manager Notes"}: {selected.managerNotes}</p>
                  )}
                </div>
              )}

              {/* Approve/Reject for PRICING_SET */}
              {selected.status === "PRICING_SET" && selected.quotedPrice != null && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(selected.id)} className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-green-600 transition">
                    <CheckCircle size={14} /> {language === "bn" ? "মূল্য অনুমোদন" : "Approve Price"}
                  </button>
                  <button onClick={() => handleReject(selected.id)} className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-red-600 transition">
                    <X size={14} /> {language === "bn" ? "মূল্য প্রত্যাখ্যান" : "Reject Price"}
                  </button>
                </div>
              )}

              {/* Rejection reason */}
              {selected.status === "CUSTOMER_REJECTED" && selected.rejectionReason && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-[11px] text-red-600">{language === "bn" ? "প্রত্যাখ্যানের কারণ" : "Rejection Reason"}: {selected.rejectionReason}</p>
                </div>
              )}

              {/* ===== ORDER DETAILS SECTION ===== */}
              {selected.order && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText size={12} className="text-blue-600" />
                    <p className="text-[11px] font-semibold text-blue-800">{language === "bn" ? "অর্ডার বিবরণ" : "Order Details"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                    <span className="text-[#667085]">{language === "bn" ? "অর্ডার #" : "Order #"}:</span>
                    <span className="font-medium text-[#00215B]">{selected.order.orderNumber}</span>
                    <span className="text-[#667085]">{language === "bn" ? "তারিখ" : "Date"}:</span>
                    <span className="font-medium text-[#00215B]">{new Date(selected.order.createdAt).toLocaleDateString("en-BD")}</span>
                    <span className="text-[#667085]">{language === "bn" ? "পেমেন্ট পদ্ধতি" : "Payment"}:</span>
                    <span className="font-medium text-[#00215B]">{selected.order.paymentMethod === "COD" ? "Cash on Delivery" : selected.order.paymentMethod}</span>
                    <span className="text-[#667085]">{language === "bn" ? "পেমেন্ট স্ট্যাটাস" : "Payment Status"}:</span>
                    <span className={`font-medium ${selected.order.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"}`}>{selected.order.paymentStatus}</span>
                  </div>

                  {/* Order Items */}
                  {selected.order.items && selected.order.items.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-blue-100">
                      <p className="text-[10px] font-semibold text-blue-700 mb-1.5">{language === "bn" ? "আইটেম" : "Items"}</p>
                      {editingOrder ? (
                        <div className="space-y-2">
                          {orderEditForm.items.map((item, idx) => (
                            <div key={item.productId} className="flex items-center gap-2 bg-white rounded-lg p-2">
                              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {item.productImage ? (
                                  <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                ) : (
                                  <Package size={12} className="text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-medium text-gray-900 truncate">{item.productName}</p>
                                <p className="text-[9px] text-gray-500">৳{item.unitPrice} each</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleOrderItemQty(idx, -1)} className="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-[10px] font-bold">-</button>
                                <span className="w-5 text-center text-[11px] font-medium">{item.quantity}</span>
                                <button onClick={() => handleOrderItemQty(idx, 1)} className="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-[10px] font-bold">+</button>
                              </div>
                              <p className="text-[11px] font-semibold text-gray-900 w-14 text-right">৳{item.totalPrice}</p>
                              <button onClick={() => handleOrderItemRemove(idx)} className="p-0.5 text-red-400 hover:text-red-600 transition">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder={language === "bn" ? "পণ্য খুঁজুন..." : "Search products to add..."}
                              value={productSearchQuery}
                              onChange={(e) => setProductSearchQuery(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0]"
                            />
                            {productSearchResults.length > 0 && (
                              <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                {productSearchResults.map((p) => (
                                  <button key={p.id} onClick={() => handleOrderItemAdd(p)} className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-gray-50 text-left">
                                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                      {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Package size={10} className="text-gray-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-medium text-gray-900 truncate">{p.name}</p>
                                      <p className="text-[9px] text-gray-500">৳{p.discountPrice || p.price}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between text-[11px] font-bold mt-1 pt-1 border-t border-blue-100">
                            <span>{language === "bn" ? "মোট" : "Total"}</span>
                            <span>৳{orderEditForm.total}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {selected.order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-[11px]">
                              <span className="text-[#667085]">{item.product?.name} × {item.quantity}</span>
                              <span className="font-medium text-[#00215B]">৳{item.totalPrice}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-[11px] font-bold mt-1 pt-1 border-t border-blue-100">
                            <span>{language === "bn" ? "মোট" : "Total"}</span>
                            <span className="text-[#00215B]">৳{selected.order.total}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Edit Order Address */}
                  {editingOrder && (
                    <div className="mt-3 pt-2 border-t border-blue-100 space-y-2">
                      <p className="text-[10px] font-semibold text-blue-700">{language === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Address"}</p>
                      <select value={orderEditForm.deliveryDivision} onChange={(e) => setOrderEditForm({ ...orderEditForm, deliveryDivision: e.target.value, deliveryDistrict: "", deliveryUpazila: "" })} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0]">
                        <option value="">{language === "bn" ? "বিভাগ নির্বাচন" : "Select Division"}</option>
                        {BANGLADESH_LOCATIONS.map((d) => <option key={d.division} value={d.division}>{d.division}</option>)}
                      </select>
                      <select value={orderEditForm.deliveryDistrict} onChange={(e) => setOrderEditForm({ ...orderEditForm, deliveryDistrict: e.target.value, deliveryUpazila: "" })} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0]">
                        <option value="">{language === "bn" ? "জেলা নির্বাচন" : "Select District"}</option>
                        {orderEditDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select value={orderEditForm.deliveryUpazila} onChange={(e) => setOrderEditForm({ ...orderEditForm, deliveryUpazila: e.target.value })} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0]">
                        <option value="">{language === "bn" ? "উপজেলা নির্বাচন" : "Select Upazila"}</option>
                        {orderEditUpazilas.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <textarea value={orderEditForm.deliveryAddress} onChange={(e) => setOrderEditForm({ ...orderEditForm, deliveryAddress: e.target.value })} rows={2} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#0067A0] resize-none" placeholder={language === "bn" ? "পূর্ণ ঠিকানা" : "Full address"} />
                      <button
                        onClick={handleOrderEditSave}
                        disabled={savingOrder || orderEditForm.items.length === 0}
                        className="w-full bg-[#EC008C] text-white py-2 rounded-lg text-[11px] font-semibold hover:bg-[#D60071] transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {savingOrder ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={12} />}
                        {savingOrder ? (language === "bn" ? "সেভ হচ্ছে..." : "Saving...") : (language === "bn" ? "অর্ডার সেভ করুন" : "Save Order")}
                      </button>
                    </div>
                  )}

                  {/* Delivery Address (view mode) */}
                  {!editingOrder && selected.order.deliveryAddress && (
                    <div className="mt-3 pt-2 border-t border-blue-100">
                      <p className="text-[10px] font-semibold text-blue-700 mb-1">{language === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Address"}</p>
                      <p className="text-[11px] text-[#364152]">{selected.order.deliveryAddress}{selected.order.deliveryDistrict ? `, ${selected.order.deliveryDistrict}` : ""}{selected.order.deliveryUpazila ? `, ${selected.order.deliveryUpazila}` : ""}{selected.order.deliveryDivision ? `, ${selected.order.deliveryDivision}` : ""}</p>
                    </div>
                  )}

                  {/* Edit Order Button */}
                  {!editingOrder && EDITABLE_ORDER_STATUSES.includes(selected.order.orderStatus) && (
                    <div className="mt-3 pt-2 border-t border-blue-100">
                      <button onClick={startEditOrder} className="flex items-center gap-1.5 text-[11px] text-[#0067A0] hover:text-[#00215B] font-semibold transition">
                        <Pencil size={12} /> {language === "bn" ? "অর্ডার এডিট করুন" : "Edit Order"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Address (custom request level) */}
              {!selected.order && selected.deliveryAddress && !editingRequest && (
                <div className="flex items-start gap-2 text-xs text-[#364152]">
                  <MapPin size={14} className="text-[#EC008C] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#99A0B4] font-medium mb-0.5">{language === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Address"}</p>
                    <p>{selected.deliveryAddress}{selected.deliveryDistrict ? `, ${selected.deliveryDistrict}` : ""}{selected.deliveryUpazila ? `, ${selected.deliveryUpazila}` : ""}</p>
                  </div>
                </div>
              )}

              {/* Rider Info */}
              {selected.rider && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Truck size={12} className="text-orange-600" />
                    <p className="text-[11px] font-semibold text-orange-800">{language === "bn" ? "রাইডার" : "Rider"}</p>
                  </div>
                  <p className="text-[11px] text-[#364152]">{selected.rider.user?.name} — {selected.rider.user?.phone}</p>
                </div>
              )}

              {/* Payment & Invoice Actions */}
              <div className="flex gap-2 flex-wrap pt-2 border-t border-[#F0F2F5]">
                {selected.status === "DELIVERED" && selected.paymentStatus !== "PAID" && (
                  <button onClick={() => handlePay(selected.id)} className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-green-600 transition">
                    <DollarSign size={14} /> {language === "bn" ? "পেমেন্ট কনফার্ম" : "Confirm Payment"}
                  </button>
                )}
                {selected.paymentStatus === "PAID" && (
                  <span className="flex-1 flex items-center justify-center gap-1 bg-green-100 text-green-700 py-2.5 rounded-xl text-xs font-semibold">
                    <CheckCircle size={14} /> {language === "bn" ? "পরিশোধিত" : "Paid"}
                  </span>
                )}
                {selected.order ? (
                  <>
                    <button
                      onClick={() => printInvoice(selected.order, language)}
                      className="flex items-center justify-center gap-1 bg-white border border-[#E5E7EB] text-gray-700 py-2.5 px-3 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
                    >
                      <Printer size={14} /> {language === "bn" ? "ইনভয়েস" : "Invoice"}
                    </button>
                    <div className="flex rounded-xl border border-[#E5E7EB] overflow-hidden">
                      <button onClick={() => printInvoice(selected.order, "en")} className={`px-3 py-2.5 text-[10px] font-semibold transition ${language === "en" ? "bg-[#00215B] text-white" : "bg-white text-[#667085] hover:bg-gray-50"}`}>EN</button>
                      <button onClick={() => printInvoice(selected.order, "bn")} className={`px-3 py-2.5 text-[10px] font-semibold transition border-l border-[#E5E7EB] ${language === "bn" ? "bg-[#00215B] text-white" : "bg-white text-[#667085] hover:bg-gray-50"}`}>বাং</button>
                    </div>
                    <button
                      onClick={() => { setSelected(null); setEditingOrder(false); setEditingRequest(false); router.push(`/track-order?order=${selected.order.orderNumber}`); }}
                      className="flex items-center justify-center gap-1 bg-[#00AFCC] text-white py-2.5 px-4 rounded-xl text-xs font-semibold hover:bg-[#009AB5] transition"
                    >
                      <Truck size={14} /> {language === "bn" ? "ট্র্যাক" : "Track"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex rounded-xl border border-[#E5E7EB] overflow-hidden">
                      <button onClick={() => printCustomRequestInvoice(selected, "en")} className={`px-3 py-2.5 text-[10px] font-semibold transition ${language === "en" ? "bg-[#00215B] text-white" : "bg-white text-[#667085] hover:bg-gray-50"}`}>EN</button>
                      <button onClick={() => printCustomRequestInvoice(selected, "bn")} className={`px-3 py-2.5 text-[10px] font-semibold transition border-l border-[#E5E7EB] ${language === "bn" ? "bg-[#00215B] text-white" : "bg-white text-[#667085] hover:bg-gray-50"}`}>বাং</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CANCEL MODAL ===== */}
      {showCancelModal && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowCancelModal(false); setCancelReason(""); }}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Ban size={20} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{language === "bn" ? "অনুরোধ বাতিল" : "Cancel Request"}</h2>
                  <p className="text-sm text-gray-500">{selected.requestNumber}</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">{language === "bn" ? "আপনি কি নিশ্চিতভাবে এই অনুরোধটি বাতিল করতে চান?" : "Are you sure you want to cancel this request?"}</p>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{language === "bn" ? "বাতিলের কারণ *" : "Reason for cancellation *"}</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={language === "bn" ? "আমি কেন বাতিল করতে চাই..." : "Why do you want to cancel..."}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#00215B] resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                {language === "bn" ? "ফিরে যান" : "Keep Request"}
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancellingLoading || !cancelReason.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancellingLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Ban size={16} />}
                {cancellingLoading ? (language === "bn" ? "বাতিল হচ্ছে..." : "Cancelling...") : (language === "bn" ? "বাতিল করুন" : "Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE NEW REQUEST MODAL ===== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-5 py-3.5 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="font-bold text-[#00215B] text-sm">{language === "bn" ? "নতুন পণ্য অনুরোধ" : "New Product Request"}</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-[#F4F7FB] rounded-lg transition">
                <X size={18} className="text-[#667085]" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#00215B] mb-1 block">{language === "bn" ? "পণ্যের নাম *" : "Product Name *"}</label>
                <input
                  type="text"
                  value={createForm.productName}
                  onChange={(e) => setCreateForm({ ...createForm, productName: e.target.value })}
                  placeholder={language === "bn" ? "যেমন: অর্গানিক হলুদ ১ কেজি" : "e.g., Organic Turmeric 1kg"}
                  className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EC008C]/30 focus:border-[#EC008C] transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#00215B] mb-1 block">{language === "bn" ? "বিবরণ" : "Description"}</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder={language === "bn" ? "পণ্য সম্পর্কে বিস্তারিত লিখুন..." : "Describe the product you need..."}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EC008C]/30 focus:border-[#EC008C] transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#00215B] mb-1 block">{language === "bn" ? "পরিমাণ" : "Quantity"}</label>
                  <input
                    type="number"
                    min="1"
                    value={createForm.quantity}
                    onChange={(e) => setCreateForm({ ...createForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EC008C]/30 focus:border-[#EC008C] transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#00215B] mb-1 block">{language === "bn" ? "একক" : "Unit"}</label>
                  <select
                    value={createForm.unit}
                    onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EC008C]/30 focus:border-[#EC008C] transition"
                  >
                    <option value="piece">{language === "bn" ? "পিস" : "Piece"}</option>
                    <option value="kg">{language === "bn" ? "কেজি" : "Kg"}</option>
                    <option value="liter">{language === "bn" ? "লিটার" : "Liter"}</option>
                    <option value="dozen">{language === "bn" ? "ডজন" : "Dozen"}</option>
                    <option value="box">{language === "bn" ? "বক্স" : "Box"}</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-[#F0F2F5] pt-4">
                <p className="text-xs font-semibold text-[#00215B] mb-3 flex items-center gap-1">
                  <MapPin size={12} className="text-[#EC008C]" />
                  {language === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Address"}
                </p>
                <div className="space-y-3">
                  <select
                    value={createForm.deliveryDivision}
                    onChange={(e) => setCreateForm({ ...createForm, deliveryDivision: e.target.value, deliveryDistrict: "", deliveryUpazila: "" })}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EC008C]/30 focus:border-[#EC008C] transition"
                  >
                    <option value="">{language === "bn" ? "বিভাগ নির্বাচন *" : "Select Division *"}</option>
                    {BANGLADESH_LOCATIONS.map((d) => <option key={d.division} value={d.division}>{d.division}</option>)}
                  </select>
                  <select
                    value={createForm.deliveryDistrict}
                    onChange={(e) => setCreateForm({ ...createForm, deliveryDistrict: e.target.value, deliveryUpazila: "" })}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EC008C]/30 focus:border-[#EC008C] transition"
                  >
                    <option value="">{language === "bn" ? "জেলা নির্বাচন *" : "Select District *"}</option>
                    {createDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    value={createForm.deliveryUpazila}
                    onChange={(e) => setCreateForm({ ...createForm, deliveryUpazila: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EC008C]/30 focus:border-[#EC008C] transition"
                  >
                    <option value="">{language === "bn" ? "উপজেলা নির্বাচন" : "Select Upazila"}</option>
                    {createUpazilas.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <textarea
                    value={createForm.deliveryAddress}
                    onChange={(e) => setCreateForm({ ...createForm, deliveryAddress: e.target.value })}
                    placeholder={language === "bn" ? "পূর্ণ ঠিকানা (রাস্তা, বাসা নম্বর ইত্যাদি)" : "Full address (road, house no, etc.)"}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EC008C]/30 focus:border-[#EC008C] transition resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#00215B] mb-1 block">{language === "bn" ? "অতিরিক্ত নোট" : "Additional Notes"}</label>
                <textarea
                  value={createForm.customerNotes}
                  onChange={(e) => setCreateForm({ ...createForm, customerNotes: e.target.value })}
                  placeholder={language === "bn" ? "কোনো বিশেষ অনুরোধ থাকলে লিখুন..." : "Any special instructions..."}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EC008C]/30 focus:border-[#EC008C] transition resize-none"
                />
              </div>

              <button
                onClick={handleCreateRequest}
                disabled={creating || !createForm.productName.trim() || !createForm.deliveryDivision || !createForm.deliveryDistrict}
                className="w-full bg-[#EC008C] hover:bg-[#D60071] text-white py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {creating
                  ? (language === "bn" ? "পাঠানো হচ্ছে..." : "Submitting...")
                  : (language === "bn" ? "অনুরোধ পাঠান" : "Submit Request")
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
