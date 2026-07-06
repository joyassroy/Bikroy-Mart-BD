"use client";
import { useState, useEffect, useMemo } from "react";
import api from "@/lib/axios";
import { Package, AlertTriangle, TrendingUp, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ManagerInventoryPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const lowStockThreshold = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/managers/products");
      setProducts(res.data.data || []);
    } catch (err) {
      toast.error(t.failedToLoadInventory);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= lowStockThreshold).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const inStock = total - lowStock - outOfStock;
    return { total, lowStock, outOfStock, inStock };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: t.outOfStock, color: "bg-red-100 text-red-600" };
    if (stock <= lowStockThreshold) return { label: t.lowStock, color: "bg-orange-100 text-orange-600" };
    return { label: t.inStock, color: "bg-green-100 text-green-600" };
  };

  const handleStockUpdate = async (productId, newStock) => {
    const stock = parseInt(newStock, 10);
    if (isNaN(stock) || stock < 0) {
      toast.error(t.invalidStockValue);
      return;
    }
    setUpdatingId(productId);
    try {
      await api.put(`/products/${productId}/stock`, { stock });
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock } : p)));
      toast.success(t.stockUpdatedSuccess);
    } catch (err) {
      toast.error(err.response?.data?.message || t.failedToUpdateStock);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.inventoryDashboard}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t.inStock}</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.inStock}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t.lowStock}</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.lowStock}</h3>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
            <AlertTriangle size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t.outOfStock}</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.outOfStock}</h3>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <Package size={24} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t.searchByNameOrSku}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#E5E7EB] text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500 border-b">
                <th className="px-6 py-4 font-medium">{t.product}</th>
                <th className="px-6 py-4 font-medium">{t.sku}</th>
                <th className="px-6 py-4 font-medium">{t.stockLevel}</th>
                <th className="px-6 py-4 font-medium">{t.status}</th>
                <th className="px-6 py-4 font-medium">{t.price}</th>
                <th className="px-6 py-4 font-medium text-right">{t.updateStock}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <Loader2 size={20} className="animate-spin mx-auto mb-2 text-[#EC008C]" />
                    {t.loadingInventory}
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {products.length === 0 ? t.noProductsAssigned : t.noResults}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            product.images[0].startsWith("http") || product.images[0].startsWith("/") ? (
                              <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded object-cover border bg-gray-50" />
                            ) : (
                              <span className="text-2xl">{product.images[0]}</span>
                            )
                          ) : (
                            <span className="text-2xl">📦</span>
                          )}
                          <div>
                            <p className="font-medium text-sm text-gray-800">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category?.name || t.uncategorized}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-500">{product.sku || t.notAvailable}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{product.stock}</span>
                          <span className="text-xs text-gray-500">{t.units}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">৳{product.price}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            defaultValue={product.stock}
                            min={0}
                            disabled={updatingId === product.id}
                            className="w-20 border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#EC008C] disabled:opacity-50"
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (val !== product.stock) handleStockUpdate(product.id, val);
                            }}
                          />
                          {updatingId === product.id && <Loader2 size={14} className="animate-spin text-[#EC008C]" />}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
