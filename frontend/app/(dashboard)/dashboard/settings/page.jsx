"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Settings, Store, CreditCard, Truck, Shield, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      setSettings(res.data.data || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
    } finally { setLoading(false); }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSection = async (keys) => {
    try {
      setSaving(keys[0]);
      const data = {};
      for (const key of keys) {
        data[key] = settings[key] || "";
      }
      await api.put("/settings", data);
      toast.success("Settings saved");
    } catch (err) {
      toast.error("Failed to save");
    } finally { setSaving(null); }
  };

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "delivery", label: "Delivery", icon: Truck },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-pink-500" size={32} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-pink-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Store size={20} className="text-pink-500" /> General Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input type="text" value={settings.storeName || ""} onChange={(e) => handleChange("storeName", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input type="text" value={settings.storePhone || ""} onChange={(e) => handleChange("storePhone", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={settings.storeEmail || ""} onChange={(e) => handleChange("storeEmail", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={settings.storeAddress || ""} onChange={(e) => handleChange("storeAddress", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <input type="text" value={settings.currency || "BDT"} onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <input type="text" value={settings.timezone || "Asia/Dhaka"} onChange={(e) => handleChange("timezone", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
          </div>
          <button onClick={() => saveSection(["storeName", "storePhone", "storeEmail", "storeAddress", "currency", "timezone"])}
            disabled={saving === "storeName"}
            className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2 transition">
            {saving === "storeName" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save General Settings
          </button>
        </div>
      )}

      {activeTab === "payment" && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-green-500" /> Payment Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SSLCommerz Store ID</label>
              <input type="text" value={settings.sslcommerzStoreId || ""} onChange={(e) => handleChange("sslcommerzStoreId", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Your store ID" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SSLCommerz Store Password</label>
              <input type="password" value={settings.sslcommerzStorePassword || ""} onChange={(e) => handleChange("sslcommerzStorePassword", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Your store password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sandbox Mode</label>
              <select value={settings.sslcommerzSandbox || "true"} onChange={(e) => handleChange("sslcommerzSandbox", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                <option value="true">Enabled (Testing)</option>
                <option value="false">Disabled (Live)</option>
              </select>
            </div>
          </div>
          <button onClick={() => saveSection(["sslcommerzStoreId", "sslcommerzStorePassword", "sslcommerzSandbox"])}
            disabled={saving === "sslcommerzStoreId"}
            className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2 transition">
            {saving === "sslcommerzStoreId" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Payment Settings
          </button>
        </div>
      )}

      {activeTab === "delivery" && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Truck size={20} className="text-amber-500" /> Delivery Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Minimum (৳)</label>
              <input type="number" value={settings.freeDeliveryMinimum || ""} onChange={(e) => handleChange("freeDeliveryMinimum", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Delivery Charge (৳)</label>
              <input type="number" value={settings.defaultDeliveryCharge || ""} onChange={(e) => handleChange("defaultDeliveryCharge", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Within District Delivery (৳)</label>
              <input type="number" value={settings.deliveryWithinDistrict || ""} onChange={(e) => handleChange("deliveryWithinDistrict", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outside District Delivery (৳)</label>
              <input type="number" value={settings.deliveryOutsideDistrict || ""} onChange={(e) => handleChange("deliveryOutsideDistrict", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
          </div>
          <button onClick={() => saveSection(["freeDeliveryMinimum", "defaultDeliveryCharge", "deliveryWithinDistrict", "deliveryOutsideDistrict"])}
            disabled={saving === "freeDeliveryMinimum"}
            className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2 transition">
            {saving === "freeDeliveryMinimum" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Delivery Settings
          </button>
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-purple-500" /> Security & Email Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">JWT Secret</label>
              <input type="password" value={settings.jwtSecret || ""} onChange={(e) => handleChange("jwtSecret", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Your JWT secret" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
              <input type="text" value={settings.smtpHost || ""} onChange={(e) => handleChange("smtpHost", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
              <input type="text" value={settings.smtpPort || "587"} onChange={(e) => handleChange("smtpPort", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP User</label>
              <input type="text" value={settings.smtpUser || ""} onChange={(e) => handleChange("smtpUser", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
              <input type="password" value={settings.smtpPassword || ""} onChange={(e) => handleChange("smtpPassword", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Your SMTP password" />
            </div>
          </div>
          <button onClick={() => saveSection(["jwtSecret", "smtpHost", "smtpPort", "smtpUser", "smtpPassword"])}
            disabled={saving === "jwtSecret"}
            className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2 transition">
            {saving === "jwtSecret" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Security Settings
          </button>
        </div>
      )}
    </div>
  );
}
