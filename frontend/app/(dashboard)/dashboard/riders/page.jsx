"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { ALL_DISTRICTS } from "@/lib/constants";
import { Plus, Trash2, X, Pencil, Search } from "lucide-react";
import toast from "react-hot-toast";
import EditRiderModal from "@/components/rider/EditRiderModal";
import { useLanguage } from "@/i18n/LanguageContext";
import Pagination from "@/components/ui/Pagination";

export default function RidersPage() {
  const { t } = useLanguage();
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRider, setEditRider] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    vehicleType: "Bike", vehicleNumber: "", licenseNumber: "", assignedZila: "",
  });

  useEffect(() => { fetchRiders(); }, [search]);

  const fetchRiders = async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.get(`/riders${params}`);
      setRiders(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = search
    ? riders.filter((r) => (r.user?.name?.toLowerCase().includes(search.toLowerCase()) || r.user?.email?.toLowerCase().includes(search.toLowerCase()) || r.assignedZila?.toLowerCase().includes(search.toLowerCase())))
    : riders;

  const totalPages = Math.ceil(filtered.length / 10);
  const paginated = filtered.slice((currentPage - 1) * 10, currentPage * 10);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", password: "", vehicleType: "Bike", vehicleNumber: "", licenseNumber: "", assignedZila: "" });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/riders", form);
      toast.success(t.riderCreated);
      resetForm();
      fetchRiders();
    } catch (err) {
      toast.error(err.response?.data?.message || t.failedToCreateRider);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDeleteRider)) return;
    try {
      await api.delete(`/riders/${id}`);
      toast.success(t.riderDeleted);
      fetchRiders();
    } catch (err) {
      toast.error(err.response?.data?.message || t.failedToDeleteRider);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t.riders}</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#EC008C] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#D60071] transition flex items-center gap-2">
          <Plus size={14} /> {t.addRider}
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={t.searchRiders}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:border-[#EC008C] transition"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{t.createNewRider}</h3>
            <button type="button" onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
              <X size={14} /> {t.cancel}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t.fullName}</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder={t.riderName} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t.email}</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="rider@email.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t.phone}</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="01XXXXXXXXX" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t.password}</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder={t.min6Characters} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t.vehicleType}</label>
              <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                <option value="Bike">{t.bike}</option>
                <option value="Bicycle">{t.bicycle}</option>
                <option value="Scooter">{t.scooter}</option>
                <option value="Van">{t.van}</option>
                <option value="Truck">{t.truck}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t.vehicleNumber}</label>
              <input type="text" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="e.g. ঢাকা মেট্রো গ-১২-৩৪৫৬" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t.licenseNumber}</label>
              <input type="text" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="License number" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t.assignedZila}</label>
              <select value={form.assignedZila} onChange={(e) => setForm({ ...form, assignedZila: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                <option value="">{t.selectZila}</option>
                {ALL_DISTRICTS.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="mt-6 bg-[#EC008C] text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-[#D60071] transition flex items-center gap-2">
            <Plus size={14} /> {t.createRider}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">{t.rider}</th>
                <th className="px-4 py-3 font-medium">{t.vehicle}</th>
                <th className="px-4 py-3 font-medium">{t.zone}</th>
                <th className="px-4 py-3 font-medium">{t.deliveries}</th>
                <th className="px-4 py-3 font-medium">{t.rating}</th>
                <th className="px-4 py-3 font-medium">{t.status}</th>
                <th className="px-4 py-3 font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.loading}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.noRidersFound}</td></tr>
              ) : (
                paginated.map((rider) => (
                  <tr key={rider.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{rider.user?.name}</p>
                        <p className="text-xs text-gray-400">{rider.user?.email}</p>
                        {rider.user?.phone && <p className="text-xs text-gray-400">{rider.user?.phone}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>{rider.vehicleType || t.notAvailable}</div>
                      {rider.vehicleNumber && <div className="text-xs text-gray-400">{rider.vehicleNumber}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm">{rider.assignedZila || t.notAvailable}</td>
                    <td className="px-4 py-3 text-sm font-medium">{rider.totalDeliveries}</td>
                    <td className="px-4 py-3 text-sm">{rider.ratings?.toFixed(1) || "0.0"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${rider.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {rider.isAvailable ? t.available : t.offline}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditRider(rider)} className="text-blue-400 hover:text-blue-600 transition p-1" title={t.editRider}>
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(rider.id)} className="text-red-400 hover:text-red-600 transition p-1" title={t.deleteRider}>
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

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={10} />

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
