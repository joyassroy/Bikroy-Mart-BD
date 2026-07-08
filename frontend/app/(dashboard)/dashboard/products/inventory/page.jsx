"use client";
import { useState, useEffect, useMemo } from "react";
import api from "@/lib/axios";
import { AlertTriangle, Package, TrendingUp, Search, Download, Upload, Plus, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "@/components/ui/Pagination";

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const lowStockThreshold = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products?includeInactive=true");
      setProducts(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const inStock = total - lowStock - outOfStock;

    return { total, lowStock, outOfStock, inStock };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const search = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(search) ||
        (p.sku && p.sku.toLowerCase().includes(search))
      );
    });
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginated = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: "Out of Stock", color: "bg-red-100 text-red-600" };
    if (stock <= lowStockThreshold) return { status: "Low Stock", color: "bg-orange-100 text-orange-600" };
    return { status: "In Stock", color: "bg-green-100 text-green-600" };
  };

  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventory Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">In Stock</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.inStock}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Low Stock</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.lowStock}</h3>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Out of Stock</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.outOfStock}</h3>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <Package size={24} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#E5E7EB] text-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Download size={16} /> Export
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#00215B] text-white rounded-lg text-sm font-medium hover:bg-[#001A4A]">
            <Upload size={16} /> Import
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500 border-b">
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Stock Level</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading inventory...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No products found.</td></tr>
              ) : (
                paginated.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.images?.[0] || "/placeholder.png"} 
                            alt={product.name} 
                            className="w-10 h-10 rounded object-cover border bg-gray-50"
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-800">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category?.name || 'Uncategorized'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-500">
                        {product.sku || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{product.stock}</span>
                          <span className="text-xs text-gray-500">units</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        ৳{product.price}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-[#EC008C] hover:bg-pink-50 rounded-lg transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredProducts.length} itemsPerPage={ITEMS_PER_PAGE} />
    </div>
  );
}
