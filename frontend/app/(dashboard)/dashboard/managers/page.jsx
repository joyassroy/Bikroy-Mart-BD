"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { DELIVERY_AREAS } from "@/lib/constants";
import { Plus, Trash2, X, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import EditManagerModal from "@/components/manager/EditManagerModal";

export default function ManagersPage() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editManager, setEditManager] = useState(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    assignedDistrict: "Dhaka", assignedZila: "",
  });

  useEffect(() => { fetchManagers(); }, []);

  const fetchManagers = async () => {
    try {
      const res = await api.get("/managers");
      setManagers(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", password: "", assignedDistrict: "Dhaka", assignedZila: "" });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/managers", form);
      toast.success("Manager created");
      resetForm();
      fetchManagers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create manager");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this manager? This will also delete the associated user account.")) return;
    try {
      await api.delete(`/managers/${id}`);
      toast.success("Manager deleted");
      fetchManagers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete manager");
    }
  };

  const selectedDistrict = DELIVERY_AREAS.find((a) => a.districts.includes(form.assignedDistrict));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Zila Managers</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#EC008C] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#D60071] transition flex items-center gap-2">
          <Plus size={14} /> Add Manager
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Create New Manager</h3>
            <button type="button" onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
              <X size={14} /> Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Manager name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="manager@email.com" />
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Assigned District *</label>
              <select required value={form.assignedDistrict} onChange={(e) => setForm({ ...form, assignedDistrict: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                {DELIVERY_AREAS.map((area) =>
                  area.districts.map((d) => <option key={d} value={d}>{d} ({area.division})</option>)
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Assigned Zila *</label>
              <input type="text" required value={form.assignedZila} onChange={(e) => setForm({ ...form, assignedZila: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="e.g. Savar, Mirpur" />
            </div>
          </div>
          <button type="submit" className="mt-6 bg-[#EC008C] text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-[#D60071] transition flex items-center gap-2">
            <Plus size={14} /> Create Manager
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl h-40 animate-pulse shadow-sm"></div>)
        ) : managers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 col-span-3">No managers found. Click "Add Manager" to create one.</div>
        ) : (
          managers.map((manager) => (
            <div key={manager.id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{manager.user?.name}</h3>
                  <p className="text-sm text-gray-500">{manager.user?.email}</p>
                  {manager.user?.phone && <p className="text-xs text-gray-400">{manager.user?.phone}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditManager(manager)} className="text-blue-400 hover:text-blue-600 transition p-1" title="Edit manager">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(manager.id)} className="text-red-400 hover:text-red-600 transition p-1" title="Delete manager">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-[#EC008C]">📍</span>
                  {manager.assignedDistrict}, {manager.assignedZila}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">📦</span>
                  {manager._count?.products || 0} products
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editManager && (
        <EditManagerModal
          manager={editManager}
          onClose={() => setEditManager(null)}
          onUpdated={fetchManagers}
        />
      )}
    </div>
  );
}
