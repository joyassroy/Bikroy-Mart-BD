"use client";
import { Package, ShoppingCart, Clock, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const pendingOrders = [
  { id: "BM-101", customer: "Rahim", items: 3, total: 890, status: "PENDING" },
  { id: "BM-102", customer: "Karim", items: 5, total: 1250, status: "CONFIRMED" },
  { id: "BM-103", customer: "Fatima", items: 2, total: 450, status: "PROCESSING" },
];

export default function ManagerDashboard() {
  const { t } = useLanguage();

  const stats = [
    { label: t.totalProducts, value: "45", icon: Package, color: "text-[#0067A0] bg-blue-50" },
    { label: t.localOrders, value: "123", icon: ShoppingCart, color: "text-green-600 bg-green-50" },
    { label: t.pendingDeliveries, value: "12", icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: t.completedToday, value: "98", icon: CheckCircle, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{t.managerDashboard}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">{t.pendingDeliveries}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">{t.orderId}</th>
                <th className="px-4 py-3 font-medium">{t.myAccount}</th>
                <th className="px-4 py-3 font-medium">{t.items}</th>
                <th className="px-4 py-3 font-medium">{t.total}</th>
                <th className="px-4 py-3 font-medium">{t.orderStatus}</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-[#0067A0] text-sm">{order.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{order.customer}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{order.items}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">৳{order.total}</td>
                  <td className="px-4 py-3">
                    <button className="btn-primary text-xs px-3 py-1.5">{t.assignRider}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
