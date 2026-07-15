"use client";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuthChecked } from "@/helper/AuthInit";
import { BANGLADESH_LOCATIONS, DELIVERY_AREAS, getUpazilas } from "@/lib/constants";
import { ClipboardList, Upload, X, MapPin, Loader2, CheckCircle, Clock, Eye, Truck, XCircle, Printer, DollarSign, Package, FileText } from "lucide-react";
import dynamic from "next/dynamic";
const DeliveryMapPicker = dynamic(() => import("@/components/checkout/DeliveryMapPicker"), { ssr: false });
import FloatingChatButton from "@/components/layout/FloatingChatButton";
import { printCustomRequestInvoice } from "@/lib/generateInvoice";

const STATUS_CONFIG = {
  PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  MANAGER_REVIEW: { color: "bg-blue-100 text-blue-800", icon: Eye },
  PRICING_SET: { color: "bg-purple-100 text-purple-800", icon: ClipboardList },
  CUSTOMER_APPROVED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  CUSTOMER_REJECTED: { color: "bg-red-100 text-red-800", icon: XCircle },
  PROCESSING: { color: "bg-indigo-100 text-indigo-800", icon: ClipboardList },
  SHIPPED: { color: "bg-orange-100 text-orange-800", icon: Truck },
  OUT_FOR_DELIVERY: { color: "bg-orange-100 text-orange-800", icon: Truck },
  DELIVERED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { color: "bg-red-100 text-red-800", icon: XCircle },
};

function matchDivision(addressStr) {
  const lower = addressStr.toLowerCase();
  for (const area of DELIVERY_AREAS) {
    if (lower.includes(area.division.toLowerCase())) {
      const matchedDistrict = area.districts.find((d) => lower.includes(d.toLowerCase()));
      return { division: area.division, district: matchedDistrict || "" };
    }
  }
  return { division: "", district: "" };
}

