"use client";
import { useState } from "react";
import { X, MapPin } from "lucide-react";
import { useDispatch } from "react-redux";
import { setLocation } from "@/redux/locationSlice";
import { DELIVERY_AREAS } from "@/lib/constants";

export default function LocationSelector({ onClose }) {
  const dispatch = useDispatch();
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const division = DELIVERY_AREAS.find((d) => d.division === selectedDivision);

  const handleConfirm = () => {
    if (selectedDistrict) {
      dispatch(setLocation({ division: selectedDivision, district: selectedDistrict }));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Select delivery location">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <MapPin size={20} className="text-[#0067A0]" />
            Select Delivery Location
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition" aria-label="Close">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
            <select
              value={selectedDivision}
              onChange={(e) => { setSelectedDivision(e.target.value); setSelectedDistrict(""); }}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0067A0] focus:border-[#0067A0] outline-none"
            >
              <option value="">Select Division</option>
              {DELIVERY_AREAS.map((d) => (
                <option key={d.division} value={d.division}>{d.division}</option>
              ))}
            </select>
          </div>

          {division && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0067A0] focus:border-[#0067A0] outline-none"
              >
                <option value="">Select District</option>
                {division.districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!selectedDistrict}
            className="btn-primary w-full"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
