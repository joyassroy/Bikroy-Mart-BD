"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { DollarSign, ShoppingCart, Package, TrendingUp, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ManagerTotalSalesPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/managers/stats");
      setStats(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Link href="/manager/orders" className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#EC008C] mb-3 transition">
        <ArrowLeft size={14} /> {t.allOrders}
      </Link>

      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B]">{t.totalSales}</h1>
        <button onClick={fetchData} className="flex items-center gap-1.5 text-[11px] text-[#667085] hover:text-[#EC008C] transition">
          <RefreshCw size={14} /> {t.refresh}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-lg h-20 animate-pulse border border-[#E5E7EB]" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
            {[
              { label: t.totalSales, value: `৳${(stats?.todaySales || 0).toLocaleString()}`, icon: DollarSign, color: "text-[#EC008C] bg-[#FCE8F3]" },
              { label: t.totalOrders, value: stats?.totalOrders || 0, icon: ShoppingCart, color: "text-[#00AFCC] bg-[#E8F4F8]" },
              { label: t.activeProducts, value: stats?.activeProducts || 0, icon: Package, color: "text-[#00215B] bg-[#E8EDF5]" },
              { label: t.pendingDeliveries, value: stats?.pendingOrders || 0, icon: TrendingUp, color: "text-[#D4A017] bg-[#FFF8E1]" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-lg p-2.5 sm:p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#667085]">{s.label}</p>
                    <p className="text-base sm:text-lg font-bold text-[#000000] mt-0.5">{s.value}</p>
                  </div>
                  <div className={`${s.color} p-2 rounded-lg flex-shrink-0`}>
                    <s.icon size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg p-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
            <h3 className="font-semibold text-[#000000] text-xs mb-3">{t.totalSales}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#EC008C]">৳{(stats?.todaySales || 0).toLocaleString()}</p>
                <p className="text-xs text-[#667085] mt-1">{t.todaySales}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#00215B]">{stats?.totalOrders || 0}</p>
                <p className="text-xs text-[#667085] mt-1">{t.totalOrders}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
