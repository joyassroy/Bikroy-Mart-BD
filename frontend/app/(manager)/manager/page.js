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
    { label: t.totalProducts, value: "45", icon: Package, color: "text-[#00AFCC] bg-[#E8F4F8]" },
    { label: t.localOrders, value: "123", icon: ShoppingCart, color: "text-[#EC008C] bg-[#FCE8F3]" },
    { label: t.pendingDeliveries, value: "12", icon: Clock, color: "text-[#D4A017] bg-[#FFF8E1]" },
    { label: t.completedToday, value: "98", icon: CheckCircle, color: "text-[#00215B] bg-[#E8EDF5]" },
  ];

  return (
    <div>
      <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B] mb-3">{t.managerDashboard}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-2.5 sm:p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-[11px] text-[#667085]">{stat.label}</p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-[#000000] mt-0.5">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 sm:p-2.5 rounded-lg flex-shrink-0`}>
                <stat.icon size={18} className="sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] overflow-x-auto">
        <div className="p-3 border-b border-[#E5E7EB]">
          <h3 className="font-semibold text-[#000000] text-xs">{t.pendingDeliveries}</h3>
        </div>
        <table className="w-full min-w-[380px]">
          <thead>
            <tr className="text-left text-[10px] sm:text-[11px] text-[#667085] border-b border-[#E5E7EB]">
              <th className="px-3 py-2 font-medium">{t.orderId}</th>
              <th className="px-3 py-2 font-medium">{t.myAccount}</th>
              <th className="px-3 py-2 font-medium">{t.items}</th>
              <th className="px-3 py-2 font-medium">{t.total}</th>
              <th className="px-3 py-2 font-medium">{t.orderStatus}</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.map((order) => (
              <tr key={order.id} className="border-b border-[#F4F7FB] hover:bg-[#F4F7FB] transition">
                <td className="px-3 py-2 font-medium text-[#EC008C] text-[11px] sm:text-xs">{order.id}</td>
                <td className="px-3 py-2 text-[11px] sm:text-xs text-[#000000]">{order.customer}</td>
                <td className="px-3 py-2 text-[11px] sm:text-xs text-[#000000]">{order.items}</td>
                <td className="px-3 py-2 text-[11px] sm:text-xs font-medium text-[#000000]">৳{order.total}</td>
                <td className="px-3 py-2">
                  <button className="btn-primary text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-1">{t.assignRider}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
