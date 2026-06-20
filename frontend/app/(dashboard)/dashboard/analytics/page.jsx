"use client";
import { BarChart3, TrendingUp, Users, Package, DollarSign } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-500" /> Sales Trend
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto mb-2 text-primary-300" />
              <p>Line chart - Sales over time</p>
              <p className="text-sm">Connect backend for live data</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-green-500" /> Revenue by District
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto mb-2 text-green-300" />
              <p>Pie chart - Revenue breakdown</p>
              <p className="text-sm">Connect backend for live data</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-purple-500" /> Top Selling Categories
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto mb-2 text-purple-300" />
              <p>Bar graph - Category performance</p>
              <p className="text-sm">Connect backend for live data</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-amber-500" /> Order Status Overview
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto mb-2 text-amber-300" />
              <p>Donut chart - Order distribution</p>
              <p className="text-sm">Connect backend for live data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
