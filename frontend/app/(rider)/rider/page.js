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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.activeDeliveries}</h1>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-green-600 font-medium">{t.online}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <Package className="mx-auto text-[#0067A0] mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">5</p>
          <p className="text-sm text-gray-500 mt-1">{t.todayDeliveries}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <Truck className="mx-auto text-orange-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">2</p>
          <p className="text-sm text-gray-500 mt-1">{t.pendingDeliveries}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">3</p>
          <p className="text-sm text-gray-500 mt-1">{t.completedToday}</p>
        </div>
      </div>

      {activeDelivery && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">{t.activeDeliveries}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-[#0067A0]" />
                  <span className="font-medium text-gray-900 text-sm">{activeDelivery.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-red-500" />
                  <span className="text-sm text-gray-900">{activeDelivery.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-green-500" />
                  <span className="text-sm text-gray-900">{activeDelivery.phone}</span>
                </div>
                <p className="text-sm text-gray-500">{t.items}: {activeDelivery.items} | {t.total}: ৳{activeDelivery.total}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">{t.markDelivered}</button>
                <button onClick={() => setActiveDelivery(null)} className="btn-secondary text-sm px-4 py-2">{t.cancel}</button>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg h-56 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MapPin size={36} className="mx-auto mb-2" />
                <p className="text-sm">Map will load with Leaflet</p>
                <a href={`https://www.openstreetmap.org/?mlat=${activeDelivery.lat}&mlon=${activeDelivery.lng}#map=15/${activeDelivery.lat}/${activeDelivery.lng}`} target="_blank" rel="noopener noreferrer" className="text-[#0067A0] text-sm hover:underline font-medium mt-1 inline-block">
                  {t.viewOnMap}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">{t.pendingDeliveries}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {sampleDeliveries.map((delivery) => (
            <div key={delivery.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">{delivery.id} - {delivery.customer}</p>
                <p className="text-sm text-gray-500 mt-1">{delivery.address}</p>
                <p className="text-sm text-gray-500">{t.items}: {delivery.items} | ৳{delivery.total}</p>
              </div>
              <button onClick={() => setActiveDelivery(delivery)} className="btn-primary">{t.startDelivery}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
