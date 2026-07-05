"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import api from "@/lib/axios";

export default function DeliveryBanner() {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const [texts, setTexts] = useState({ deliveryCutoff: "", freeDelivery: "" });

  useEffect(() => {
    api.get("/settings/public")
      .then((res) => {
        const s = res.data.data || {};
        const isBn = language === "bn";
        setTexts({
          deliveryCutoff: isBn ? (s.deliveryCutoffBn || s.deliveryCutoff || t.deliveryCutoff) : (s.deliveryCutoff || t.deliveryCutoff),
          freeDelivery: isBn ? (s.freeDeliveryTextBn || s.freeDeliveryText || t.freeDelivery) : (s.freeDeliveryText || t.freeDelivery),
        });
      })
      .catch(() => {});
  }, [language]);

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/manager") || pathname.startsWith("/rider")) return null;

  return (
    <div className="fixed bottom-[60px] left-0 right-0 z-[80] md:hidden pointer-events-none px-3 pb-2">
      <div className="pointer-events-auto">
        <div className="bg-[#00215B] rounded-xl px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[11px] font-semibold leading-tight truncate">
              {texts.deliveryCutoff || t.deliveryCutoff}
            </p>
            <p className="text-white/60 text-[9px] mt-0.5">
              {texts.freeDelivery || t.freeDelivery}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
