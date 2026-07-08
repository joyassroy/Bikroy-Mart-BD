"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, Edit, Trash2, X, Image as ImageIcon, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import Pagination from "@/components/ui/Pagination";

export default function CategoriesPage() {
  const { t } = useLanguage();
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
    icon: "",
    sortOrder: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories?all=true");
      setCategories(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        nameBn: category.nameBn || "",
        icon: category.icon || "",
        sortOrder: category.sortOrder || 0,
        isActive: category.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", nameBn: "", icon: "", sortOrder: 0, isActive: true });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append("image", imageFile);

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, data);
        toast.success(t.categoryUpdated);
      } else {
        await api.post("/categories", data);
        toast.success(t.categoryCreated);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || t.somethingWentWrong);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDeleteCategory)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success(t.categoryDeleted);
      fetchCategories();
    } catch (err) { toast.error(t.failedToDelete); }
  };

  const filteredCategories = search
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.nameBn && c.nameBn.toLowerCase().includes(search.toLowerCase()))
      )
    : categories;

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t.categories}</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 flex items-center gap-2">
          <Plus size={16} /> {t.addCategory}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
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
                <th className="px-4 py-3 font-medium">{t.image}</th>
                <th className="px-4 py-3 font-medium">{t.name}</th>
                <th className="px-4 py-3 font-medium">{t.nameBn}</th>
                <th className="px-4 py-3 font-medium">{t.sortOrder}</th>
                <th className="px-4 py-3 font-medium">{t.status}</th>
                <th className="px-4 py-3 font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t.loading}</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t.noCategoriesFound}</td></tr>
              ) : (
                paginatedCategories.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {c.image ? (
                        <img src={c.image.startsWith('http') ? c.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5004'}${c.image}`} alt={c.name} className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.nameBn || '-'}</td>
                    <td className="px-4 py-3 text-sm">{c.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {c.isActive ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal(c)} className="text-blue-500 hover:text-blue-700"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredCategories.length} itemsPerPage={ITEMS_PER_PAGE} />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">{editingId ? t.editCategory : t.addCategory}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameEn} *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameBn}</label>
                <input type="text" value={formData.nameBn} onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.image}</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.sortOrder}</label>
                  <input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div className="flex flex-col justify-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm font-medium text-gray-700">{t.active}</span>
                  </label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t.cancel}</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
