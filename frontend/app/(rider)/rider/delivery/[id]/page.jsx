"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useParams } from "next/navigation";
import LiveRiderMap from "@/components/tracking/LiveRiderMap";
import { Package, MapPin, Phone, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DeliveryPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${params.id}`).then((res) => setOrder(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, [params.id]);

  const handleDeliver = async () => {
    try {
      await api.put(`/riders/${params.id}/deliver`, { paymentMethod: order.paymentMethod });
      toast.success("Order delivered!");
      router.push("/rider");
    } catch (err) { toast.error("Failed"); }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Loading...</div>;
  if (!order) return <div className="p-6 text-center text-gray-400">Order not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Active Delivery</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Package size={20} className="text-primary-500" />
            <h2 className="font-semibold text-gray-800">#{order.orderNumber}</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><MapPin size={16} className="text-red-500" /><span>{order.deliveryAddress}</span></div>
            <div className="flex items-center gap-2"><Phone size={16} className="text-green-500" /><span>{order.user?.phone}</span></div>
            <p className="text-gray-600">District: {order.deliveryDistrict}</p>
            <p className="font-medium">Total: ৳{order.total}</p>
            <p className="text-gray-500">Payment: {order.paymentMethod} ({order.paymentStatus})</p>
            {order.customRequirement && (
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-amber-700 font-medium text-xs mb-1">Custom Requirement:</p>
                <p className="text-sm">{order.customRequirement}</p>
              </div>
            )}
            <div className="border-t pt-3 mt-3">
              <p className="font-medium mb-2">Items:</p>
              {order.items?.map((item) => (
                <p key={item.id} className="text-gray-600">{item.product?.name} × {item.quantity} = ৳{item.totalPrice}</p>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleDeliver}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2">
              <CheckCircle size={18} /> Mark as Delivered
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="h-[400px]">
            <LiveRiderMap
              destinationLat={order.deliveryLatitude}
              destinationLng={order.deliveryLongitude}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
