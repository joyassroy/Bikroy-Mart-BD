"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import Pagination from "@/components/ui/Pagination";

export default function SponsorsAdminPage() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [form, setForm] = useState({ name: "", website: "", sortOrder: 0, isActive: true, logo: "" });

  useEffect(() => { fetchSponsors(); }, []);

  const fetchSponsors = async () => {
    try {
      const res = await api.get("/sponsors/all");
      setSponsors(res.data.data || []);
    } catch (err) { toast.error("Failed to load sponsors"); }
    finally { setLoading(false); }
  };

  const handleOpenModal = (sponsor = null) => {
    if (sponsor) {
      setEditingId(sponsor.id);
      setForm({ name: sponsor.name, website: sponsor.website || "", sortOrder: sponsor.sortOrder, isActive: sponsor.isActive, logo: sponsor.logo });
      setLogoPreview(sponsor.logo);
    } else {
      setEditingId(null);
      setForm({ name: "", website: "", sortOrder: 0, isActive: true, logo: "" });
      setLogoPreview(null);
    }
    setLogoFile(null);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", form.name);
    data.append("website", form.website);
    data.append("sortOrder", String(form.sortOrder));
    data.append("isActive", String(form.isActive));
    if (logoFile) {
      data.append("logo", logoFile);
    } else if (form.logo) {
      data.append("logo", form.logo);
    }

    try {
      if (editingId) {
        await api.put(`/sponsors/${editingId}`, data);
        toast.success("Sponsor updated");
      } else {
        await api.post("/sponsors", data);
        toast.success("Sponsor created");
      }
      setShowModal(false);
      fetchSponsors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save sponsor");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this sponsor?")) return;
    try {
      await api.delete(`/sponsors/${id}`);
      toast.success("Sponsor deleted");
      fetchSponsors();
    } catch { toast.error("Failed to delete"); }
  };

  const toggleActive = async (sponsor) => {
    try {
      const data = new FormData();
      data.append("name", sponsor.name);
      data.append("logo", sponsor.logo);
      data.append("isActive", String(!sponsor.isActive));
      await api.put(`/sponsors/${sponsor.id}`, data);
      toast.success(`Sponsor ${!sponsor.isActive ? "activated" : "deactivated"}`);
      fetchSponsors();
    } catch { toast.error("Failed to update"); }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading sponsors...</div>;

  const totalPages = Math.ceil(sponsors.length / ITEMS_PER_PAGE);
  const paginatedSponsors = sponsors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sponsors & Partners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage sponsors shown in the homepage marquee</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#00215B] text-white px-4 py-2 rounded-lg hover:bg-[#001A4A] transition"
        >
          <Plus size={18} /> Add Sponsor
        </button>
      </div>

      {/* Sponsor cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sponsors.length === 0 && (
          <div className="col-span-full bg-white border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
            No sponsors yet. Add your first sponsor to show them in the homepage marquee!
          </div>
        )}
        {paginatedSponsors.map((sponsor) => (
          <div key={sponsor.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${!sponsor.isActive ? 'opacity-50' : ''}`}>
            <div className="h-28 bg-gray-50 flex items-center justify-center p-4 border-b">
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => { e.currentTarget.src = ""; e.currentTarget.parentElement.innerHTML = `<span class="text-2xl font-bold text-gray-300">${sponsor.name.charAt(0)}</span>`; }}
              />
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800 truncate">{sponsor.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${sponsor.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {sponsor.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              {sponsor.website && (
                <a href={sponsor.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-500 hover:underline mb-3 truncate">
                  <ExternalLink size={11} /> {sponsor.website}
                </a>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => handleOpenModal(sponsor)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => toggleActive(sponsor)}
                  className="p-1.5 bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-100">
                  {sponsor.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                </button>
                <button onClick={() => handleDelete(sponsor.id)}
                  className="p-1.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-100">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={sponsors.length} itemsPerPage={ITEMS_PER_PAGE} />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-5">{editingId ? "Edit Sponsor" : "Add Sponsor"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Logo preview */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="max-w-full max-h-full object-contain p-2" />
                  ) : (
                    <span className="text-xs text-gray-400">No logo</span>
                  )}
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">Upload Logo</label>
                  <input type="file" accept="image/*" onChange={handleFileChange}
                    className="w-full text-sm border rounded-lg px-3 py-2" />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">Or Logo URL</label>
                  <input type="text" value={form.logo} onChange={e => setForm({...form, logo: e.target.value})}
                    placeholder="https://example.com/logo.png"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sponsor Name *</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website URL</label>
                <input type="url" value={form.website} onChange={e => setForm({...form, website: e.target.value})}
                  placeholder="https://example.com"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: parseInt(e.target.value)})}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={e => setForm({...form, isActive: e.target.checked})} />
                <label htmlFor="isActive" className="text-sm">Active (show on homepage)</label>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-[#EC008C] text-white rounded-lg hover:bg-[#D60071] font-medium">
                  {editingId ? "Update" : "Add Sponsor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
