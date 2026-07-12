"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { DollarSign, ShoppingCart, Truck, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function TodaySalesPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    api.get("/analytics/stats")
      .then((res) => setStats(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Link href="/dashboard/orders" className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#EC008C] mb-3 transition">
        <ArrowLeft size={14} /> {t.allOrders}
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.todaySales}</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-28 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{t.todaySales}</p>
                <p className="text-3xl font-bold text-pink-600 mt-2">৳{(stats?.todaySales || 0).toLocaleString()}</p>
              </div>
              <div className="bg-pink-50 p-3 rounded-xl"><DollarSign size={24} className="text-pink-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{t.todayDelivered}</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.todayDeliveredOrders || 0}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl"><Truck size={24} className="text-green-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{t.pendingToday}</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.todayPendingOrders || 0}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl"><Clock size={24} className="text-yellow-600" /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
