"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function GeneralSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      setSettings(res.data.data);
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put("/settings", settings);
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-4 text-gray-500">Loading settings...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">General Settings</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        
        <div className="mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Store Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={settings.storeName || ""}
                onChange={(e) => handleChange("storeName", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
              <input
                type="email"
                value={settings.storeEmail || ""}
                onChange={(e) => handleChange("storeEmail", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Phone</label>
              <input
                type="text"
                value={settings.storePhone || ""}
                onChange={(e) => handleChange("storePhone", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
              <input
                type="text"
                value={settings.storeAddress || ""}
                onChange={(e) => handleChange("storeAddress", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery & Currency</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <input
                type="text"
                value={settings.currency || ""}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Minimum (৳)</label>
              <input
                type="number"
                value={settings.freeDeliveryMinimum || ""}
                onChange={(e) => handleChange("freeDeliveryMinimum", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (Inside District)</label>
              <input
                type="number"
                value={settings.deliveryWithinDistrict || ""}
                onChange={(e) => handleChange("deliveryWithinDistrict", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (Outside District)</label>
              <input
                type="number"
                value={settings.deliveryOutsideDistrict || ""}
                onChange={(e) => handleChange("deliveryOutsideDistrict", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Promo Bar Text</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Text (English)</label>
              <input
                type="text"
                value={settings.freeDeliveryText || ""}
                onChange={(e) => handleChange("freeDeliveryText", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none"
                placeholder="Free delivery on orders over ৳1500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Text (বাংলা)</label>
              <input
                type="text"
                value={settings.freeDeliveryTextBn || ""}
                onChange={(e) => handleChange("freeDeliveryTextBn", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none"
                placeholder="১৫০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Cutoff Text (English)</label>
              <input
                type="text"
                value={settings.deliveryCutoff || ""}
                onChange={(e) => handleChange("deliveryCutoff", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none"
                placeholder="Order before 11:00 AM for same-day delivery"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Cutoff Text (বাংলা)</label>
              <input
                type="text"
                value={settings.deliveryCutoffBn || ""}
                onChange={(e) => handleChange("deliveryCutoffBn", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EC008C] focus:outline-none"
                placeholder="দৈনিক ১১:০০ টার আগে অর্ডার করুন একই দিনে ডেলিভারি পান"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#EC008C] text-white font-medium rounded-lg hover:bg-[#D60071] transition-colors"
          >
            Save Settings
          </button>
        </div>

      </form>
    </div>
  );
}
