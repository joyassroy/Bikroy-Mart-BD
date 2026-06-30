"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, Edit, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const emptyForm = {
  name: "", nameBn: "", description: "", descriptionBn: "", price: "",
  discountPrice: "", unit: "piece", minQuantity: "1", stock: "0",
  sku: "", categoryId: "", subcategoryId: "", isFeatured: false, deliveryTime: "",
};

export default function ManagerProductsPage() {
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
  const [districtPrice, setDistrictPrice] = useState("");
  const [districtDiscountPrice, setDistrictDiscountPrice] = useState("");
  const [existingDistrictPrice, setExistingDistrictPrice] = useState(null);
  const [savingDistrict, setSavingDistrict] = useState(false);
  const [managerProfile, setManagerProfile] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

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
    setDistrictPrice("");
    setDistrictDiscountPrice("");
    setExistingDistrictPrice(null);

    if (user?.assignedDistrict) {
      api.get(`/products/${p.id}/district-prices`).then((res) => {
        const all = res.data.data || [];
        const myDistrict = all.find((dp) => dp.district === user.assignedDistrict);
        if (myDistrict) {
          setExistingDistrictPrice(myDistrict);
          setDistrictPrice(myDistrict.price?.toString() || "");
          setDistrictDiscountPrice(myDistrict.discountPrice?.toString() || "");
        }
      }).catch(() => {});
    }

    setShowModal(true);
  };

  const handleDistrictPriceSave = async () => {
    if (!districtPrice) { toast.error("Enter a price"); return; }
    setSavingDistrict(true);
    try {
      await api.post(`/products/${editId}/district-prices`, {
        district: user.assignedDistrict,
        price: parseFloat(districtPrice),
        discountPrice: districtDiscountPrice ? parseFloat(districtDiscountPrice) : null,
      });
      toast.success(`Price set for ${user.assignedDistrict}`);
      const res = await api.get(`/products/${editId}/district-prices`);
      const all = res.data.data || [];
      setExistingDistrictPrice(all.find((dp) => dp.district === user.assignedDistrict) || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSavingDistrict(false);
    }
  };

  const handleDistrictPriceDelete = async () => {
    try {
      await api.delete(`/products/${editId}/district-prices/${user.assignedDistrict}`);
      setExistingDistrictPrice(null);
      setDistrictPrice("");
      setDistrictDiscountPrice("");
      toast.success("District price removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (!form.price) { toast.error("Price is required"); return; }
    if (!form.categoryId) { toast.error("Category is required"); return; }

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
        toast.success("Product updated!");
      } else {
        await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product created!");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
        <button onClick={openCreate} className="flex items-center gap-1 bg-[#EC008C] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#D60071] transition">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products yet. Click "Add Product" to create one.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-sm">{p.category?.name}</td>
                    <td className="px-4 py-3 text-sm">৳{p.price}</td>
                    <td className="px-4 py-3 text-sm">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(p)} title="Edit"
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-[#00215B]">{editId ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name *</label>
                <input name="name" value={form.name} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" placeholder="e.g. Fresh Mango" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name (Bengali)</label>
                <input name="nameBn" value={form.nameBn} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" placeholder="e.g. তাজা আম" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
                  <select name="categoryId" value={form.categoryId} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]">
                    <option value="">Select</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Subcategory</label>
                  <select name="subcategoryId" value={form.subcategoryId} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]">
                    <option value="">Select</option>
                    {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price (৳) *</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Discount Price (৳)</label>
                  <input name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                  <select name="unit" value={form.unit} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]">
                    <option value="piece">Piece</option>
                    <option value="kg">Kg</option>
                    <option value="liter">Liter</option>
                    <option value="dozen">Dozen</option>
                    <option value="box">Box</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Min Qty</label>
                  <input name="minQuantity" type="number" value={form.minQuantity} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Stock *</label>
                  <input name="stock" type="number" value={form.stock} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">SKU</label>
                  <input name="sku" value={form.sku} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Time</label>
                  <input name="deliveryTime" value={form.deliveryTime} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" placeholder="e.g. 2-3 days" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Images</label>
                <input type="file" multiple accept="image/*"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="rounded" />
                Featured Product
              </label>

              {editId && user?.assignedDistrict && (
                <div className="border-t border-[#E5E7EB] pt-3 mt-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Price for {user.assignedDistrict}
                  </label>
                  <p className="text-[10px] text-gray-400 mb-2">Set your district-specific price (overrides base price for your district)</p>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <input type="number" step="0.01" placeholder="District Price" value={districtPrice}
                        onChange={(e) => setDistrictPrice(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" />
                    </div>
                    <div className="flex-1">
                      <input type="number" step="0.01" placeholder="Discount Price" value={districtDiscountPrice}
                        onChange={(e) => setDistrictDiscountPrice(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#EC008C]" />
                    </div>
                    <button type="button" onClick={handleDistrictPriceSave} disabled={savingDistrict}
                      className="px-3 py-2 bg-[#00AFCC] text-white rounded-lg text-xs font-semibold hover:bg-[#009BB5] disabled:opacity-50 transition flex items-center gap-1">
                      {savingDistrict ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      Save
                    </button>
                    {existingDistrictPrice && (
                      <button type="button" onClick={handleDistrictPriceDelete}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition flex items-center gap-1">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full bg-[#EC008C] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#D60071] transition disabled:opacity-50">
                {submitting ? "Saving..." : editId ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
