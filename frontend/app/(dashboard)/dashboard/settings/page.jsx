"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Settings, Store, CreditCard, Truck, Shield, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";

export default function SettingsPage() {
  const { t } = useLanguage();
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
      toast.error(t.failedToLoadSettings);
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
      toast.success(t.settingsSaved);
    } catch (err) {
      toast.error(t.failedToSave);
    } finally { setSaving(null); }
  };

  const tabs = [
    { id: "general", label: t.general, icon: Store },
    { id: "payment", label: t.payment, icon: CreditCard },
    { id: "delivery", label: t.delivery, icon: Truck },
    { id: "security", label: t.security, icon: Shield },
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.settings}</h1>

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
            <Store size={20} className="text-pink-500" /> {t.generalSettings}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.storeName}</label>
              <input type="text" value={settings.storeName || ""} onChange={(e) => handleChange("storeName", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.contactPhone}</label>
              <input type="text" value={settings.storePhone || ""} onChange={(e) => handleChange("storePhone", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input type="email" value={settings.storeEmail || ""} onChange={(e) => handleChange("storeEmail", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.address}</label>
              <input type="text" value={settings.storeAddress || ""} onChange={(e) => handleChange("storeAddress", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.currency}</label>
              <input type="text" value={settings.currency || "BDT"} onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.timezone}</label>
              <input type="text" value={settings.timezone || "Asia/Dhaka"} onChange={(e) => handleChange("timezone", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
          </div>
          <button onClick={() => saveSection(["storeName", "storePhone", "storeEmail", "storeAddress", "currency", "timezone"])}
            disabled={saving === "storeName"}
            className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2 transition">
            {saving === "storeName" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {t.saveGeneralSettings}
          </button>
        </div>
      )}

      {activeTab === "payment" && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-green-500" /> {t.paymentSettings}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.sslCommerzStoreId}</label>
              <input type="text" value={settings.sslcommerzStoreId || ""} onChange={(e) => handleChange("sslcommerzStoreId", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Your store ID" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.sslCommerzStorePassword}</label>
              <input type="password" value={settings.sslcommerzStorePassword || ""} onChange={(e) => handleChange("sslcommerzStorePassword", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Your store password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.sandboxMode}</label>
              <select value={settings.sslcommerzSandbox || "true"} onChange={(e) => handleChange("sslcommerzSandbox", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                <option value="true">{t.enabledTesting}</option>
                <option value="false">{t.disabledLive}</option>
              </select>
            </div>
          </div>
          <button onClick={() => saveSection(["sslcommerzStoreId", "sslcommerzStorePassword", "sslcommerzSandbox"])}
            disabled={saving === "sslcommerzStoreId"}
            className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2 transition">
            {saving === "sslcommerzStoreId" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {t.savePaymentSettings}
          </button>
        </div>
      )}

      {activeTab === "delivery" && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Truck size={20} className="text-amber-500" /> {t.deliverySettings}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.freeDeliveryMinimum}</label>
              <input type="number" value={settings.freeDeliveryMinimum || ""} onChange={(e) => handleChange("freeDeliveryMinimum", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.defaultDeliveryCharge}</label>
              <input type="number" value={settings.defaultDeliveryCharge || ""} onChange={(e) => handleChange("defaultDeliveryCharge", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.withinDistrictDelivery}</label>
              <input type="number" value={settings.deliveryWithinDistrict || ""} onChange={(e) => handleChange("deliveryWithinDistrict", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.outsideDistrictDelivery}</label>
              <input type="number" value={settings.deliveryOutsideDistrict || ""} onChange={(e) => handleChange("deliveryOutsideDistrict", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
          </div>
          <button onClick={() => saveSection(["freeDeliveryMinimum", "defaultDeliveryCharge", "deliveryWithinDistrict", "deliveryOutsideDistrict"])}
            disabled={saving === "freeDeliveryMinimum"}
            className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2 transition">
            {saving === "freeDeliveryMinimum" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {t.saveDeliverySettings}
          </button>
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-purple-500" /> {t.securityEmailSettings}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.jwtSecret}</label>
              <input type="password" value={settings.jwtSecret || ""} onChange={(e) => handleChange("jwtSecret", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Your JWT secret" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.smtpHost}</label>
              <input type="text" value={settings.smtpHost || ""} onChange={(e) => handleChange("smtpHost", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.smtpPort}</label>
              <input type="text" value={settings.smtpPort || "587"} onChange={(e) => handleChange("smtpPort", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.smtpUser}</label>
              <input type="text" value={settings.smtpUser || ""} onChange={(e) => handleChange("smtpUser", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.smtpPassword}</label>
              <input type="password" value={settings.smtpPassword || ""} onChange={(e) => handleChange("smtpPassword", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Your SMTP password" />
            </div>
          </div>
          <button onClick={() => saveSection(["jwtSecret", "smtpHost", "smtpPort", "smtpUser", "smtpPassword"])}
            disabled={saving === "jwtSecret"}
            className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2 transition">
            {saving === "jwtSecret" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {t.saveSecuritySettings}
          </button>
        </div>
      )}
    </div>
  );
}
