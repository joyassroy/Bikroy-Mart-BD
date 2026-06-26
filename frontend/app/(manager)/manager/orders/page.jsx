"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { X, Truck } from "lucide-react";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
};

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riders, setRiders] = useState([]);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { fetchOrders(); fetchRiders(); }, []);

  const fetchOrders = async () => {
    try { const res = await api.get("/orders/manager/local"); setOrders(res.data.data || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchRiders = async () => {
    try { const res = await api.get("/riders"); setRiders(res.data.data || []); }
    catch (err) { console.error(err); }
  };

  const updateStatus = async (orderId, status) => {
    try { await api.put(`/orders/${orderId}/status`, { status }); toast.success("Status updated"); fetchOrders(); }
    catch (err) { toast.error("Failed to update"); }
  };

  const openRiderModal = (order) => {
    setSelectedOrder(order);
    setShowRiderModal(true);
  };

  const assignRider = async (riderId) => {
    try {
      await api.put(`/orders/${selectedOrder.id}/assign-rider`, { riderId });
      toast.success("Rider assigned!");
      setShowRiderModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to assign rider");
    }
  };

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.orderStatus === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Local Orders</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "OUT_FOR_DELIVERY"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${filter === s ? "bg-[#EC008C] text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
            {s === "ALL" ? "All" : s.replace(/_/g, " ")}
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
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No orders found</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-primary-600 text-sm">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">{order.user?.name}</td>
                    <td className="px-4 py-3 text-sm">{order.user?.phone || "N/A"}</td>
                    <td className="px-4 py-3 text-sm">{order.items?.length}</td>
                    <td className="px-4 py-3 text-sm font-medium">৳{order.total}</td>
                    <td className="px-4 py-3">
                      <select value={order.orderStatus} onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border-0 ${statusColors[order.orderStatus] || ""}`}>
                        {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {!order.riderId && order.orderStatus !== "DELIVERED" && (
                        <button onClick={() => openRiderModal(order)}
                          className="flex items-center gap-1 text-xs bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700">
                          <Truck size={12} /> Assign
                        </button>
                      )}
                      {order.riderId && (
                        <span className="text-xs text-green-600 font-medium">Assigned</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRiderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRiderModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-[#00215B]">Assign Rider — {selectedOrder.orderNumber}</h3>
              <button onClick={() => setShowRiderModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-4">
              {riders.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm">No riders available in your district</p>
              ) : (
                <div className="space-y-2">
                  {riders.map((rider) => (
                    <div key={rider.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                      <div>
                        <p className="text-sm font-medium">{rider.user?.name}</p>
                        <p className="text-xs text-gray-500">
                          {rider.vehicleType || "Bike"} | {rider.totalDeliveries} deliveries
                          {rider.isAvailable ? " | Available" : " | Offline"}
                        </p>
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
