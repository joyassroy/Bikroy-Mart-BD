"use client";
import { useState } from "react";
import { Package, Truck, CheckCircle, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const sampleDeliveries = [
  { id: "BM-201", customer: "Rahim Uddin", phone: "01712345678", address: "123 Mirpur Road, Dhaka", items: 3, total: 1250, lat: 23.7461, lng: 90.3742 },
  { id: "BM-202", customer: "Karim Ahmed", phone: "01812345678", address: "456 Uttara, Dhaka", items: 2, total: 890, lat: 23.8759, lng: 90.3795 },
];

export default function RiderDashboard() {
  const [activeDelivery, setActiveDelivery] = useState(null);
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B]">{t.activeDeliveries}</h1>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] sm:text-[11px] text-green-600 font-semibold">{t.online}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] text-center">
          <Package className="mx-auto text-[#EC008C] mb-1" size={18} />
          <p className="text-base sm:text-lg font-bold text-[#000000]">5</p>
          <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5">{t.todayDeliveries}</p>
        </div>
        <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] text-center">
          <Truck className="mx-auto text-[#D4A017] mb-1" size={18} />
          <p className="text-base sm:text-lg font-bold text-[#000000]">2</p>
          <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5">{t.pendingDeliveries}</p>
        </div>
        <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] text-center">
          <CheckCircle className="mx-auto text-green-500 mb-1" size={18} />
          <p className="text-base sm:text-lg font-bold text-[#000000]">3</p>
          <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5">{t.completedToday}</p>
        </div>
      </div>

      {activeDelivery && (
        <div className="bg-white rounded-lg p-3 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB] mb-4">
          <h2 className="font-semibold text-[#000000] text-xs mb-2">{t.activeDeliveries}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Package size={12} className="text-[#EC008C] flex-shrink-0" />
                  <span className="font-medium text-[#000000] text-[11px] sm:text-xs">{activeDelivery.id}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={12} className="text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] sm:text-[11px] text-[#000000]">{activeDelivery.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-green-500 flex-shrink-0" />
                  <span className="text-[10px] sm:text-[11px] text-[#000000]">{activeDelivery.phone}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#667085]">{t.items}: {activeDelivery.items} | {t.total}: ৳{activeDelivery.total}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="bg-green-600 text-white px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium hover:bg-green-700 transition">{t.markDelivered}</button>
                <button onClick={() => setActiveDelivery(null)} className="btn-secondary text-[11px] sm:text-xs px-3 py-1.5">{t.cancel}</button>
              </div>
            </div>
            <div className="bg-[#F4F7FB] rounded-md h-40 sm:h-48 flex items-center justify-center text-[#E5E7EB]">
              <div className="text-center">
                <MapPin size={24} className="mx-auto mb-1" />
                <p className="text-[10px] sm:text-xs">Map will load with Leaflet</p>
                <a href={`https://www.openstreetmap.org/?mlat=${activeDelivery.lat}&mlon=${activeDelivery.lng}#map=15/${activeDelivery.lat}/${activeDelivery.lng}`} target="_blank" rel="noopener noreferrer" className="text-[#00AFCC] text-[10px] sm:text-[11px] hover:underline font-semibold mt-1 inline-block">
                  {t.viewOnMap}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
        <div className="p-3 border-b border-[#E5E7EB]">
          <h3 className="font-semibold text-[#000000] text-xs">{t.pendingDeliveries}</h3>
        </div>
        <div className="divide-y divide-[#F4F7FB]">
          {sampleDeliveries.map((delivery) => (
            <div key={delivery.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-[#000000] text-[11px] sm:text-xs">{delivery.id} - {delivery.customer}</p>
                <p className="text-[10px] sm:text-[11px] text-[#667085] mt-0.5 truncate">{delivery.address}</p>
                <p className="text-[10px] sm:text-[11px] text-[#667085]">{t.items}: {delivery.items} | ৳{delivery.total}</p>
              </div>
              <button onClick={() => setActiveDelivery(delivery)} className="btn-primary text-[10px] sm:text-[11px] flex-shrink-0">{t.startDelivery}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
