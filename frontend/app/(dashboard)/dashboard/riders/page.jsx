"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Truck, MapPin, Phone } from "lucide-react";

export default function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/riders").then((res) => setRiders(res.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Riders</h1>
      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Rider</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Zone</th>
                <th className="px-4 py-3 font-medium">Deliveries</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : riders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No riders found</td></tr>
              ) : (
                riders.map((rider) => (
                  <tr key={rider.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{rider.user?.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Phone size={12} />{rider.user?.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{rider.vehicleType || "N/A"}</td>
                    <td className="px-4 py-3 text-sm">{rider.assignedZila || "N/A"}</td>
                    <td className="px-4 py-3 text-sm font-medium">{rider.totalDeliveries}</td>
                    <td className="px-4 py-3 text-sm">⭐ {rider.ratings?.toFixed(1) || "0.0"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${rider.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {rider.isAvailable ? "Available" : "Offline"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
