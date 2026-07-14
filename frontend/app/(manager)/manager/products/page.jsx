"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, Edit, X, Loader2, Search, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLanguage } from "@/i18n/LanguageContext";
import Pagination from "@/components/ui/Pagination";

const emptyForm = {
  name: "", nameBn: "", description: "", descriptionBn: "", price: "",
  discountPrice: "", unit: "piece", minQuantity: "1", stock: "0",
  sku: "", categoryId: "", subcategoryId: "", isFeatured: false, deliveryTime: "",
};

export default function ManagerProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const user = useSelector((state) => state.user?.data);
  const [managerProfile, setManagerProfile] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchManagerProfile();
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (form.categoryId) {
      api.get(`/subcategories?categoryId=${form.categoryId}`).then((res) => setSubcategories(res.data.data || [])).catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }
  }, [form.categoryId]);

  const fetchManagerProfile = async () => {
    try {
      const res = await api.get("/managers/products", { params: { _profile: true } });
      if (res.data.managerProfile) setManagerProfile(res.data.managerProfile);
    } catch {}
  };

  const fetchProducts = async () => {
    try { const res = await api.get("/managers/products"); setProducts(res.data.data || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = searchQuery
    ? products.filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const fetchCategories = async () => {
    try { const res = await api.get("/categories"); setCategories(res.data.data || []); }
    catch (err) { console.error(err); }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setSelectedFiles([]);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name || "", nameBn: p.nameBn || "", description: p.description || "",
      descriptionBn: p.descriptionBn || "", price: p.price || "", discountPrice: p.discountPrice || "",
      unit: p.unit || "piece", minQuantity: p.minQuantity || "1", stock: p.stock || "0",
      sku: p.sku || "", categoryId: p.categoryId || "", subcategoryId: p.subcategoryId || "",
      isFeatured: p.isFeatured || false, deliveryTime: p.deliveryTime || "",
    });
    setSelectedFiles([]);
    setExistingImages(p.images || []);

    // Fetch DistrictPrice for manager's district to pre-fill price
    if (user?.assignedDistrict) {
      api.get(`/products/${p.id}/district-prices`).then((res) => {
        const dp = (res.data.data || []).find((d) => d.district === user.assignedDistrict);
        if (dp) {
          setForm((prev) => ({
            ...prev,
            price: dp.price?.toString() || prev.price,
            discountPrice: dp.discountPrice?.toString() || "",
          }));
        }
      }).catch(() => {});
    }

    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId && !form.name.trim()) { toast.error(t.nameRequired); return; }
    if (!editId && !form.price) { toast.error(t.priceRequired); return; }
    if (!editId && !form.categoryId) { toast.error(t.categoryRequired); return; }

    try {
      setSubmitting(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) fd.append(k, v);
      });
      if (editId) {
        existingImages.forEach((img) => fd.append("existingImages", img));
      }
      selectedFiles.forEach((file) => fd.append("images", file));

      if (editId) {
        await api.put(`/products/${editId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success(t.productUpdated);
      } else {
        await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success(t.productCreated);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || t.saveError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t.myProducts}</h1>
        <button onClick={openCreate} className="flex items-center gap-1 bg-[#EC008C] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#D60071] transition">
          <Plus size={16} /> {t.addProduct}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder || "Search products..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:border-[#EC008C] transition"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">{t.product}</th>
                <th className="px-4 py-3 font-medium">{t.category}</th>
                <th className="px-4 py-3 font-medium">{t.price}</th>
                <th className="px-4 py-3 font-medium">{t.stock}</th>
                <th className="px-4 py-3 font-medium">{t.status}</th>
                <th className="px-4 py-3 font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.loading}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.notFound}</td></tr>
              ) : (
                paginated.map((p, idx) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{p.category?.name}</td>
                    <td className="px-4 py-3 text-sm">৳{p.price}</td>
                    <td className="px-4 py-3 text-sm">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.isActive ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(p)} title={t.edit}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                          <Edit size={14} />
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

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-[#00215B]">{editId ? t.editProduct : t.addProduct}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {!editId && (
              <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t.productName}</label>
                <input name="name" value={form.name} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" placeholder="e.g. Fresh Mango" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t.productNameBn}</label>
                <input name="nameBn" value={form.nameBn} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" placeholder="e.g. তাজা আম" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.category}</label>
                  <select name="categoryId" value={form.categoryId} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]">
                    <option value="">{t.select}</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.subcategory}</label>
                  <select name="subcategoryId" value={form.subcategoryId} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]">
                    <option value="">{t.select}</option>
                    {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t.description}</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.price}</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" placeholder="0.00" />
                </div>
                <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{t.discountPrice}</label>
                  <input name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.unit}</label>
                  <select name="unit" value={form.unit} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]">
                    <option value="piece">{t.piece}</option>
                    <option value="ekok">{t.unitEkok}</option>
                    <option value="kg">{t.kg}</option>
                    <option value="gram">{t.gram}</option>
                    <option value="liter">{t.liter}</option>
                    <option value="dozen">{t.dozen}</option>
                    <option value="box">{t.box}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.minQty}</label>
                  <input name="minQuantity" type="number" value={form.minQuantity} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.stock}</label>
                  <input name="stock" type="number" value={form.stock} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.sku}</label>
                  <input name="sku" value={form.sku} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.deliveryTime}</label>
                  <input name="deliveryTime" value={form.deliveryTime} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" placeholder={t.deliveryTimePlaceholder} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t.images}</label>
                <input type="file" multiple accept="image/*"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="rounded" />
                {t.featuredProduct}
              </label>
              </>
              )}

              {editId && (
                <div className="border-t border-[#E5E7EB] pt-3 mt-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {t.price} — {user?.assignedDistrict || "District"}
                      </label>
                      <input name="price" type="number" value={form.price} onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" />
                    </div>
                    <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.discountPrice}</label>
                      <input name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t.stock}</label>
                    <input name="stock" type="number" value={form.stock} onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" />
                  </div>
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full bg-[#EC008C] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#D60071] transition disabled:opacity-50">
                {submitting ? t.saving : editId ? t.updateProduct : t.createProduct}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
