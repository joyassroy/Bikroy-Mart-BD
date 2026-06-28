"use client";
import { useState, useEffect } from "react";
import { User, Truck, Star, Package, MapPin, Phone, Mail, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useSelector } from "react-redux";

export default function RiderProfilePage() {
  const user = useSelector((state) => state.user?.data);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [statsRes] = await Promise.all([
          api.get("/riders/stats").catch(() => ({ data: { data: null } })),
        ]);
        setStats(statsRes.data.data);
        setProfile({
          name: user?.name || "Rider",
          email: user?.email || "",
          phone: user?.phone || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[#EC008C]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#00215B] mb-3">My Profile</h1>
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg p-4 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] border border-[#E5E7EB]">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#F4F7FB]">
            <div className="w-14 h-14 bg-[#FCE8F3] rounded-full flex items-center justify-center">
              <User size={28} className="text-[#EC008C]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#000000]">{profile?.name}</h2>
              <p className="text-[11px] sm:text-xs text-[#667085]">{profile?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#F4F7FB] rounded-lg p-3 text-center">
              <Package className="mx-auto text-[#00AFCC] mb-1" size={20} />
              <p className="text-lg sm:text-xl font-bold text-[#000000]">{stats?.totalDeliveries ?? 0}</p>
              <p className="text-[10px] sm:text-[11px] text-[#667085]">Total Deliveries</p>
            </div>
            <div className="bg-[#FFF8E1] rounded-lg p-3 text-center">
              <Star className="mx-auto text-[#D4A017] mb-1" size={20} />
              <p className="text-lg sm:text-xl font-bold text-[#000000]">{stats?.ratings?.toFixed(1) ?? "0.0"}</p>
              <p className="text-[10px] sm:text-[11px] text-[#667085]">Rating</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2.5">
            <div className="flex justify-between py-2 border-b border-[#F4F7FB]">
              <span className="text-[#667085] text-[11px] sm:text-xs flex items-center gap-1.5"><Phone size={12} /> Phone</span>
              <span className="text-[11px] sm:text-xs font-medium text-[#000000]">{profile?.phone || "N/A"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F4F7FB]">
              <span className="text-[#667085] text-[11px] sm:text-xs flex items-center gap-1.5"><Mail size={12} /> Email</span>
              <span className="text-[11px] sm:text-xs font-medium text-[#000000]">{profile?.email || "N/A"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F4F7FB]">
              <span className="text-[#667085] text-[11px] sm:text-xs flex items-center gap-1.5"><Truck size={12} /> Active Today</span>
              <span className="text-[11px] sm:text-xs font-medium text-[#000000]">{stats?.todayDelivered ?? 0} delivered</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#667085] text-[11px] sm:text-xs flex items-center gap-1.5"><MapPin size={12} /> Status</span>
              <span className={`text-[11px] sm:text-xs font-medium flex items-center gap-1 ${stats?.isAvailable ? "text-green-600" : "text-gray-500"}`}>
                {stats?.isAvailable ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                {stats?.isAvailable ? "Available" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
