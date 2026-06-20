"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Truck, Phone, MapPin } from "lucide-react";

export default function ManagerRidersPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/riders").then((res) => setRiders(res.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Available Riders</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl h-40 animate-pulse shadow-sm"></div>)
        ) : riders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 col-span-3">No riders available</div>
        ) : (
          riders.map((rider) => (
            <div key={rider.id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{rider.user?.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Phone size={12} />{rider.user?.phone || "N/A"}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${rider.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {rider.isAvailable ? "Available" : "Offline"}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>Vehicle: {rider.vehicleType || "N/A"}</p>
                <p>Deliveries: {rider.totalDeliveries}</p>
                <p>Rating: ⭐ {rider.ratings?.toFixed(1) || "0.0"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