export default function CustomRequestPage() {
  const router = useRouter();
  const user = useSelector((state) => state.user.data);
  const { authChecked } = useAuthChecked();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [previews, setPreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [coords, setCoords] = useState(null);

  const [form, setForm] = useState({
    productName: "",
    description: "",
    quantity: "1",
    unit: "piece",
    division: "",
    district: "",
    upazila: "",
    fullAddress: "",
    customerNotes: "",
  });

  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);

  useEffect(() => {
    if (authChecked && !user) {
      router.push("/signin");
    }
  }, [authChecked, user, router]);

  useEffect(() => {
    if (form.division) {
      const area = DELIVERY_AREAS.find((a) => a.division === form.division);
      setDistricts(area ? area.districts : []);
      if (!locationDetected) {
        setForm((prev) => ({ ...prev, district: "", upazila: "" }));
      }
    }
  }, [form.division]);

  useEffect(() => {
    const ups = getUpazilas(form.division, form.district);
    setUpazilas(ups);
  }, [form.division, form.district]);

  const requestsFetched = useRef(false);
  useEffect(() => {
    if (authChecked && user && !requestsFetched.current) {
      requestsFetched.current = true;
      fetchMyRequests();
    }
  }, [authChecked, user]);

  const locationStarted = useRef(false);
  useEffect(() => {
    if (!locationStarted.current) {
      locationStarted.current = true;
      detectLocation();
    }
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get("/custom-requests/my-requests");
      const items = res?.data?.data;
      setMyRequests(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Failed to fetch requests", error);
      setMyRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const detectLocation = async () => {
    if (locationDetected || detectingLocation) return;
    setDetectingLocation(true);

    const tryReverseGeocode = async (lat, lng) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { "User-Agent": "BikroyMartBD/1.0" } }
        );
        const data = await res.json();
        const addr = data && data.address;
        if (!addr) return false;

        const parts = [addr.road, addr.neighbourhood, addr.suburb, addr.city || addr.town || addr.village, addr.state, addr.country].filter(Boolean);
        const fullAddress = parts.join(", ") || "";

        const searchStr = [addr.state, addr.county, addr.city, addr.town, addr.village, addr.suburb, fullAddress].filter(Boolean).join(" ");
        const { division, district } = matchDivision(searchStr);
        const upazila = addr.suburb || addr.neighbourhood || addr.quarter || addr.village || "";

        setForm((prev) => ({
          ...prev,
          division: prev.division || division,
          district: prev.district || district,
          upazila: prev.upazila || upazila,
          fullAddress: prev.fullAddress || fullAddress,
        }));
        setLocationDetected(true);
        toast.success("Location detected!");
        return true;
      } catch {
        return false;
      }
    };

    const tryIPGeolocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          setCoords({ latitude: data.latitude, longitude: data.longitude });
          return await tryReverseGeocode(data.latitude, data.longitude);
        }
      } catch {}
      return false;
    };

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setCoords({ latitude, longitude });
            const ok = await tryReverseGeocode(latitude, longitude);
            if (!ok) await tryIPGeolocation();
            setDetectingLocation(false);
          },
          async () => {
            await tryIPGeolocation();
            setDetectingLocation(false);
          },
          { timeout: 8000, maximumAge: 300000 }
        );
      } else {
        await tryIPGeolocation();
        setDetectingLocation(false);
      }
    } catch {
      setDetectingLocation(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (previews.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = typeof window !== "undefined" ? localStorage.getItem("bm-token") : null;
    if (!token) {
      toast.error("Please sign in first");
      router.push("/signin");
      return;
    }

    if (!form.productName.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    if (!form.division || !form.district) {
      toast.error("Please fill in the delivery address");
      return;
    }

    try {
      setLoading(true);

      let imageUrls = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("images", file));
        const uploadRes = await api.post("/custom-requests/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrls = uploadRes?.data?.data?.urls || [];
      }

      const deliveryAddress = form.fullAddress || [form.upazila, form.district, form.division].filter(Boolean).join(", ");

      await api.post("/custom-requests", {
        productName: form.productName,
        description: form.description,
        quantity: parseFloat(form.quantity) || 1,
        unit: form.unit,
        images: imageUrls,
        deliveryAddress,
        deliveryDivision: form.division,
        deliveryDistrict: form.district,
        deliveryUpazila: form.upazila || form.district,
        deliveryLatitude: coords?.latitude || null,
        deliveryLongitude: coords?.longitude || null,
        customerNotes: form.customerNotes,
      });

      toast.success(t.requestSubmitted);
      setForm({
        productName: "", description: "", quantity: "1", unit: "piece",
        division: "", district: "", upazila: "", fullAddress: "", customerNotes: "",
      });
      setSelectedFiles([]);
      setPreviews([]);
      setLocationDetected(false);
      setCoords(null);
      fetchMyRequests();
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || t.requestSubmitError;
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/custom-requests/${id}/approve`);
      toast.success("Quote approved!");
      fetchMyRequests();
    } catch {
      toast.error("Failed to approve quote");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/custom-requests/${id}/reject`, { rejectionReason: "Price not acceptable" });
      toast.success("Quote rejected");
      fetchMyRequests();
    } catch {
      toast.error("Failed to reject quote");
    }
  };

  const handlePay = async (id) => {
    try {
      await api.put(`/custom-requests/${id}/pay`);
      toast.success(t.paymentConfirmed);
      fetchMyRequests();
    } catch {
      toast.error(t.paymentConfirmError);
    }
  };

  const renderStatusBadge = (status) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    const Icon = cfg.icon;
    const label = t[(status || "").toLowerCase()] || status || "Unknown";
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.color}`}>
        <Icon size={10} />
        {label}
      </span>
    );
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <Header />
        <main className="max-w-[1200px] mx-auto px-4 py-10">
          <div className="text-center py-20 text-sm text-[#667085]">{t.loading}</div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 py-6 md:py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#EC008C]/10 text-[#EC008C] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <ClipboardList size={18} />
            {t.customRequestTitle}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#00215B] mb-2">{t.customRequestTitle}</h1>
          <p className="text-[#667085] text-sm md:text-base">{t.customRequestSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Form */}
          <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-[#E5E7EB]">
            <h2 className="text-lg font-bold text-[#00215B] mb-5">{t.customRequestTitle}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#364152] mb-1.5">{t.productName} *</label>
                <input type="text" name="productName" value={form.productName} onChange={handleChange}
                  placeholder={t.productNamePlaceholder}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#EC008C] focus:ring-2 focus:ring-[#EC008C]/10 transition" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#364152] mb-1.5">{t.productDescription}</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                  placeholder={t.productDescriptionPlaceholder}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#EC008C] focus:ring-2 focus:ring-[#EC008C]/10 transition resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#364152] mb-1.5">{t.quantity} *</label>
                  <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="0.1" step="0.1"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#EC008C] focus:ring-2 focus:ring-[#EC008C]/10 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#364152] mb-1.5">{t.unit}</label>
                  <select name="unit" value={form.unit} onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#EC008C] focus:ring-2 focus:ring-[#EC008C]/10 transition bg-white">
                    <option value="piece">{t.unitPiece}</option>
                    <option value="ekok">{t.unitEkok}</option>
                    <option value="kg">{t.unitKg}</option>
                    <option value="gram">{t.unitGram}</option>
                    <option value="litre">{t.unitLitre}</option>
                    <option value="dozen">{t.unitDozen}</option>
                    <option value="box">{t.unitBox}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#364152] mb-1.5">{t.uploadImages}</label>
                <div onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-4 text-center cursor-pointer hover:border-[#EC008C] hover:bg-[#FCE8F3]/30 transition">
                  <Upload size={24} className="mx-auto text-[#667085] mb-1" />
                  <p className="text-xs text-[#667085]">{t.uploadHint}</p>
                  <p className="text-[10px] text-[#99A0B4]">{t.uploadImagesDesc}</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                {previews.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {previews.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#E5E7EB]">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px]">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="border-t border-[#E5E7EB] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#00215B]">{t.deliveryAddress}</h3>
                  {detectingLocation && (
                    <span className="flex items-center gap-1 text-[10px] text-[#EC008C] font-medium">
                      <Loader2 size={12} className="animate-spin" /> Detecting...
                    </span>
                  )}
                  {locationDetected && !detectingLocation && (
                    <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                      <MapPin size={12} /> Auto-detected
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <select name="division" value={form.division} onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#EC008C] focus:ring-2 focus:ring-[#EC008C]/10 transition bg-white">
                      <option value="">{t.selectDivision}</option>
                      {DELIVERY_AREAS.map((a) => <option key={a.division} value={a.division}>{a.division}</option>)}
                    </select>
                    <select name="district" value={form.district} onChange={handleChange} disabled={!form.division}
                      className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#EC008C] focus:ring-2 focus:ring-[#EC008C]/10 transition bg-white disabled:opacity-50">
                      <option value="">{t.selectDistrict}</option>
                      {(districts || []).map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <select name="upazila" value={form.upazila} onChange={handleChange} disabled={!form.district}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#EC008C] focus:ring-2 focus:ring-[#EC008C]/10 transition bg-white disabled:opacity-50">
                    <option value="">{t.selectUpazila}</option>
                    {(upazilas || []).map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <textarea name="fullAddress" value={form.fullAddress} onChange={handleChange} rows={2} placeholder={t.fullAddressPlaceholder}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#EC008C] focus:ring-2 focus:ring-[#EC008C]/10 transition resize-none" />
                  {!locationDetected && !detectingLocation && (
                    <button type="button" onClick={detectLocation}
                      className="flex items-center gap-1.5 text-xs text-[#EC008C] font-semibold hover:underline transition">
                      <MapPin size={14} /> Detect my location automatically
                    </button>
                  )}
                  <DeliveryMapPicker coords={coords} onCoordsChange={setCoords} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#364152] mb-1.5">{t.additionalNotes}</label>
                <textarea name="customerNotes" value={form.customerNotes} onChange={handleChange} rows={2}
                  placeholder={t.additionalNotesPlaceholder}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#EC008C] focus:ring-2 focus:ring-[#EC008C]/10 transition resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#EC008C] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#D60071] transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? t.loading : t.submitRequest}
              </button>
            </form>
          </div>

          {/* My Requests */}
          <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-[#E5E7EB]">
            <h2 className="text-lg font-bold text-[#00215B] mb-1">{t.myRequests}</h2>
            <p className="text-xs text-[#667085] mb-5">{t.myRequestsSubtitle}</p>

            {loadingRequests ? (
              <div className="text-center py-10 text-sm text-[#667085]">{t.loading}</div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-10">
                <ClipboardList size={40} className="mx-auto text-[#E5E7EB] mb-3" />
                <p className="text-sm font-semibold text-[#364152]">{t.noRequestsYet}</p>
                <p className="text-xs text-[#667085]">{t.noRequestsDesc}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {myRequests.map((req) => (
                  <div key={req.id} className="border border-[#E5E7EB] rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-[#667085]">{t.requestNumber} {req.requestNumber}</p>
                        <p className="text-sm font-semibold text-[#00215B]">{req.productName}</p>
                      </div>
                      {renderStatusBadge(req.status)}
                    </div>
                    <p className="text-xs text-[#667085] mb-2">{req.quantity} {req.unit}</p>

                    {Array.isArray(req.images) && req.images.length > 0 && (
                      <div className="flex gap-1.5 mb-2">
                        {req.images.slice(0, 3).map((img, i) => (
                          <img key={i} src={img} alt="" className="w-10 h-10 rounded object-cover border border-[#E5E7EB]" />
                        ))}
                        {req.images.length > 3 && (
                          <span className="w-10 h-10 rounded bg-[#F0F2F5] flex items-center justify-center text-[10px] text-[#667085] font-semibold">
                            +{req.images.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {req.status === "PRICING_SET" && req.quotedPrice != null && (
                      <div className="bg-purple-50 rounded-lg p-3 mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#667085]">{t.quotedPrice}</span>
                          <span className="font-semibold text-[#00215B]">৳{req.quotedPrice} / {req.unit}</span>
                        </div>
                        {req.deliveryCharge > 0 && (
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#667085]">{t.deliveryFee}</span>
                            <span className="text-[#00215B]">৳{req.deliveryCharge}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs font-bold border-t border-purple-200 pt-1 mt-1">
                          <span className="text-[#00215B]">{t.totalAmount}</span>
                          <span className="text-[#EC008C]">৳{req.totalAmount}</span>
                        </div>
                        {req.managerNotes && (
                          <p className="text-[10px] text-[#667085] mt-2 italic">{t.managerNotes}: {req.managerNotes}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handleApprove(req.id)}
                            className="flex-1 bg-green-500 text-white py-1.5 rounded text-xs font-semibold hover:bg-green-600 transition">
                            {t.approvePrice}
                          </button>
                          <button onClick={() => handleReject(req.id)}
                            className="flex-1 bg-red-500 text-white py-1.5 rounded text-xs font-semibold hover:bg-red-600 transition">
                            {t.rejectPrice}
                          </button>
                        </div>
                      </div>
                    )}

                    {req.status === "CUSTOMER_REJECTED" && req.rejectionReason && (
                      <div className="bg-red-50 rounded-lg p-2 mt-2">
                        <p className="text-[10px] text-red-600">{t.rejectionReason}: {req.rejectionReason}</p>
                      </div>
                    )}

                    {req.status === "DELIVERED" && (
                      <div className="flex gap-2 mt-3">
                        {req.paymentStatus !== "PAID" && (
                          <button onClick={() => handlePay(req.id)}
                            className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white py-1.5 rounded text-xs font-semibold hover:bg-green-600 transition">
                            <DollarSign size={12} /> {t.confirmPayment}
                          </button>
                        )}
                        {req.paymentStatus === "PAID" && (
                          <span className="flex-1 flex items-center justify-center gap-1 bg-green-100 text-green-700 py-1.5 rounded text-xs font-semibold">
                            <CheckCircle size={12} /> {t.paid}
                          </span>
                        )}
                        <button onClick={() => printCustomRequestInvoice(req)}
                          className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-700 py-1.5 rounded text-xs font-semibold hover:bg-gray-50 transition">
                          <Printer size={12} /> {t.printCustomInvoice}
                        </button>
                      </div>
                    )}

                    {/* Invoice button for non-delivered but priced/approved requests */}
                    {req.status !== "DELIVERED" && ["PRICING_SET", "CUSTOMER_APPROVED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(req.status) && req.quotedPrice && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => printCustomRequestInvoice(req)}
                          className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-700 py-1.5 rounded text-xs font-semibold hover:bg-gray-50 transition">
                          <Printer size={12} /> {t.printCustomInvoice}
                        </button>
                      </div>
                    )}

                    {/* Order Details */}
                    {req.order && (
                      <div className="bg-blue-50 rounded-lg p-3 mt-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <FileText size={12} className="text-blue-600" />
                          <p className="text-[11px] font-semibold text-blue-800">{t.orderDetails || "Order Details"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                          <span className="text-[#667085]">{t.orderNumber || "Order #"}:</span>
                          <span className="font-medium text-[#00215B]">{req.order.orderNumber}</span>
                          <span className="text-[#667085]">{t.totalAmount}:</span>
                          <span className="font-medium text-[#00215B]">৳{req.order.total}</span>
                          <span className="text-[#667085]">{t.paymentMethod || "Payment"}:</span>
                          <span className="font-medium text-[#00215B]">{req.order.paymentMethod}</span>
                          <span className="text-[#667085]">{t.paymentStatus || "Status"}:</span>
                          <span className={`font-medium ${req.order.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"}`}>{req.order.paymentStatus}</span>
                        </div>
                      </div>
                    )}

                    {/* Rider Info */}
                    {req.rider && (
                      <div className="bg-orange-50 rounded-lg p-3 mt-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Truck size={12} className="text-orange-600" />
                          <p className="text-[11px] font-semibold text-orange-800">{t.riderInfo || "Rider"}</p>
                        </div>
                        <p className="text-[10px] text-[#667085]">{req.rider.user?.name} - {req.rider.user?.phone}</p>
                      </div>
                    )}

                    {/* Tracking Timeline */}
                    {["PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(req.status) && (
                      <div className="mt-3 border-t border-[#E5E7EB] pt-3">
                        <p className="text-[10px] font-semibold text-[#00215B] mb-2 flex items-center gap-1">
                          <Package size={11} /> {t.tracking || "Tracking"}
                        </p>
                        <div className="flex items-center gap-0">
                          {["PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].map((step, i) => {
                            const stepIndex = ["PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].indexOf(req.status);
                            const isCompleted = i <= stepIndex;
                            const isCurrent = i === stepIndex;
                            const labels = { PROCESSING: t.processing || "Processing", SHIPPING: t.shipped || "Shipped", SHIPPED: t.shipped || "Shipped", OUT_FOR_DELIVERY: t.outForDelivery || "Out", DELIVERED: t.delivered || "Done" };
                            return (
                              <div key={step} className="flex-1 flex flex-col items-center relative">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold z-10 ${isCurrent ? "bg-[#EC008C] text-white ring-2 ring-[#EC008C]/30" : isCompleted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                                  {isCompleted ? <CheckCircle size={10} /> : i + 1}
                                </div>
                                <span className={`text-[8px] mt-1 text-center leading-tight ${isCurrent ? "text-[#EC008C] font-bold" : isCompleted ? "text-green-600" : "text-gray-400"}`}>
                                  {labels[step] || step}
                                </span>
                                {i < 3 && (
                                  <div className={`absolute top-2.5 left-1/2 w-full h-0.5 ${i < stepIndex ? "bg-green-500" : "bg-gray-200"}`} style={{ zIndex: 0 }} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] text-[#99A0B4] mt-2">
                      {new Date(req.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <FloatingChatButton />
      <Footer />
    </div>
  );
}
