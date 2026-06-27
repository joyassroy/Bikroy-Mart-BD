"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { DELIVERY_AREAS } from "@/lib/constants";
import toast from "react-hot-toast";
import { X, Loader2 } from "lucide-react";

export default function EditManagerModal({ manager, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: manager.user?.name || "",
    email: manager.user?.email || "",
    phone: manager.user?.phone || "",
    assignedDistrict: manager.assignedDistrict || "Dhaka",
    assignedZila: manager.assignedZila || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/managers/${manager.id}`, form);
      toast.success("Manager updated!");
      onUpdated?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-5 py-3 flex items-center justify-between rounded-t-xl">
          <h2 className="text-sm font-semibold text-[#000000]">Edit Manager</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[#F3F4F6] transition text-[#667085]">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#364152] mb-1">Full Name *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E5E7EB]" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#364152] mb-1">Email *</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E5E7EB]" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#364152] mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E5E7EB]" placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#364152] mb-1">Assigned District *</label>
            <select required value={form.assignedDistrict} onChange={(e) => setForm({ ...form, assignedDistrict: e.target.value })}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E5E7EB]">
              {DELIVERY_AREAS.map((area) =>
                area.districts.map((d) => <option key={d} value={d}>{d} ({area.division})</option>)
              )}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#364152] mb-1">Assigned Zila *</label>
            <input type="text" required value={form.assignedZila} onChange={(e) => setForm({ ...form, assignedZila: e.target.value })}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E5E7EB]" placeholder="e.g. Savar, Mirpur" />
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#E5E7EB]">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-xs font-semibold border border-[#E5E7EB] rounded-lg text-[#364152] hover:bg-[#F4F7FB] transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-xs font-semibold bg-[#EC008C] text-white rounded-lg hover:bg-[#D60071] disabled:opacity-50 transition flex items-center gap-1.5">
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
