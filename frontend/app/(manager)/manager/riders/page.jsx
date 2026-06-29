"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Truck, Phone, MapPin, Star, Package, Search, Plus, User, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ManagerRidersPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    vehicleType: "Bike", vehicleNumber: "", assignedZila: "",
  });

  useEffect(() => { fetchRiders(); }, []);

  useEffect(() => {
    const debounce = setTimeout(() => { fetchRiders(); }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.get(`/riders${params}`);
      setRiders(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createRider = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email, and password are required");
      return;
    }
    setCreating(true);
    try {
      await api.post("/riders", form);
      toast.success("Rider created successfully!");
      setShowAddModal(false);
      setForm({ name: "", email: "", phone: "", password: "", vehicleType: "Bike", vehicleNumber: "", assignedZila: "" });
      fetchRiders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create rider");
    } finally {
      setCreating(false);
    }
  };

  const onlineCount = riders.filter((r) => r.isAvailable).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B]">Riders</h1>
        <div className="flex items-center gap-3">
          <span className="text-[10px] sm:text-[11px] text-[#667085]">
            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
            {onlineCount} online
          </span>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-[10px] sm:text-[11px] bg-[#00215B] text-white px-3 py-1.5 rounded-lg hover:bg-[#001A4A] transition font-semibold">
            <Plus size={12} /> Add Rider
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search riders by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-[11px] sm:text-xs focus:outline-none focus:border-[#EC008C] transition"
        />
      </div>

      {/* Riders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg h-40 animate-pulse border border-[#E5E7EB]"></div>
          ))
        ) : riders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-400 col-span-3 border border-[#E5E7EB]">
            <Truck size={24} className="mx-auto mb-2 text-gray-300" />
            <p className="text-xs">{search ? "No riders match your search" : "No riders in your district"}</p>
          </div>
          ) : (
            riders.map((rider) => (
            <div key={rider.id} className="bg-white rounded-lg p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#FCE8F3] rounded-full flex items-center justify-center">
                    <User size={16} className="text-[#EC008C]" />
                  </div>
                  <div>
                    <h3 className="text-[11px] sm:text-xs font-semibold text-[#000000]">{rider.user?.name}</h3>
                    <p className="text-[10px] text-[#667085] flex items-center gap-1">
                      <Phone size={9} />{rider.user?.phone || "N/A"}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold ${
                  rider.isAvailable ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-500 border border-gray-200"
                }`}>
                  {rider.isAvailable ? "Online" : "Offline"}
                </span>
              </div>
              <div className="space-y-1 text-[10px] sm:text-[11px] text-[#667085]">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Truck size={10} /> Vehicle</span>
                  <span className="font-medium text-[#000000]">{rider.vehicleType || "Bike"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Package size={10} /> Deliveries</span>
                  <span className="font-medium text-[#000000]">{rider._count?.orders ?? rider.totalDeliveries ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Star size={10} /> Rating</span>
                  <span className="font-medium text-[#000000]">⭐ {rider.ratings?.toFixed(1) || "0.0"}</span>
                </div>
                {rider.assignedZila && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><MapPin size={10} /> Zone</span>
                    <span className="font-medium text-[#000000]">{rider.assignedZila}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Rider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full max-h-[85vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-[#E5E7EB]">
              <h3 className="font-bold text-[#00215B] text-sm">Add New Rider</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#F4F7FB] rounded-lg transition">
                <X size={18} className="text-[#667085]" />
              </button>
            </div>
            <div className="p-3 space-y-2.5">
              {[
                { key: "name", label: "Full Name", placeholder: "e.g. Rahim Uddin", required: true },
                { key: "email", label: "Email", placeholder: "rider@email.com", type: "email", required: true },
                { key: "phone", label: "Phone", placeholder: "01XXXXXXXXX" },
                { key: "password", label: "Password", placeholder: "Min 6 characters", type: "password", required: true },
                { key: "vehicleType", label: "Vehicle Type", type: "select", options: ["Bike", "Bicycle", "Van", "Pickup"] },
                { key: "vehicleNumber", label: "Vehicle Number", placeholder: "DH-12345" },
                { key: "assignedZila", label: "Assigned District", placeholder: "e.g. Dhaka" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-[10px] sm:text-[11px] font-semibold text-[#667085] mb-1">
                    {field.label} {field.required && <span className="text-[#EC008C]">*</span>}
                  </label>
                  {field.type === "select" ? (
                    <select
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-[11px] sm:text-xs focus:outline-none focus:border-[#EC008C] transition"
                    >
                      {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-[11px] sm:text-xs focus:outline-none focus:border-[#EC008C] transition"
                    />
                  )}
                </div>
              ))}
              <button onClick={createRider} disabled={creating}
                className="w-full bg-[#00215B] text-white py-2.5 rounded-lg text-[11px] sm:text-xs font-semibold hover:bg-[#001A4A] transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                {creating ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : "Create Rider"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
