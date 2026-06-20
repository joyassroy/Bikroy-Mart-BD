"use client";
import { useState } from "react";
import { User, Truck, Star, Package } from "lucide-react";

export default function RiderProfilePage() {
  const [profile] = useState({
    name: "Demo Rider",
    email: "rider@bikroymart.com",
    phone: "01712345678",
    vehicleType: "Bike",
    vehicleNumber: "DH-12345",
    assignedZila: "Dhaka",
    totalDeliveries: 156,
    ratings: 4.8,
    isAvailable: true,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{profile.name}</h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Package className="mx-auto text-blue-500 mb-1" size={24} />
              <p className="text-2xl font-bold text-gray-800">{profile.totalDeliveries}</p>
              <p className="text-xs text-gray-500">Total Deliveries</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <Star className="mx-auto text-amber-500 mb-1" size={24} />
              <p className="text-2xl font-bold text-gray-800">{profile.ratings}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b"><span className="text-gray-500 text-sm">Phone</span><span className="text-sm font-medium">{profile.phone}</span></div>
            <div className="flex justify-between py-2 border-b"><span className="text-gray-500 text-sm">Vehicle</span><span className="text-sm font-medium">{profile.vehicleType}</span></div>
            <div className="flex justify-between py-2 border-b"><span className="text-gray-500 text-sm">Vehicle Number</span><span className="text-sm font-medium">{profile.vehicleNumber}</span></div>
            <div className="flex justify-between py-2 border-b"><span className="text-gray-500 text-sm">Zone</span><span className="text-sm font-medium">{profile.assignedZila}</span></div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500 text-sm">Status</span>
              <span className={`text-sm font-medium ${profile.isAvailable ? "text-green-600" : "text-gray-500"}`}>
                {profile.isAvailable ? "Available" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
