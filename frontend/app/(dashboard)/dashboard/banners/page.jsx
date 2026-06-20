"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", image: "", link: "", position: "hero", sortOrder: 0 });

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try { const res = await api.get("/banners"); setBanners(res.data.data || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/banners", form);
      toast.success("Banner created");
      setForm({ title: "", image: "", link: "", position: "hero", sortOrder: 0 });
      fetchBanners();
    } catch (err) { toast.error("Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this banner?")) return;
    try { await api.delete(`/banners/${id}`); toast.success("Deleted"); fetchBanners(); }
    catch (err) { toast.error("Failed"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Banners</h1>

      <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Add New Banner</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          <input type="text" placeholder="Image URL" required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          <input type="text" placeholder="Link URL (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
            className="border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
            <option value="hero">Hero</option>
            <option value="center">Center</option>
            <option value="sidebar">Sidebar</option>
          </select>
          <input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })}
            className="border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          <button type="submit" className="bg-primary-600 text-white rounded-lg py-2.5 text-sm hover:bg-primary-700">Add Banner</button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : banners.map((banner) => (
                <tr key={banner.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm">{banner.title}</td>
                  <td className="px-4 py-3 text-sm capitalize">{banner.position}</td>
                  <td className="px-4 py-3 text-sm">{banner.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(banner.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
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
