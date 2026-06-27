"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import EditProductModal from "@/components/product/EditProductModal";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editProductId, setEditProductId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/products?limit=50&includeInactive=true${search ? `&search=${search}` : ""}`);
      setProducts(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    setDeleteModal(null);
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <Link href="/dashboard/products/add" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 flex items-center gap-2">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search products..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
              className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#E5E7EB]"
            />
          </div>
        </div>
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
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products found</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          p.images[0].startsWith("http") || p.images[0].startsWith("/") ? (
                            <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded border border-[#E5E7EB]" />
                          ) : (
                            <span className="text-2xl">{p.images[0]}</span>
                          )
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{p.category?.name}</td>
                    <td className="px-4 py-3 text-sm font-medium">৳{p.price}</td>
                    <td className="px-4 py-3 text-sm">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditProductId(p.id)} className="text-blue-500 hover:text-blue-700"><Edit size={16} /></button>
                        <button onClick={() => setDeleteModal(p)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editProductId && (
        <EditProductModal
          productId={editProductId}
          onClose={() => setEditProductId(null)}
          onUpdated={fetchProducts}
        />
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-5 z-10">
            <h3 className="text-sm font-semibold text-[#000000] mb-1">Delete Product</h3>
            <p className="text-xs text-[#667085] mb-4">
              Are you sure you want to delete <span className="font-medium text-[#000000]">{deleteModal.name}</span>?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2 text-xs font-semibold border border-[#E5E7EB] rounded-lg text-[#364152] hover:bg-[#F4F7FB] transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteModal.id)} className="flex-1 px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
