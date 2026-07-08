"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, Trash2, Edit2, X, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import Pagination from "@/components/ui/Pagination";

export default function BannersPage() {
  const { t, language } = useLanguage();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    mobileImage: "",
    link: "",
    position: "hero",
    bgColor: "",
    categoryId: "",
    sortOrder: 0,
  });

  useEffect(() => { fetchBanners(); fetchCategories(); }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get("/banners?all=true");
      setBanners(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalPages = Math.ceil(banners.length / ITEMS_PER_PAGE);
  const paginatedBanners = banners.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const [imageFile, setImageFile] = useState(null);
  const [mobileImageFile, setMobileImageFile] = useState(null);

  const resetForm = () => {
    setForm({ title: "", subtitle: "", image: "", mobileImage: "", link: "", position: "hero", bgColor: "", categoryId: "", sortOrder: 0 });
    setImageFile(null);
    setMobileImageFile(null);
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
      categoryId: banner.categoryId || "",
      sortOrder: banner.sortOrder || 0,
    });
    setImageFile(null);
    setMobileImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (imageFile) formData.append("image", imageFile);
    if (mobileImageFile) formData.append("mobileImage", mobileImageFile);

    try {
      if (editingId) {
        await api.put(`/banners/${editingId}`, formData);
        toast.success(t.bannerUpdated);
      } else {
        await api.post("/banners", formData);
        toast.success(t.bannerCreated);
      }
      resetForm();
      fetchBanners();
    } catch (err) { toast.error(t.failed); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDeleteBanner)) return;
    try { await api.delete(`/banners/${id}`); toast.success(t.deleted); fetchBanners(); }
    catch (err) { toast.error(t.failed); }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await api.put(`/banners/${id}`, { isActive: !isActive });
      toast.success(isActive ? t.bannerDeactivated : t.bannerActivated);
      fetchBanners();
    } catch (err) { toast.error(t.failed); }
  };

  const positionOptions = [
    { value: "hero", label: t.heroMainBanner },
    { value: "center", label: t.centerMiddleBanner },
    { value: "category", label: "Category Banner" },
    { value: "sidebar", label: t.sidebar },
  ];

  const bgColorOptions = [
    { value: "", label: t.default },
    { value: "from-[#00215B] to-[#001A4A]", label: t.darkBlue },
    { value: "from-[#EC008C] to-[#D60071]", label: t.pink },
    { value: "from-[#00AFCC] to-[#009AB5]", label: t.teal },
    { value: "from-[#EC008C] to-[#E85AA0]", label: t.lightPink },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.banners}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">
            {editingId ? t.editBanner : t.addNewBanner}
          </h3>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
              <X size={14} /> {t.cancelEdit}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t.title}</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Banner title" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t.subtitle}</label>
            <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Optional subtitle" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t.desktopImage}</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t.mobileImage}</label>
            <input type="file" accept="image/*" onChange={(e) => setMobileImageFile(e.target.files[0])}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t.linkUrl}</label>
            <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="/shop or https://..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t.position}</label>
            <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
              {positionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category (optional)</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
              <option value="">None</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{language === "bn" ? (cat.nameBn || cat.name) : cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t.backgroundColorFallback}</label>
            <select value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
              {bgColorOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t.sortOrder}</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
          </div>
        </div>

        {form.image && !imageFile && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">{t.currentDesktopImage}</label>
            <img src={form.image.startsWith('http') ? form.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5004'}${form.image}`} alt="Preview" className="h-24 md:h-32 rounded-lg object-cover border" />
          </div>
        )}

        <button type="submit" className="mt-6 bg-pink-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-pink-700 transition flex items-center gap-2">
          {editingId ? <><Edit2 size={14} /> {t.updateBanner}</> : <><Plus size={14} /> {t.addBanner}</>}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">{t.banner}</th>
                <th className="px-4 py-3 font-medium">{t.position}</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">{t.order}</th>
                <th className="px-4 py-3 font-medium">{t.status}</th>
                <th className="px-4 py-3 font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t.loading}</td></tr>
              ) : banners.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t.noBannersFound}</td></tr>
              ) : paginatedBanners.map((banner) => (
                <tr key={banner.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {banner.image ? (
                        <img src={banner.image.startsWith('http') ? banner.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5004'}${banner.image}`} alt={banner.title} className="w-16 h-10 rounded object-cover" />
                      ) : (
                        <div className={`w-16 h-10 rounded bg-gradient-to-r ${banner.bgColor || "from-pink-500 to-pink-600"} flex items-center justify-center`}>
                          <span className="text-white text-[8px] font-bold">{t.noImg}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{banner.title}</p>
                        {banner.subtitle && <p className="text-xs text-gray-400">{banner.subtitle}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">{banner.position}</td>
                  <td className="px-4 py-3 text-sm">
                    {banner.category ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {language === "bn" ? (banner.category.nameBn || banner.category.name) : banner.category.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{banner.sortOrder}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(banner.id, banner.isActive)}
                      className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition ${
                        banner.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {banner.isActive ? t.active : t.inactive}
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

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={banners.length} itemsPerPage={ITEMS_PER_PAGE} />
    </div>
  );
}
