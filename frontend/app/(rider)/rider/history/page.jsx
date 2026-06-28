"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { CheckCircle, Calendar, MapPin, Package, User, Search } from "lucide-react";

export default function RiderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/riders/history").then((res) => setOrders(res.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.orderNumber?.toLowerCase().includes(q) || o.user?.name?.toLowerCase().includes(q);
  });

  return (
    <div>
      <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B] mb-3">Delivery History</h1>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by order # or customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-[11px] sm:text-xs focus:outline-none focus:border-[#EC008C] transition"
        />
      </div>

      <div className="bg-white rounded-lg shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="text-left text-[10px] sm:text-[11px] text-[#667085] border-b border-[#E5E7EB]">
              <th className="px-3 py-2.5 font-medium">Order #</th>
              <th className="px-3 py-2.5 font-medium">Customer</th>
              <th className="px-3 py-2.5 font-medium">Items</th>
              <th className="px-3 py-2.5 font-medium">Total</th>
              <th className="px-3 py-2.5 font-medium">Delivered On</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-[11px] text-gray-400">Loading history...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-[11px] text-gray-400">
                <Package size={24} className="mx-auto mb-2 text-gray-300" />
                <p>{search ? "No orders match your search" : "No delivery history yet"}</p>
              </td></tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="border-b border-[#F4F7FB] hover:bg-[#F4F7FB] transition">
                  <td className="px-3 py-2.5 font-medium text-[#EC008C] text-[11px] sm:text-xs">{order.orderNumber}</td>
                  <td className="px-3 py-2.5">
                    <p className="text-[11px] sm:text-xs text-[#000000]">{order.user?.name}</p>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] sm:text-xs text-[#000000]">{order.items?.length || 0}</td>
                  <td className="px-3 py-2.5 text-[11px] sm:text-xs font-semibold text-[#000000]">৳{order.total}</td>
                  <td className="px-3 py-2.5 text-[10px] sm:text-[11px] text-[#667085]">
                    {order.actualDelivery ? new Date(order.actualDelivery).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
