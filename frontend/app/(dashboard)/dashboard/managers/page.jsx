"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { MapPin, Package } from "lucide-react";

export default function ManagersPage() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/managers").then((res) => setManagers(res.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Zila Managers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl h-40 animate-pulse shadow-sm"></div>)
        ) : managers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 col-span-3">No managers found</div>
        ) : (
          managers.map((manager) => (
            <div key={manager.id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{manager.user?.name}</h3>
                  <p className="text-sm text-gray-500">{manager.user?.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-primary-500" />
                  {manager.assignedDistrict}, {manager.assignedZila}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package size={14} className="text-green-500" />
                  {manager._count?.products || 0} products
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
