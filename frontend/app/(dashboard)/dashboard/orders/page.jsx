"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { ALL_DISTRICTS } from "@/lib/constants";
import { Search, Eye, ChevronDown, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { printInvoice } from "@/lib/generateInvoice";
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

const paymentStatusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-purple-100 text-purple-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { t } = useLanguage();

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

  const updateStatus = async (orderId, status, paymentStatus) => {
    try {
      const body = { status };
      if (paymentStatus) body.paymentStatus = paymentStatus;
      await api.put(`/orders/${orderId}/status`, body);
      toast.success(t.statusUpdated);
      fetchOrders();
    } catch (err) { toast.error(t.failedToUpdate); }
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
        {["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${statusFilter === s ? "bg-primary-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
            {s || t.all} ({s ? (statusCounts[s] || 0) : orders.length})
          </button>
        ))}
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
                <th className="px-4 py-3 font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.loading}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.noOrdersFound}</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-primary-600">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">{order.user?.name}</td>
                    <td className="px-4 py-3 text-sm">{order.items?.length}</td>
                    <td className="px-4 py-3 text-sm font-medium">৳{order.total}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updateStatus(order.id, order.orderStatus, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border-0 ${paymentStatusColors[order.paymentStatus] || ""}`}
                      >
                        {Object.keys(paymentStatusColors).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select value={order.orderStatus} onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border-0 ${statusColors[order.orderStatus] || ""}`}>
                        {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="text-blue-500 hover:text-blue-700">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => printInvoice(order)} className="text-gray-500 hover:text-gray-700" title={t.printInvoice}>
                          <Printer size={16} />
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold text-gray-800 mb-4">{t.orderHash}{selectedOrder.orderNumber}</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">{t.customerLabel}</span> {selectedOrder.user?.name}</p>
              <p><span className="text-gray-500">{t.phoneLabel}</span> {selectedOrder.user?.phone}</p>
              <p><span className="text-gray-500">{t.addressLabel}</span> {selectedOrder.deliveryAddress}</p>
              <p><span className="text-gray-500">{t.districtLabel}</span> {selectedOrder.deliveryDistrict}</p>
              <p><span className="text-gray-500">{t.paymentLabel}</span> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
              <p><span className="text-gray-500">{t.totalLabel}</span> ৳{selectedOrder.total}</p>
              {selectedOrder.customRequirement && (
                <p className="bg-amber-50 p-2 rounded"><span className="text-amber-700">{t.customRequirementLabel}</span> {selectedOrder.customRequirement}</p>
              )}
              <div className="border-t pt-2 mt-2">
                <p className="font-medium">{t.itemsLabel}</p>
                {selectedOrder.items?.map((item) => (
                  <p key={item.id}>{item.product?.name} × {item.quantity} = ৳{item.totalPrice}</p>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => printInvoice(selectedOrder)} className="flex-1 flex items-center justify-center gap-2 bg-[#00215B] text-white py-2 rounded-lg text-sm hover:bg-[#001A4A] transition">
                <Printer size={14} /> {t.printInvoice}
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 bg-gray-100 py-2 rounded-lg text-sm hover:bg-gray-200">{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
