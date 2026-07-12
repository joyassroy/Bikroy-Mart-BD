"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { DollarSign, ShoppingCart, Truck, Clock, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ManagerTodaySalesPage() {
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
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B]">{t.todaySales}</h1>
        <button onClick={fetchData} className="flex items-center gap-1.5 text-[11px] text-[#667085] hover:text-[#EC008C] transition">
          <RefreshCw size={14} /> {t.refresh}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-lg h-20 animate-pulse border border-[#E5E7EB]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: t.todaySales, value: `৳${(stats?.todaySales || 0).toLocaleString()}`, icon: DollarSign, color: "text-[#EC008C] bg-[#FCE8F3]" },
            { label: t.todayOrders, value: stats?.todayOrders || 0, icon: ShoppingCart, color: "text-[#7C3AED] bg-[#F3E8FF]" },
            { label: t.todayDelivered, value: stats?.todayDeliveredOrders || 0, icon: Truck, color: "text-[#10B981] bg-[#ECFDF5]" },
            { label: t.pendingToday, value: stats?.todayPendingOrders || 0, icon: Clock, color: "text-[#D4A017] bg-[#FFF8E1]" },
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
      )}
    </div>
  );
}
