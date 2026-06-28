"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { BarChart3, TrendingUp, Users, Package, DollarSign, ShoppingCart, Loader2, MapPin } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { useLanguage } from "@/i18n/LanguageContext";

const STATUS_COLORS = {
  PENDING: "#F59E0B",
  CONFIRMED: "#3B82F6",
  PROCESSING: "#8B5CF6",
  SHIPPED: "#6366F1",
  OUT_FOR_DELIVERY: "#EC008C",
  DELIVERED: "#10B981",
  CANCELLED: "#EF4444",
  RETURNED: "#6B7280",
};

const ZILA_COLORS = ["#EC008C", "#00215B", "#00AFCC", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#6366F1", "#F97316", "#14B8A6"];

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [revenueByDistrict, setRevenueByDistrict] = useState([]);
  const [productsByZila, setProductsByZila] = useState([]);
  const [ordersByZila, setOrdersByZila] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [statsRes, salesRes, statusRes, catsRes, distRes, prodZilaRes, ordZilaRes] = await Promise.all([
        api.get("/analytics/stats"),
        api.get("/analytics/sales-trend?days=30"),
        api.get("/analytics/orders-by-status"),
        api.get("/analytics/top-categories"),
        api.get("/analytics/revenue-by-district"),
        api.get("/analytics/products-by-zila"),
        api.get("/analytics/orders-by-zila"),
      ]);
      setStats(statsRes.data.data || {});
      setSalesTrend(salesRes.data.data || []);
      setOrdersByStatus(statusRes.data.data || []);
      setTopCategories(catsRes.data.data || []);
      setRevenueByDistrict(distRes.data.data || []);
      setProductsByZila(prodZilaRes.data.data || []);
      setOrdersByZila(ordZilaRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-pink-500" size={32} />
      </div>
    );
  }

  const summaryCards = [
    { label: t.revenue, value: `৳${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
    { label: t.totalOrders, value: stats?.totalOrders?.toLocaleString() || "0", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50" },
    { label: t.totalUsers, value: stats?.totalUsers?.toLocaleString() || "0", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
    { label: t.totalProducts, value: stats?.totalProducts?.toLocaleString() || "0", icon: Package, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  const secondaryCards = [
    { label: t.pending, value: stats?.pendingOrders || 0, color: "text-yellow-600" },
    { label: t.delivered, value: stats?.deliveredOrders || 0, color: "text-green-600" },
    { label: t.cancelled, value: stats?.cancelledOrders || 0, color: "text-red-600" },
    { label: t.activeDeals, value: stats?.totalFlashDeals || 0, color: "text-blue-600" },
  ];

  const zilaBarData = ordersByZila.map((z) => ({ zila: z.zila, orders: z.totalOrders, revenue: z.totalRevenue }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className="text-xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`${card.bg} p-3 rounded-full`}>
                <card.icon size={20} className={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {secondaryCards.map((card, i) => (
          <div key={i} className="bg-white rounded-lg p-3 shadow-sm text-center">
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
            <p className="text-[10px] text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-pink-500" /> Sales Trend (30 Days)
          </h3>
          {salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#EC008C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" /> Orders by Status
          </h3>
          {ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ status, count }) => `${status.replace("_", " ")}: ${count}`}>
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.status] || "#999"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No orders yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-purple-500" /> Top Selling Categories
          </h3>
          {topCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="productCount" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No category data</div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-green-500" /> Revenue by Zila
          </h3>
          {revenueByDistrict.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueByDistrict}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="district" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No zila data</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-[#EC008C]" /> Orders by Zila
          </h3>
          {zilaBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={zilaBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="zila" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value, name) => name === "revenue" ? [`৳${value.toLocaleString()}`, "Revenue"] : [value, "Orders"]} />
                <Legend />
                <Bar dataKey="orders" fill="#00215B" radius={[4, 4, 0, 0]} name="Orders" />
                <Bar dataKey="revenue" fill="#EC008C" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No zila order data</div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-[#00AFCC]" /> Products Sold by Zila
          </h3>
          {productsByZila.length > 0 ? (
            <div className="overflow-y-auto max-h-[320px]">
              {productsByZila.map((zilaData, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ZILA_COLORS[i % ZILA_COLORS.length] }} />
                      <span className="text-sm font-bold text-gray-800">{zilaData.zila}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <span className="font-semibold text-green-600">৳{zilaData.totalRevenue.toLocaleString()}</span>
                      <span>{zilaData.totalQuantity} items</span>
                      <span>{zilaData.totalProducts} products</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 pl-5">
                    {zilaData.topProducts.map((product, j) => (
                      <div key={j} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 truncate max-w-[180px]">{product.name}</span>
                        <div className="flex items-center gap-3 text-gray-400">
                          <span>×{product.quantity}</span>
                          <span className="text-gray-600 font-medium">৳{product.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No product sales data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
