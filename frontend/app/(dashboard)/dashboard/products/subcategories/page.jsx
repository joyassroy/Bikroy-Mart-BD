"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, Edit, Trash2, X, Image as ImageIcon, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import Pagination from "@/components/ui/Pagination";

export default function SubcategoriesPage() {
  const { t } = useLanguage();
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    categoryId: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { 
    fetchSubcategories(); 
    fetchCategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const res = await api.get("/subcategories");
      setSubcategories(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const filtered = search
    ? subcategories.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.nameBn && s.nameBn.toLowerCase().includes(search.toLowerCase())) ||
        (s.category?.name && s.category.name.toLowerCase().includes(search.toLowerCase()))
      )
    : subcategories;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const handleOpenModal = (subcategory = null) => {
    if (subcategory) {
      setEditingId(subcategory.id);
      setFormData({
        name: subcategory.name,
        nameBn: subcategory.nameBn || "",
        categoryId: subcategory.categoryId || "",
        isActive: subcategory.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", nameBn: "", categoryId: "", isActive: true });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append("image", imageFile);

    try {
      if (editingId) {
        await api.put(`/subcategories/${editingId}`, data);
        toast.success("Subcategory updated");
      } else {
        await api.post("/subcategories", data);
        toast.success("Subcategory created");
      }
      setShowModal(false);
      fetchSubcategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      await api.delete(`/subcategories/${id}`);
      toast.success("Subcategory deleted");
      fetchSubcategories();
    } catch (err) { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Subcategories</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 flex items-center gap-2">
          <Plus size={16} /> Add Subcategory
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder || "Search subcategories..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:border-[#EC008C] transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{search ? "No subcategories match your search" : "No subcategories found"}</td></tr>
              ) : (
                paginated.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {s.image ? (
                        <img src={s.image.startsWith('http') ? s.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5004'}${s.image}`} alt={s.name} className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {s.name}
                      {s.nameBn && <span className="block text-xs text-gray-500">{s.nameBn}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.category?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal(s)} className="text-blue-500 hover:text-blue-700"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">{editingId ? "Edit Subcategory" : "Add Subcategory"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category *</label>
                <select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (EN) *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (BN)</label>
                <input type="text" value={formData.nameBn} onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
