"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { X, Truck, Search, Package, Clock, CheckCircle, MapPin, Phone, User, ChevronDown, RefreshCw } from "lucide-react";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const statusLabels = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const filterTabs = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riders, setRiders] = useState([]);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => { fetchOrders(); fetchRiders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/manager/local");
      setOrders(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchRiders = async () => {
    try { const res = await api.get("/riders"); setRiders(res.data.data || []); }
    catch (err) { console.error(err); }
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingStatus(orderId);
    try { await api.put(`/orders/${orderId}/status`, { status }); toast.success("Status updated"); fetchOrders(); }
    catch (err) { toast.error("Failed to update"); }
    finally { setUpdatingStatus(null); }
  };

  const openRiderModal = (order) => {
    setSelectedOrder(order);
    setShowRiderModal(true);
  };

  const assignRider = async (riderId) => {
    try {
      await api.put(`/orders/${selectedOrder.id}/assign-rider`, { riderId });
      toast.success("Rider assigned successfully!");
      setShowRiderModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to assign rider");
    }
  };

  const filtered = orders.filter((o) => {
    const matchesFilter = filter === "ALL" || o.orderStatus === filter;
    const matchesSearch = search === "" ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.phone?.includes(search);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === "PENDING").length,
    active: orders.filter((o) => ["OUT_FOR_DELIVERY", "SHIPPED"].includes(o.orderStatus)).length,
    delivered: orders.filter((o) => o.orderStatus === "DELIVERED").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B]">Local Orders</h1>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 text-[11px] text-[#667085] hover:text-[#EC008C] transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {[
          { label: "Total Orders", value: stats.total, icon: Package, color: "text-[#00AFCC] bg-[#E8F4F8]" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-[#D4A017] bg-[#FFF8E1]" },
          { label: "Out for Delivery", value: stats.active, icon: Truck, color: "text-orange-500 bg-orange-50" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "text-green-500 bg-green-50" },
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

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-[11px] sm:text-xs focus:outline-none focus:border-[#EC008C] transition"
          />
        </div>
      </div>

      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition ${
              filter === tab.key ? "bg-[#EC008C] text-white" : "bg-white text-[#667085] hover:bg-[#F4F7FB] border border-[#E5E7EB]"
            }`}>
            {tab.label}
            {tab.key !== "ALL" && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${filter === tab.key ? "bg-white/20" : "bg-[#F4F7FB]"}`}>
                {orders.filter((o) => o.orderStatus === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="text-left text-[10px] sm:text-[11px] text-[#667085] border-b border-[#E5E7EB]">
              <th className="px-3 py-2.5 font-medium">Order #</th>
              <th className="px-3 py-2.5 font-medium">Customer</th>
              <th className="px-3 py-2.5 font-medium">Items</th>
              <th className="px-3 py-2.5 font-medium">Total</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium">Rider</th>
              <th className="px-3 py-2.5 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-[11px] text-gray-400">Loading orders...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-[11px] text-gray-400">
                <Package size={24} className="mx-auto mb-2 text-gray-300" />
                <p>{search ? "No orders match your search" : "No orders found"}</p>
              </td></tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="border-b border-[#F4F7FB] hover:bg-[#F4F7FB] transition">
                  <td className="px-3 py-2.5 font-medium text-[#EC008C] text-[11px] sm:text-xs">{order.orderNumber}</td>
                  <td className="px-3 py-2.5">
                    <p className="text-[11px] sm:text-xs text-[#000000] font-medium">{order.user?.name}</p>
                    <p className="text-[10px] text-[#667085] flex items-center gap-1 mt-0.5">
                      <Phone size={9} />{order.user?.phone || "N/A"}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] sm:text-xs text-[#000000]">{order.items?.length || 0}</td>
                  <td className="px-3 py-2.5 text-[11px] sm:text-xs font-semibold text-[#000000]">৳{order.total}</td>
                  <td className="px-3 py-2.5">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      disabled={updatingStatus === order.id}
                      className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold border-0 cursor-pointer focus:outline-none ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-600"}`}
                    >
                      {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].map((s) => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    {order.rider ? (
                      <span className="text-[10px] sm:text-[11px] text-green-600 font-medium flex items-center gap-1">
                        <Truck size={10} /> {order.rider?.user?.name || "Assigned"}
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] text-[#667085]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {!order.riderId && order.orderStatus !== "DELIVERED" && order.orderStatus !== "CANCELLED" && (
                      <button onClick={() => openRiderModal(order)}
                        className="flex items-center gap-1 text-[10px] sm:text-[11px] bg-[#00215B] text-white px-3 py-1.5 rounded-lg hover:bg-[#001A4A] transition ml-auto">
                        <Truck size={11} /> Assign Rider
                      </button>
                    )}
                    {order.riderId && (
                      <span className="text-[10px] sm:text-[11px] text-green-600 font-medium">Assigned</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rider Assignment Modal */}
      {showRiderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRiderModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-[#E5E7EB]">
              <div>
                <h3 className="font-bold text-[#00215B] text-sm">Assign Rider</h3>
                <p className="text-[10px] text-[#667085] mt-0.5">{selectedOrder.orderNumber} — ৳{selectedOrder.total}</p>
              </div>
              <button onClick={() => setShowRiderModal(false)} className="p-1 hover:bg-[#F4F7FB] rounded-lg transition">
                <X size={18} className="text-[#667085]" />
              </button>
            </div>
            <div className="p-3 overflow-y-auto max-h-[60vh]">
              {riders.length === 0 ? (
                <div className="text-center py-8">
                  <Truck size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-[11px] text-gray-400">No riders available in your district</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {riders.map((rider) => (
                    <div key={rider.id} className="flex items-center justify-between p-2.5 border border-[#E5E7EB] rounded-lg hover:bg-[#F4F7FB] transition group">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#FCE8F3] rounded-full flex items-center justify-center">
                          <User size={14} className="text-[#EC008C]" />
                        </div>
                        <div>
                          <p className="text-[11px] sm:text-xs font-medium text-[#000000]">{rider.user?.name}</p>
                          <p className="text-[10px] text-[#667085]">
                            {rider.vehicleType || "Bike"} · {rider.totalDeliveries} deliveries
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${rider.isAvailable ? "bg-green-500" : "bg-gray-400"}`}></span>
                        <button onClick={() => assignRider(rider.id)}
                          className="bg-[#00215B] text-white px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold hover:bg-[#001A4A] transition">
                          Assign
                        </button>
                      </div>
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
