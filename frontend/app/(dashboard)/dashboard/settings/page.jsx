"use client";
import { Settings, Store, CreditCard, Truck, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Store className="text-primary-500" size={24} />
            <h3 className="font-semibold text-gray-800">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input type="text" defaultValue="Bikroy-Mart-BD"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input type="text" defaultValue="16469"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" defaultValue="info@bikroymart.com"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            </div>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">Save Changes</button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-green-500" size={24} />
            <h3 className="font-semibold text-gray-800">Payment Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SSLCommerz Store ID</label>
              <input type="text" placeholder="Your store ID"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SSLCommerz Store Password</label>
              <input type="password" placeholder="Your store password"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            </div>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">Save Payment Settings</button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="text-amber-500" size={24} />
            <h3 className="font-semibold text-gray-800">Delivery Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Minimum (৳)</label>
              <input type="number" defaultValue={1500}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Delivery Charge (৳)</label>
              <input type="number" defaultValue={60}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            </div>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">Save Delivery Settings</button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-purple-500" size={24} />
            <h3 className="font-semibold text-gray-800">Security Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">JWT Secret</label>
              <input type="password" placeholder="Your JWT secret"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
              <input type="password" placeholder="Your SMTP password"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            </div>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">Save Security Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}
