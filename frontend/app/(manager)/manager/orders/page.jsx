"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

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

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try { const res = await api.get("/orders/manager/local"); setOrders(res.data.data || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    try { await api.put(`/orders/${orderId}/status`, { status }); toast.success("Updated"); fetchOrders(); }
    catch (err) { toast.error("Failed"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Local Orders</h1>
      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No local orders</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-primary-600 text-sm">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">{order.user?.name}</td>
                    <td className="px-4 py-3 text-sm">{order.items?.length}</td>
                    <td className="px-4 py-3 text-sm font-medium">৳{order.total}</td>
                    <td className="px-4 py-3">
                      <select value={order.orderStatus} onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border-0 ${statusColors[order.orderStatus] || ""}`}>
                        {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {!order.riderId && order.orderStatus !== "DELIVERED" && (
                        <button className="text-xs bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700">
                          Assign Rider
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
