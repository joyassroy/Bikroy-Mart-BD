"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { MapPin, Phone, CheckCircle, Package } from "lucide-react";

export default function RiderCustomDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await api.put(`/custom-requests/${id}/complete`);
      toast.success("Delivery completed!");
      fetchDeliveries();
    } catch (err) {
      toast.error("Failed to complete delivery");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Custom Deliveries</h1>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : deliveries.length === 0 ? (
        <div className="text-center py-10">
          <Package size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No active custom deliveries</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((del) => (
            <div key={del.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">{del.requestNumber}</p>
                  <p className="text-sm font-bold text-[#00215B]">{del.productName}</p>
                  <p className="text-xs text-gray-500">{del.quantity} {del.unit}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700">
                  {del.status === "OUT_FOR_DELIVERY" ? "Out for Delivery" : "Shipped"}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Phone size={12} className="text-[#EC008C]" />
                  <span className="font-medium">{del.user?.name}</span>
                  <span className="text-gray-400">|</span>
                  <a href={`tel:${del.user?.phone}`} className="text-[#EC008C] font-semibold">{del.user?.phone}</a>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <MapPin size={12} className="text-[#EC008C] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{del.deliveryAddress}, {del.deliveryUpazila}, {del.deliveryDistrict}, {del.deliveryDivision}</span>
                </div>
              </div>

              {del.images?.length > 0 && (
                <div className="flex gap-1.5 mb-3">
                  {del.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-12 h-12 rounded object-cover border" />
                  ))}
                </div>
              )}

              <button onClick={() => markDelivered(del.id)}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition">
                <CheckCircle size={16} />
                Mark as Delivered
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
