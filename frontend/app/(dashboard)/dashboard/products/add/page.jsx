"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AddProductPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", nameBn: "", description: "", price: "", discountPrice: "",
    unit: "piece", minQuantity: "1", stock: "", sku: "", categoryId: "",
    subcategoryId: "", deliveryTime: "1-2 hours", isFeatured: false,
  });
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data || []));
  }, []);

  useEffect(() => {
    if (form.categoryId) {
      api.get(`/subcategories?categoryId=${form.categoryId}`).then((res) => setSubcategories(res.data.data || []));
    }
  }, [form.categoryId]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files).slice(0, 5)); // Max 5 images
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });
    
    imageFiles.forEach(file => {
      formData.append("images", file);
    });

    try {
      await api.post("/products", formData);
      toast.success(t.productCreated);
      router.push("/dashboard/products/all");
    } catch (err) { 
      toast.error(err.response?.data?.message || t.failed); 
    }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Link href="/dashboard/products/all" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
        <ArrowLeft size={18} /> {t.backToProducts}
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.addNewProduct}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.productName}</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.bengaliName}</label>
            <input type="text" value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.sku}</label>
            <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.category}</label>
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value, subcategoryId: "" })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
              <option value="">{t.selectCategory}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.subcategory}</label>
            <select value={form.subcategoryId} onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
              <option value="">{t.selectSubcategory}</option>
              {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.price}</label>
            <input type="number" required step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.discountPrice}</label>
            <input type="number" step="0.01" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.unit}</label>
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
              <option value="piece">{t.piece}</option>
              <option value="ekok">{t.unitEkok}</option>
              <option value="kg">{t.kilogram}</option>
              <option value="gram">{t.gram}</option>
              <option value="litre">{t.litre}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.minQuantity}</label>
            <input type="number" step="0.01" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.stock}</label>
            <input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.deliveryTime}</label>
            <input type="text" value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          </div>
          
          <div className="md:col-span-2 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.productImagesMax5}</label>
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{t.clickToUpload}</span> {t.orDragAndDrop}</p>
                        <p className="text-xs text-gray-500">{t.supportedImageFormats}</p>
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
            </div>
            {imageFiles.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {imageFiles.map((f, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <img src={URL.createObjectURL(f)} alt="preview" className="w-16 h-16 object-cover rounded border" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:col-span-2 mt-2">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="text-primary-600 rounded" />
            <label className="text-sm text-gray-700">{t.featuredProduct}</label>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="mt-6 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300">
          {loading ? t.creating : t.createProduct}
        </button>
      </form>
    </div>
  );
}
