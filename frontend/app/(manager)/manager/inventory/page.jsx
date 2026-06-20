"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Package, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function ManagerInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/managers/products").then((res) => setProducts(res.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const updateStock = async (productId, stock) => {
    try { await api.put(`/products/${productId}/stock`, { stock }); toast.success("Stock updated"); }
    catch (err) { toast.error("Failed"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventory Management</h1>
      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Current Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Update Stock</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-sm">{p.stock}</td>
                    <td className="px-4 py-3">
                      {p.stock <= 5 ? (
                        <span className="flex items-center gap-1 text-xs text-red-600"><AlertTriangle size={14} /> Low Stock</span>
                      ) : (
                        <span className="text-xs text-green-600">In Stock</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={p.stock} min={0}
                          className="w-20 border rounded px-2 py-1 text-sm"
                          onBlur={(e) => updateStock(p.id, parseInt(e.target.value))} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
