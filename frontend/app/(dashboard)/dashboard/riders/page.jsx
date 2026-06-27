"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { DELIVERY_AREAS } from "@/lib/constants";
import { Plus, Trash2, X, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import EditRiderModal from "@/components/rider/EditRiderModal";

export default function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRider, setEditRider] = useState(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    vehicleType: "Bike", vehicleNumber: "", licenseNumber: "", assignedZila: "",
  });

  useEffect(() => { fetchRiders(); }, []);

  const fetchRiders = async () => {
    try {
      const res = await api.get("/riders");
      setRiders(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", password: "", vehicleType: "Bike", vehicleNumber: "", licenseNumber: "", assignedZila: "" });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/riders", form);
      toast.success("Rider created");
      resetForm();
      fetchRiders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create rider");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this rider? This will also delete the associated user account.")) return;
    try {
      await api.delete(`/riders/${id}`);
      toast.success("Rider deleted");
      fetchRiders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete rider");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Riders</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#EC008C] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#D60071] transition flex items-center gap-2">
          <Plus size={14} /> Add Rider
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Create New Rider</h3>
            <button type="button" onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
              <X size={14} /> Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Rider name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="rider@email.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="01XXXXXXXXX" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle Type</label>
              <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                <option value="Bike">Bike</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Scooter">Scooter</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle Number</label>
              <input type="text" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="e.g. ঢাকা মেট্রো গ-১২-৩৪৫৬" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">License Number</label>
              <input type="text" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="License number" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Assigned Zila</label>
              <select value={form.assignedZila} onChange={(e) => setForm({ ...form, assignedZila: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                <option value="">Select zila</option>
                {DELIVERY_AREAS.map((area) =>
                  area.districts.map((d) => <option key={d} value={d}>{d} ({area.division})</option>)
                )}
              </select>
            </div>
          </div>
          <button type="submit" className="mt-6 bg-[#EC008C] text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-[#D60071] transition flex items-center gap-2">
            <Plus size={14} /> Create Rider
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Rider</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Zone</th>
                <th className="px-4 py-3 font-medium">Deliveries</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : riders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No riders found. Click "Add Rider" to create one.</td></tr>
              ) : (
                riders.map((rider) => (
                  <tr key={rider.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{rider.user?.name}</p>
                        <p className="text-xs text-gray-400">{rider.user?.email}</p>
                        {rider.user?.phone && <p className="text-xs text-gray-400">{rider.user?.phone}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>{rider.vehicleType || "N/A"}</div>
                      {rider.vehicleNumber && <div className="text-xs text-gray-400">{rider.vehicleNumber}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm">{rider.assignedZila || "N/A"}</td>
                    <td className="px-4 py-3 text-sm font-medium">{rider.totalDeliveries}</td>
                    <td className="px-4 py-3 text-sm">{rider.ratings?.toFixed(1) || "0.0"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${rider.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {rider.isAvailable ? "Available" : "Offline"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditRider(rider)} className="text-blue-400 hover:text-blue-600 transition p-1" title="Edit rider">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(rider.id)} className="text-red-400 hover:text-red-600 transition p-1" title="Delete rider">
                          <Trash2 size={16} />
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

      {editRider && (
        <EditRiderModal
          rider={editRider}
          onClose={() => setEditRider(null)}
          onUpdated={fetchRiders}
        />
      )}
    </div>
  );
}
