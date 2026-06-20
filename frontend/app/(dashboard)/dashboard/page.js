"use client";
import { ShoppingCart, Package, Users, DollarSign, TrendingUp, Truck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const recentOrders = [
  { id: "BM-001", customer: "Rahim Uddin", total: 1250, status: "DELIVERED", date: "2026-06-18" },
  { id: "BM-002", customer: "Karim Ahmed", total: 890, status: "OUT_FOR_DELIVERY", date: "2026-06-18" },
  { id: "BM-003", customer: "Fatima Begum", total: 2100, status: "PROCESSING", date: "2026-06-17" },
  { id: "BM-004", customer: "Sakib Hassan", total: 450, status: "PENDING", date: "2026-06-17" },
  { id: "BM-005", customer: "Nadia Khan", total: 1780, status: "CONFIRMED", date: "2026-06-17" },
];

const statusColors = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-indigo-50 text-indigo-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700",
  DELIVERED: "bg-green-50 text-green-700",
};

export default function DashboardPage() {
  const { t } = useLanguage();

  const stats = [
    { label: t.totalOrders, value: "1,234", icon: ShoppingCart, change: "+12%", color: "text-[#0067A0] bg-blue-50" },
    { label: t.totalProducts, value: "567", icon: Package, change: "+5%", color: "text-green-600 bg-green-50" },
    { label: t.totalUsers, value: "8,901", icon: Users, change: "+18%", color: "text-purple-600 bg-purple-50" },
    { label: t.revenue, value: "৳5,67,890", icon: DollarSign, change: "+23%", color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{t.dashboard} {t.overview}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1 font-medium">{stat.change} this month</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">{t.analytics}</h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp size={36} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Sales chart will appear here</p>
              <p className="text-sm mt-1">Connect to backend for live data</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">{t.orders}</h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Truck size={36} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Order status chart will appear here</p>
              <p className="text-sm mt-1">Connect to backend for live data</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">{t.recentOrders}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">{t.orderId}</th>
                <th className="px-4 py-3 font-medium">{t.myAccount}</th>
                <th className="px-4 py-3 font-medium">{t.total}</th>
                <th className="px-4 py-3 font-medium">{t.orderStatus}</th>
                <th className="px-4 py-3 font-medium">{t.orders}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-[#0067A0] text-sm">{order.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{order.customer}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">৳{order.total}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusColors[order.status] || ""}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
