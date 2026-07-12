"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import Pagination from "@/components/ui/Pagination";

const COLOR_SWATCHES = [
  { value: "", labelKey: "default", bg: "#ffffff", border: true },
  { value: "from-[#00215B] to-[#001A4A]", labelKey: "darkBlue", bg: "linear-gradient(135deg, #00215B, #001A4A)" },
  { value: "from-[#EC008C] to-[#D60071]", labelKey: "pink", bg: "linear-gradient(135deg, #EC008C, #D60071)" },
  { value: "from-[#00AFCC] to-[#009AB5]", labelKey: "teal", bg: "linear-gradient(135deg, #00AFCC, #009AB5)" },
  { value: "from-red-600 to-orange-500", labelKey: "redOrange", bg: "linear-gradient(135deg, #DC2626, #F97316)" },
  { value: "from-green-600 to-teal-500", labelKey: "greenTeal", bg: "linear-gradient(135deg, #16A34A, #14B8A6)" },
  { value: "from-blue-600 to-purple-500", labelKey: "purpleBlue", bg: "linear-gradient(135deg, #2563EB, #A855F7)" },
];

export default function BannersPage() {
  const { t, language } = useLanguage();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image: "",
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
  const [imagePreview, setImagePreview] = useState(null);

  const resetForm = () => {
    setForm({ title: "", subtitle: "", image: "", link: "", position: "hero", bgColor: "", categoryId: "", sortOrder: 0 });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const openModal = (banner = null) => {
    if (banner) {
      setEditingId(banner.id);
      setForm({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        image: banner.image || "",
        link: banner.link || "",
        position: banner.position || "hero",
        bgColor: banner.bgColor || "",
        categoryId: banner.categoryId || "",
        sortOrder: banner.sortOrder || 0,
      });
      setImagePreview(banner.image ? (banner.image.startsWith("http") ? banner.image : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5004"}${banner.image}`) : null);
    } else {
      resetForm();
    }
    setImageFile(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (imageFile) formData.append("image", imageFile);

    try {
      if (editingId) {
        await api.put(`/banners/${editingId}`, formData);
        toast.success(t.bannerUpdated);
      } else {
        await api.post("/banners", formData);
        toast.success(t.bannerCreated);
      }
      closeModal();
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

  const positionGroups = [
    {
      label: t.homepageBanners,
      options: [
        { value: "hero", label: t.heroMainBanner },
        { value: "center", label: t.centerMiddleBanner },
      ],
    },
    {
      label: t.offerBanners,
      options: [
        { value: "offer_flash_deal", label: t.offerFlashDealBanner },
        { value: "offer_combo", label: t.offerComboBanner },
        { value: "offer_executive", label: t.offerExecutiveBanner },
        { value: "offer_stock_clearance", label: t.offerStockClearanceBanner },
        { value: "offer_bogo", label: t.offerBogoBanner },
        { value: "offer_custom", label: t.offerCustomBanner },
      ],
    },
  ];

  const positionLabels = {};
  positionGroups.forEach(g => g.options.forEach(o => { positionLabels[o.value] = o.label; }));

  const getPositionBadgeColor = (pos) => {
    if (pos.startsWith("offer_")) return "bg-purple-100 text-purple-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t.banners}</h1>
        <button onClick={() => openModal()} className="bg-pink-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-pink-700 transition flex items-center gap-2 cursor-pointer">
          <Plus size={16} /> {t.addBanner}
        </button>
      </div>

      {/* Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingId ? t.editBanner : t.addNewBanner}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.position}</label>
                <div className="space-y-3">
                  {positionGroups.map((group) => (
                    <div key={group.label}>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">{group.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setForm({ ...form, position: opt.value })}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer border ${
                              form.position === opt.value
                                ? "bg-pink-600 text-white border-pink-600"
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300 hover:text-pink-600"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title + Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.title}</label>
                  <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="e.g. Summer Sale" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.subtitle} <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="e.g. Up to 50% off" />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.desktopImage}</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer hover:border-pink-400 transition">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="text-center">
                      <p className="text-sm text-gray-500">{t.clickToUpload}</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
                    </div>
                  </label>
                  {imagePreview && (
                    <div className="relative shrink-0">
                      <img src={imagePreview} alt="Preview" className="h-20 w-36 rounded-lg object-cover border" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setForm({ ...form, image: "" }); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.linkUrl} <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="/shop or https://..." />
              </div>

              {/* Background Color Swatches */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.backgroundColorFallback}</label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.value}
                      type="button"
                      onClick={() => setForm({ ...form, bgColor: swatch.value })}
                      className={`group flex flex-col items-center gap-1 cursor-pointer`}
                      title={t[swatch.labelKey]}
                    >
                      <div
                        className={`w-10 h-10 rounded-full border-2 transition ${
                          form.bgColor === swatch.value ? "border-pink-500 ring-2 ring-pink-200 scale-110" : "border-gray-200 hover:border-gray-300"
                        }`}
                        style={{ background: swatch.bg }}
                      />
                      <span className="text-[10px] text-gray-500 group-hover:text-gray-700">{t[swatch.labelKey]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.sortOrder}</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.category} <span className="text-gray-400 font-normal">(optional)</span></label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                    <option value="">None</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{language === "bn" ? (cat.nameBn || cat.name) : cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="bg-pink-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-pink-700 transition flex items-center gap-2 cursor-pointer">
                  {editingId ? <><Edit2 size={14} /> {t.updateBanner}</> : <><Plus size={14} /> {t.addBanner}</>}
                </button>
                <button type="button" onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2.5 cursor-pointer">
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">{t.banner}</th>
                <th className="px-4 py-3 font-medium">{t.position}</th>
                <th className="px-4 py-3 font-medium">{t.category}</th>
                <th className="px-4 py-3 font-medium">{t.order}</th>
                <th className="px-4 py-3 font-medium">{t.created}</th>
                <th className="px-4 py-3 font-medium">{t.status}</th>
                <th className="px-4 py-3 font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.loading}</td></tr>
              ) : banners.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.noBannersFound}</td></tr>
              ) : paginatedBanners.map((banner) => (
                <tr key={banner.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {banner.image ? (
                        <img src={banner.image.startsWith("http") ? banner.image : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5004"}${banner.image}`} alt={banner.title} className="w-16 h-10 rounded object-cover" />
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
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPositionBadgeColor(banner.position)}`}>
                      {positionLabels[banner.position] || banner.position}
                    </span>
                  </td>
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
                  <td className="px-4 py-3 text-xs text-gray-500">{banner.createdAt ? new Date(banner.createdAt).toLocaleString("en-BD", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
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
                      <button onClick={() => openModal(banner)} className="text-blue-500 hover:text-blue-700 transition cursor-pointer">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(banner.id)} className="text-red-500 hover:text-red-700 transition cursor-pointer">
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
