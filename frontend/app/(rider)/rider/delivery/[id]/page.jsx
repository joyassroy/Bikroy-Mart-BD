"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const LiveRiderMap = dynamic(() => import("@/components/tracking/LiveRiderMap"), { ssr: false });
const LocationMapModal = dynamic(() => import("@/components/ui/LocationMapModal"), { ssr: false });
import useSocket from "@/helper/useSocket";
import { Package, MapPin, Phone, CheckCircle, ArrowLeft, Navigation, CreditCard, FileText, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const statusConfig = {
  PENDING: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Pending" },
  CONFIRMED: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Confirmed" },
  PROCESSING: { color: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Processing" },
  SHIPPED: { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Shipped" },
  OUT_FOR_DELIVERY: { color: "bg-orange-50 text-orange-700 border-orange-200", label: "Out for Delivery" },
  DELIVERED: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Delivered" },
};

const deliverySteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-2xl h-10 w-48 border border-[#E5E7EB]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl h-80 border border-[#E5E7EB]" />
        <div className="bg-white rounded-2xl h-80 border border-[#E5E7EB]" />
      </div>
    </div>
  );
}

export default function DeliveryPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState(false);
  const { liveRiderLocation, connected, orderStatus } = useSocket(order?.id);
  const [showNavigateMap, setShowNavigateMap] = useState(false);

  useEffect(() => {
    let pollTimer;
    const fetchOrder = () => {
      api.get(`/orders/${params.id}`)
        .then((res) => setOrder(res.data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    };
    fetchOrder();
    pollTimer = setInterval(fetchOrder, 10000);
    return () => clearInterval(pollTimer);
  }, [params.id]);

  useEffect(() => {
    if (orderStatus && orderStatus.orderId === params.id) {
      api.get(`/orders/${params.id}`)
        .then((res) => setOrder(res.data.data))
        .catch(console.error);
    }
  }, [orderStatus, params.id]);

  const handleDeliver = async () => {
    setDelivering(true);
    try {
      await api.put(`/riders/${params.id}/deliver`, { paymentMethod: order.paymentMethod });
      toast.success(t.orderDeliveredSuccess || "Order delivered successfully!");
      router.push("/rider");
    } catch (err) {
      toast.error(t.deliveryCompleteError || "Failed to complete delivery");
    } finally {
      setDelivering(false);
    }
  };

  if (loading) return <SkeletonLoader />;
  if (!order) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-[#F4F7FB] flex items-center justify-center mx-auto mb-3">
        <Package size={28} className="text-[#D0D5DD]" />
      </div>
      <p className="text-sm font-medium text-[#667085]">{t.orderNotFound || "Order not found"}</p>
    </div>
  );

  const currentStepIndex = deliverySteps.indexOf(order.orderStatus);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F4F7FB] transition">
          <ArrowLeft size={16} className="text-[#667085]" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#000000]">#{order.orderNumber}</h1>
          <p className="text-[11px] text-[#667085]">{t.activeDelivery || "Active Delivery"}</p>
        </div>
        <span className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusConfig[order.orderStatus]?.color || "bg-gray-50 text-gray-600 border-gray-200"}`}>
          {statusConfig[order.orderStatus]?.label || order.orderStatus}
        </span>
      </div>

      {/* Delivery Progress Stepper */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB]">
        <p className="text-[11px] font-semibold text-[#667085] mb-4">{t.deliveryProgress || "Delivery Progress"}</p>
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-2 left-6 right-6 h-0.5 bg-gray-200" />
          <div className="absolute top-2 left-6 h-0.5 bg-[#EC008C] transition-all duration-500" style={{ width: `${(currentStepIndex / (deliverySteps.length - 1)) * 100}%`, maxWidth: "calc(100% - 48px)" }} />
          {deliverySteps.map((step, idx) => (
            <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                idx <= currentStepIndex
                  ? "bg-[#EC008C] border-[#EC008C]"
                  : "bg-white border-gray-300"
              }`}>
                {idx <= currentStepIndex && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className={`text-[8px] font-medium hidden sm:block ${idx <= currentStepIndex ? "text-[#EC008C]" : "text-[#D0D5DD]"}`}>
                {statusConfig[step]?.label?.split(" ").slice(0, 2).join(" ") || step}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Order Details */}
        <div className="lg:col-span-3 space-y-4">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <User size={14} className="text-blue-500" />
              </div>
              <h3 className="font-semibold text-sm text-[#000000]">{t.customerInfo || "Customer Info"}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-[#667085] mb-0.5">{t.customer || "Customer"}</p>
                  <p className="text-xs font-medium text-[#000000]">{order.user?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#667085] mb-0.5">{t.phone || "Phone"}</p>
                  <a href={`tel:${order.user?.phone}`} className="text-xs font-semibold text-[#EC008C] hover:underline">{order.user?.phone}</a>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-[#667085] mb-0.5">{t.deliveryAddress || "Delivery Address"}</p>
                  <p className="text-xs font-medium text-[#000000]">{order.deliveryAddress}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#667085] mb-0.5">{t.district || "District"}</p>
                  <p className="text-xs font-medium text-[#000000]">{order.deliveryDistrict}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <a href={`tel:${order.user?.phone}`}
                className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-xl text-xs font-semibold hover:bg-green-100 transition border border-green-200">
                <Phone size={14} /> {t.callCustomer || "Call Customer"}
              </a>
              {order.deliveryLatitude && order.deliveryLongitude && (
                <button
                  onClick={() => setShowNavigateMap(true)}
                  className="flex items-center justify-center gap-2 bg-[#F4F7FB] text-[#00215B] px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#E8EDF4] transition border border-[#E5E7EB]"
                >
                  <Navigation size={14} /> {t.navigate || "Navigate"}
                </button>
              )}
            </div>
          </div>

          {/* Payment & Order Info */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <CreditCard size={14} className="text-purple-500" />
              </div>
              <h3 className="font-semibold text-sm text-[#000000]">{t.paymentInfo || "Payment Info"}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F9FAFB] rounded-xl p-3">
                <p className="text-[10px] text-[#667085]">{t.paymentMethod || "Payment Method"}</p>
                <p className="text-xs font-semibold text-[#000000] mt-0.5">{order.paymentMethod}</p>
              </div>
              <div className="bg-[#F9FAFB] rounded-xl p-3">
                <p className="text-[10px] text-[#667085]">{t.paymentStatus || "Payment Status"}</p>
                <p className={`text-xs font-semibold mt-0.5 ${order.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>{order.paymentStatus}</p>
              </div>
              <div className="bg-[#F9FAFB] rounded-xl p-3 col-span-2">
                <p className="text-[10px] text-[#667085]">{t.orderTotal || "Order Total"}</p>
                <p className="text-lg font-bold text-[#000000] mt-0.5">৳{order.total}</p>
              </div>
            </div>
          </div>

          {/* Custom Requirement */}
          {order.customRequirement && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-amber-600" />
                <h3 className="font-semibold text-sm text-amber-800">{t.customRequirement || "Custom Requirement"}</h3>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">{order.customRequirement}</p>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <Package size={14} className="text-orange-500" />
              </div>
              <h3 className="font-semibold text-sm text-[#000000]">{t.items || "Items"} ({order.items?.length || 0})</h3>
            </div>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-[#F4F7FB] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#F4F7FB] flex items-center justify-center text-[10px] font-bold text-[#667085]">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#000000]">{item.product?.name}</p>
                      <p className="text-[10px] text-[#667085]">× {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-[#000000]">৳{item.totalPrice}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Deliver Button */}
          <button
            onClick={handleDeliver}
            disabled={delivering}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-60"
          >
            {delivering ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle size={18} />
            )}
            {delivering ? (t.processing || "Processing...") : (t.markAsDelivered || "Mark as Delivered")}
          </button>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden sticky top-20">
            <div className="px-5 py-3 border-b border-[#F4F7FB] flex items-center gap-2">
              <MapPin size={14} className="text-[#EC008C]" />
              <h3 className="font-semibold text-sm text-[#000000]">{t.deliveryLocation || "Delivery Location"}</h3>
              {connected && (
                <div className="ml-auto flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-semibold text-emerald-600">Live</span>
                </div>
              )}
            </div>
            <div className="h-[300px] lg:h-[calc(100vh-200px)]">
              {order.deliveryLatitude && order.deliveryLongitude ? (
                <LiveRiderMap
                  riderLat={liveRiderLocation?.lat || order.rider?.currentLat || undefined}
                  riderLng={liveRiderLocation?.lng || order.rider?.currentLng || undefined}
                  destinationLat={order.deliveryLatitude}
                  destinationLng={order.deliveryLongitude}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-[#F9FAFB]">
                  <div className="text-center">
                    <MapPin size={28} className="mx-auto mb-2 text-[#D0D5DD]" />
                    <p className="text-xs text-[#667085]">{t.noLocationAvailable || "No location available"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {order?.deliveryLatitude && order?.deliveryLongitude && (
        <LocationMapModal
          show={showNavigateMap}
          onClose={() => setShowNavigateMap(false)}
          lat={order.deliveryLatitude}
          lng={order.deliveryLongitude}
          label="Delivery Location"
          title="Navigate to Delivery"
        />
      )}
    </div>
  );
}
