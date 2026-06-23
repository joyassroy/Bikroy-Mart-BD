"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, Trash2, Edit2, X, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    mobileImage: "",
    link: "",
    position: "hero",
    bgColor: "",
    sortOrder: 0,
  });

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get("/banners?all=true");
      setBanners(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ title: "", subtitle: "", image: "", mobileImage: "", link: "", position: "hero", bgColor: "", sortOrder: 0 });
    setEditingId(null);
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image: banner.image || "",
      mobileImage: banner.mobileImage || "",
      link: banner.link || "",
      position: banner.position || "hero",
      bgColor: banner.bgColor || "",
      sortOrder: banner.sortOrder || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/banners/${editingId}`, form);
        toast.success("Banner updated");
      } else {
        await api.post("/banners", form);
        toast.success("Banner created");
      }
      resetForm();
      fetchBanners();
    } catch (err) { toast.error("Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this banner?")) return;
    try { await api.delete(`/banners/${id}`); toast.success("Deleted"); fetchBanners(); }
    catch (err) { toast.error("Failed"); }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await api.put(`/banners/${id}`, { isActive: !isActive });
      toast.success(isActive ? "Banner deactivated" : "Banner activated");
      fetchBanners();
    } catch (err) { toast.error("Failed"); }
  };

  const positionOptions = [
    { value: "hero", label: "Hero (Main Banner)" },
    { value: "center", label: "Center (Middle Banner)" },
    { value: "sidebar", label: "Sidebar" },
  ];

  const bgColorOptions = [
    { value: "", label: "Default" },
    { value: "from-[#00215B] to-[#001A4A]", label: "Dark Blue" },
    { value: "from-[#EC008C] to-[#D60071]", label: "Pink" },
    { value: "from-[#00AFCC] to-[#009AB5]", label: "Teal" },
    { value: "from-[#EC008C] to-[#E85AA0]", label: "Light Pink" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Banners</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">
            {editingId ? "Edit Banner" : "Add New Banner"}
          </h3>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
              <X size={14} /> Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Banner title" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
            <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Optional subtitle" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
            <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="https://example.com/image.jpg" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mobile Image URL</label>
            <input type="text" value={form.mobileImage} onChange={(e) => setForm({ ...form, mobileImage: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Separate mobile image (optional)" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
            <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="/shop or https://..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Position *</label>
            <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
              {positionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Background Color</label>
            <select value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
              {bgColorOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
          </div>
        </div>

        {form.image && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Preview</label>
            <img src={form.image} alt="Preview" className="h-24 md:h-32 rounded-lg object-cover border" />
          </div>
        )}

        <button type="submit" className="mt-4 bg-pink-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-pink-700 transition flex items-center gap-2">
          {editingId ? <><Edit2 size={14} /> Update Banner</> : <><Plus size={14} /> Add Banner</>}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Banner</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : banners.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No banners found</td></tr>
              ) : banners.map((banner) => (
                <tr key={banner.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {banner.image ? (
                        <img src={banner.image} alt={banner.title} className="w-16 h-10 rounded object-cover" />
                      ) : (
                        <div className={`w-16 h-10 rounded bg-gradient-to-r ${banner.bgColor || "from-pink-500 to-pink-600"} flex items-center justify-center`}>
                          <span className="text-white text-[8px] font-bold">NO IMG</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{banner.title}</p>
                        {banner.subtitle && <p className="text-xs text-gray-400">{banner.subtitle}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">{banner.position}</td>
                  <td className="px-4 py-3 text-sm">{banner.sortOrder}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(banner.id, banner.isActive)}
                      className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition ${
                        banner.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(banner)} className="text-blue-500 hover:text-blue-700 transition">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(banner.id)} className="text-red-500 hover:text-red-700 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
