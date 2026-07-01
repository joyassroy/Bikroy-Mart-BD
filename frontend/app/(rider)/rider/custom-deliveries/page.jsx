"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { MapPin, Phone, CheckCircle, Package, User, ClipboardList, Loader2, Image as ImageIcon, Navigation } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import dynamic from "next/dynamic";
const LiveRiderMap = dynamic(() => import("@/components/tracking/LiveRiderMap"), { ssr: false });
const LocationMapModal = dynamic(() => import("@/components/ui/LocationMapModal"), { ssr: false });
import useSocket from "@/helper/useSocket";

function CustomDeliveryCard({ del, completingId, markDelivered, t }) {
  const { liveRiderLocation } = useSocket(del.id);
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EC008C]/10 to-[#EC008C]/5 flex items-center justify-center flex-shrink-0">
              <Package size={16} className="text-[#EC008C]" />
            </div>
            <div>
              <p className="text-[10px] text-[#D0D5DD] font-medium">{del.requestNumber}</p>
              <p className="text-sm font-bold text-[#000000] mt-0.5">{del.productName}</p>
              <p className="text-[11px] text-[#667085] mt-0.5">{del.quantity} {del.unit}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
            del.status === "OUT_FOR_DELIVERY"
              ? "bg-orange-50 text-orange-700 border-orange-200"
              : "bg-purple-50 text-purple-700 border-purple-200"
          }`}>
            {del.status === "OUT_FOR_DELIVERY" ? (t.outForDelivery || "Out for Delivery") : (t.shipped || "Shipped")}
          </span>
        </div>

        <div className="bg-[#F9FAFB] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <User size={12} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-[#667085]">{t.customer || "Customer"}</p>
              <p className="text-xs font-medium text-[#000000]">{del.user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <Phone size={12} className="text-green-500" />
            </div>
            <div>
              <p className="text-[10px] text-[#667085]">{t.phone || "Phone"}</p>
              <a href={`tel:${del.user?.phone}`} className="text-xs font-semibold text-[#EC008C] hover:underline">{del.user?.phone}</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={12} className="text-red-500" />
            </div>
            <div>
              <p className="text-[10px] text-[#667085]">{t.deliveryAddress || "Delivery Address"}</p>
              <p className="text-xs font-medium text-[#000000]">{del.deliveryAddress}, {del.deliveryUpazila}, {del.deliveryDistrict}, {del.deliveryDivision}</p>
            </div>
          </div>
        </div>

        {del.deliveryLatitude && del.deliveryLongitude && (
          <div className="mt-3 rounded-xl overflow-hidden border border-[#E5E7EB]" style={{ height: "200px" }}>
            <LiveRiderMap
              riderLat={liveRiderLocation?.lat || null}
              riderLng={liveRiderLocation?.lng || null}
              destinationLat={del.deliveryLatitude}
              destinationLng={del.deliveryLongitude}
            />
          </div>
        )}

        {del.images?.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <ImageIcon size={12} className="text-[#667085]" />
              <p className="text-[10px] text-[#667085] font-medium">{t.productImages || "Product Images"}</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {del.images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-16 h-16 rounded-xl object-cover border border-[#E5E7EB] flex-shrink-0" />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <a href={`tel:${del.user?.phone}`}
            className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-xl text-xs font-semibold hover:bg-green-100 transition border border-green-200">
            <Phone size={14} /> {t.callCustomer || "Call Customer"}
          </a>
          {del.deliveryLatitude && del.deliveryLongitude && (
            <button
              onClick={() => setShowMap(true)}
              className="flex items-center justify-center gap-2 bg-[#F4F7FB] text-[#00215B] px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#E8EDF4] transition border border-[#E5E7EB]"
            >
              <Navigation size={14} />
            </button>
          )}
          <button
            onClick={() => markDelivered(del.id)}
            disabled={completingId === del.id}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 rounded-xl text-xs font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-60"
          >
            {completingId === del.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            {completingId === del.id ? (t.processing || "Processing...") : (t.markAsDelivered || "Mark as Delivered")}
          </button>
        </div>
      </div>
      {del.deliveryLatitude && del.deliveryLongitude && (
        <LocationMapModal
          show={showMap}
          onClose={() => setShowMap(false)}
          lat={del.deliveryLatitude}
          lng={del.deliveryLongitude}
          label="Delivery Location"
          title="Delivery Location"
        />
      )}
    </div>
  );
}

export default function RiderCustomDeliveriesPage() {
  const { t } = useLanguage();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => { fetchDeliveries(); }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/custom-requests/rider/active");
      setDeliveries(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markDelivered = async (id) => {
    setCompletingId(id);
    try {
      await api.put(`/custom-requests/${id}/complete`);
      toast.success(t.deliveryCompletedSuccess || "Delivery completed!");
      fetchDeliveries();
    } catch (err) {
      toast.error(t.deliveryCompleteError || "Failed to complete delivery");
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl h-12 w-48 border border-[#E5E7EB]" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl h-48 border border-[#E5E7EB]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#000000]">{t.customDeliveries || "Custom Deliveries"}</h1>
          <p className="text-[11px] text-[#667085] mt-0.5">{deliveries.length} {t.activeDeliveries || "active deliveries"}</p>
        </div>
      </div>

      {deliveries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F4F7FB] flex items-center justify-center mx-auto mb-3">
            <ClipboardList size={28} className="text-[#D0D5DD]" />
          </div>
          <p className="text-sm font-medium text-[#667085]">{t.noActiveCustomDeliveries || "No active custom deliveries"}</p>
          <p className="text-[11px] text-[#D0D5DD] mt-1">{t.customOrdersWillAppear || "Custom orders will appear here"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((del) => (
            <CustomDeliveryCard
              key={del.id}
              del={del}
              completingId={completingId}
              markDelivered={markDelivered}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
