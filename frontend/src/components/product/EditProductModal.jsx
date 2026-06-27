"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";

export default function EditProductModal({ productId, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: "", nameBn: "", description: "", price: "", discountPrice: "",
    unit: "piece", minQuantity: "1", stock: "", sku: "", categoryId: "",
    subcategoryId: "", deliveryTime: "1-2 hours", isFeatured: false, isActive: true,
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/products/${productId}`),
      api.get("/categories"),
    ]).then(([prodRes, catRes]) => {
      const p = prodRes.data.data;
      setForm({
        name: p.name || "", nameBn: p.nameBn || "", description: p.description || "",
        price: p.price?.toString() || "", discountPrice: p.discountPrice?.toString() || "",
        unit: p.unit || "piece", minQuantity: p.minQuantity?.toString() || "1",
        stock: p.stock?.toString() || "", sku: p.sku || "",
        categoryId: p.categoryId || "", subcategoryId: p.subcategoryId || "",
        deliveryTime: p.deliveryTime || "1-2 hours",
        isFeatured: p.isFeatured || false, isActive: p.isActive ?? true,
      });
      setExistingImages(p.images || []);
      setCategories(catRes.data.data || []);
      if (p.categoryId) {
        api.get(`/subcategories?categoryId=${p.categoryId}`).then((res) => {
          setSubcategories(res.data.data || []);
        });
      }
    }).catch(() => {
      toast.error("Failed to load product");
      onClose();
    }).finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (form.categoryId) {
      api.get(`/subcategories?categoryId=${form.categoryId}`).then((res) => {
        setSubcategories(res.data.data || []);
      });
    }
  }, [form.categoryId]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      setNewImageFiles((prev) => [...prev, ...Array.from(e.target.files)].slice(0, 5 - existingImages.length));
    }
  };

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("nameBn", form.nameBn);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("discountPrice", form.discountPrice || "");
    formData.append("unit", form.unit);
    formData.append("minQuantity", form.minQuantity);
    formData.append("stock", form.stock);
    formData.append("sku", form.sku);
    formData.append("categoryId", form.categoryId);
    formData.append("subcategoryId", form.subcategoryId);
    formData.append("deliveryTime", form.deliveryTime);
    formData.append("isFeatured", form.isFeatured);
    formData.append("isActive", form.isActive);

    existingImages.forEach((img) => formData.append("images", img));
    newImageFiles.forEach((file) => formData.append("images", file));

    try {
      await api.put(`/products/${productId}`, formData);
      toast.success("Product updated!");
      onUpdated?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-8 z-10 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#EC008C]" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-5 py-3 flex items-center justify-between rounded-t-xl">
          <h2 className="text-sm font-semibold text-[#000000]">Edit Product</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[#F3F4F6] transition text-[#667085]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">Product Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#EC008C]" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">Bengali Name</label>
              <input type="text" value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#EC008C]" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">SKU</label>
              <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#EC008C]" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">Category *</label>
              <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value, subcategoryId: "" })}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#EC008C]">
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">Subcategory</label>
              <select value={form.subcategoryId} onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#EC008C]">
                <option value="">Select Subcategory</option>
                {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">Price (৳) *</label>
              <input type="number" required step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#EC008C]" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">Discount Price (৳)</label>
              <input type="number" step="0.01" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#EC008C]" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#EC008C]">
                <option value="piece">Piece</option>
                <option value="kg">Kilogram</option>
                <option value="litre">Litre</option>
                <option value="gram">Gram</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">Min Quantity</label>
              <input type="number" step="0.01" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#EC008C]" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">Stock *</label>
              <input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#EC008C]" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">Delivery Time</label>
              <input type="text" value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#EC008C]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#EC008C]" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[#364152] mb-1">Images</label>
              {existingImages.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {existingImages.map((img, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      <img src={img} alt="" className="w-14 h-14 object-cover rounded border border-[#E5E7EB]" />
                      <button type="button" onClick={() => removeExistingImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] hover:bg-red-600">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {newImageFiles.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {newImageFiles.map((f, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      <img src={URL.createObjectURL(f)} alt="" className="w-14 h-14 object-cover rounded border border-[#E5E7EB]" />
                      <button type="button" onClick={() => removeNewImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] hover:bg-red-600">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {(existingImages.length + newImageFiles.length) < 5 && (
                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-[#E5E7EB] rounded-lg cursor-pointer hover:bg-[#F4F7FB] transition">
                  <div className="flex items-center gap-2 text-[11px] text-[#667085]">
                    <ImageIcon size={14} />
                    <span>Click to add images ({existingImages.length + newImageFiles.length}/5)</span>
                  </div>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex items-center gap-4 md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-[#E5E7EB] text-[#EC008C] focus:ring-[#EC008C]" />
                <span className="text-[11px] text-[#364152] font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-[#E5E7EB] text-[#EC008C] focus:ring-[#EC008C]" />
                <span className="text-[11px] text-[#364152] font-medium">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-[#E5E7EB]">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-xs font-semibold border border-[#E5E7EB] rounded-lg text-[#364152] hover:bg-[#F4F7FB] transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-xs font-semibold bg-[#EC008C] text-white rounded-lg hover:bg-[#D60071] disabled:opacity-50 transition flex items-center gap-1.5">
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
