"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { ALL_DISTRICTS } from "@/lib/constants";
import { Search, Eye, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { fetchOrders(); }, [statusFilter, districtFilter, search]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (districtFilter) params.set("district", districtFilter);
      if (search) params.set("search", search);
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await api.get(`/orders/admin/all${query}`);
      setOrders(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success("Status updated");
      fetchOrders();
    } catch (err) { toast.error("Failed to update"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name, or phone..."
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
          <option value="">All Districts</option>
          {ALL_DISTRICTS.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
        </select>
        {["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === s ? "bg-primary-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No orders found</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-primary-600">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">{order.user?.name}</td>
                    <td className="px-4 py-3 text-sm">{order.items?.length}</td>
                    <td className="px-4 py-3 text-sm font-medium">৳{order.total}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={order.orderStatus} onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border-0 ${statusColors[order.orderStatus] || ""}`}>
                        {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedOrder(order)} className="text-blue-500 hover:text-blue-700">
                        <Eye size={16} />
                      </button>
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
            <h2 className="font-semibold text-gray-800 mb-4">Order #{selectedOrder.orderNumber}</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Customer:</span> {selectedOrder.user?.name}</p>
              <p><span className="text-gray-500">Phone:</span> {selectedOrder.user?.phone}</p>
              <p><span className="text-gray-500">Address:</span> {selectedOrder.deliveryAddress}</p>
              <p><span className="text-gray-500">District:</span> {selectedOrder.deliveryDistrict}</p>
              <p><span className="text-gray-500">Payment:</span> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
              <p><span className="text-gray-500">Total:</span> ৳{selectedOrder.total}</p>
              {selectedOrder.customRequirement && (
                <p className="bg-amber-50 p-2 rounded"><span className="text-amber-700">Custom Requirement:</span> {selectedOrder.customRequirement}</p>
              )}
              <div className="border-t pt-2 mt-2">
                <p className="font-medium">Items:</p>
                {selectedOrder.items?.map((item) => (
                  <p key={item.id}>{item.product?.name} × {item.quantity} = ৳{item.totalPrice}</p>
                ))}
              </div>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="mt-4 w-full bg-gray-100 py-2 rounded-lg text-sm hover:bg-gray-200">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
