"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { CheckCircle, Calendar, MapPin } from "lucide-react";

export default function RiderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/riders/history").then((res) => setOrders(res.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Delivery History</h1>
      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Delivered On</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No delivery history</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-primary-600 text-sm">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">{order.user?.name}</td>
                    <td className="px-4 py-3 text-sm">{order.items?.length}</td>
                    <td className="px-4 py-3 text-sm font-medium">৳{order.total}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {order.actualDelivery ? new Date(order.actualDelivery).toLocaleDateString() : "N/A"}
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
