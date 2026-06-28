"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { User, Package, MapPin, LogOut, Loader2, ExternalLink, X, Plus, Pencil, Trash2, Star, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/redux/userSlice";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuthChecked } from "@/helper/AuthInit";
import { disconnectSocket } from "@/lib/socket";
import { BANGLADESH_LOCATIONS, getUpazilas } from "@/lib/constants";
import toast from "react-hot-toast";

const statusSteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function AccountPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.user.data);
  const location = useSelector((state) => state.location);
  const { authChecked } = useAuthChecked();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "", phone: "", division: "Dhaka", district: "Dhaka", upazila: "", fullAddress: "", isDefault: false,
  });
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);

  useEffect(() => {
    const div = BANGLADESH_LOCATIONS.find((d) => d.division === addressForm.division);
    setDistricts(div ? div.districts.map((d) => d.name) : []);
  }, [addressForm.division]);

  useEffect(() => {
    const ups = getUpazilas(addressForm.division, addressForm.district);
    setUpazilas(ups);
  }, [addressForm.division, addressForm.district]);

  useEffect(() => {
    if (authChecked && !user) {
      router.push("/signin");
    }
  }, [authChecked, user, router]);

  useEffect(() => {
    if (user) {
      api.get("/orders/my-orders").then((res) => setOrders(res.data.data || [])).catch(console.error);
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = () => {
    api.get("/addresses").then((res) => setAddresses(res.data.data || [])).catch(console.error);
  };

  const handleLogout = async () => {
    localStorage.removeItem("bm-token");
    dispatch(clearUser());
    disconnectSocket();
    await signOut({ redirect: false });
    toast.success("Logged out");
    router.replace("/");
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress.id}`, addressForm);
        toast.success("Address updated!");
      } else {
        await api.post("/addresses", addressForm);
        toast.success("Address saved!");
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({ name: "", phone: "", division: "Dhaka", district: "Dhaka", upazila: "", fullAddress: "", isDefault: false });
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm("Delete this address?")) return;
    try {
      await api.delete(`/addresses/${id}`);
      toast.success("Address deleted!");
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/addresses/${id}/default`);
      toast.success("Default address updated!");
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to update default");
    }
  };

  const openEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      name: addr.name, phone: addr.phone, division: addr.division,
      district: addr.district, upazila: addr.upazila,
      fullAddress: addr.fullAddress, isDefault: addr.isDefault,
    });
    const div = BANGLADESH_LOCATIONS.find((d) => d.division === addr.division);
    setDistricts(div ? div.districts.map((d) => d.name) : []);
    setUpazilas(getUpazilas(addr.division, addr.district));
    setShowAddressForm(true);
  };

  const getStatusIndex = (status) => statusSteps.indexOf(status);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0067A0]" size={32} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Account</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <User size={36} className="text-[#0067A0]" />
              </div>
              <h2 className="font-semibold text-gray-900 text-lg">{user.name}</h2>
              <p className="text-base text-gray-500 mt-1">{user.email}</p>
            </div>
            <div className="space-y-2">
              <button onClick={() => setActiveTab("orders")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition ${activeTab === "orders" ? "bg-blue-50 text-[#0067A0]" : "text-gray-600 hover:bg-gray-50"}`}>
                <Package size={20} /> My Orders
              </button>
              <button onClick={() => setActiveTab("addresses")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition ${activeTab === "addresses" ? "bg-blue-50 text-[#0067A0]" : "text-gray-600 hover:bg-gray-50"}`}>
                <MapPin size={20} /> Addresses
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition">
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100"><h3 className="font-semibold text-gray-900 text-lg">My Orders</h3></div>
                {orders.length === 0 ? (
                  <div className="p-10 text-center text-gray-400 text-base">
                    <Package size={40} className="mx-auto mb-3 text-gray-300" />
                    <p>No orders yet</p>
                    <button onClick={() => router.push("/shop")} className="mt-3 text-[#0067A0] hover:underline text-sm font-medium">Start Shopping</button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-[#0067A0] text-base">#{order.orderNumber}</p>
                            <p className="text-base text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                            order.orderStatus === "DELIVERED" ? "bg-green-50 text-green-700" :
                            order.orderStatus === "CANCELLED" ? "bg-red-50 text-red-700" :
                            "bg-blue-50 text-blue-700"
                          }`}>{order.orderStatus}</span>
                        </div>
                        <div className="mt-2 text-base text-gray-500">
                          {order.items?.map((item) => (
                            <span key={item.id}>{item.product?.name} x {item.quantity}{item !== order.items[order.items.length - 1] ? ", " : ""}</span>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-base font-medium text-gray-900">Total: ৳{order.total}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/track-order?order=${order.orderNumber}`); }}
                            className="flex items-center gap-1 text-sm text-[#0067A0] hover:underline font-medium"
                          >
                            <ExternalLink size={14} /> Track
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 text-lg">Saved Addresses</h3>
                  <button onClick={() => { const div = location.division || "Dhaka"; const dist = location.district || "Dhaka"; setEditingAddress(null); setAddressForm({ name: user?.name || "", phone: user?.phone || "", division: div, district: dist, upazila: "", fullAddress: "", isDefault: false }); const divData = BANGLADESH_LOCATIONS.find((d) => d.division === div); setDistricts(divData ? divData.districts.map((d) => d.name) : []); setUpazilas(getUpazilas(div, dist)); setShowAddressForm(true); }} className="flex items-center gap-1.5 bg-[#0067A0] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#005580] transition">
                    <Plus size={16} /> Add
                  </button>
                </div>

                {showAddressForm && (
                  <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-3">{editingAddress ? "Edit Address" : "New Address"}</h4>
                    <form onSubmit={handleAddressSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                          <input type="text" required value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0067A0] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Phone</label>
                          <input type="tel" required value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0067A0] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                          <select
                            required
                            value={addressForm.division}
                            onChange={(e) => setAddressForm({ ...addressForm, division: e.target.value, district: "", upazila: "" })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0067A0] focus:border-transparent"
                          >
                            <option value="">Select Division</option>
                            {BANGLADESH_LOCATIONS.map((d) => (
                              <option key={d.division} value={d.division}>{d.division}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                          <select
                            required
                            value={addressForm.district}
                            onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value, upazila: "" })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0067A0] focus:border-transparent"
                          >
                            <option value="">Select District</option>
                            {districts.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Upazila</label>
                          <select
                            required
                            value={addressForm.upazila}
                            onChange={(e) => setAddressForm({ ...addressForm, upazila: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0067A0] focus:border-transparent"
                          >
                            <option value="">Select Upazila</option>
                            {upazilas.map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                        <textarea required rows={2} value={addressForm.fullAddress} onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0067A0] focus:border-transparent" />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="w-4 h-4 accent-[#0067A0]" />
                        <span className="text-sm text-gray-700">Set as default</span>
                      </label>
                      <div className="flex gap-2">
                        <button type="submit" className="bg-[#0067A0] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#005580] transition">
                          {editingAddress ? "Update" : "Save"}
                        </button>
                        <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddress(null); }} className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {addresses.length === 0 && !showAddressForm ? (
                  <div className="p-10 text-center text-gray-400 text-base">
                    <MapPin size={40} className="mx-auto mb-3 text-gray-300" />
                    <p>No saved addresses yet.</p>
                    <p className="text-sm mt-1">Add one to use at checkout.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="p-5 flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 text-base">{addr.name}</p>
                            <span className="text-gray-500 text-sm">({addr.phone})</span>
                            {addr.isDefault && (
                              <span className="bg-[#0067A0] text-white text-xs px-2 py-0.5 rounded-full font-medium">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{addr.upazila}, {addr.district}, {addr.division}</p>
                          <p className="text-sm text-gray-500">{addr.fullAddress}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-3">
                          {!addr.isDefault && (
                            <button onClick={() => handleSetDefault(addr.id)} className="p-2 text-gray-400 hover:text-[#0067A0] hover:bg-blue-50 rounded-lg transition" title="Set as default">
                              <Star size={16} />
                            </button>
                          )}
                          <button onClick={() => openEditAddress(addr)} className="p-2 text-gray-400 hover:text-[#0067A0] hover:bg-blue-50 rounded-lg transition" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono font-bold text-[#00215B] text-base">#{selectedOrder.orderNumber}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{new Date(selectedOrder.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  selectedOrder.orderStatus === "DELIVERED" ? "bg-green-50 text-green-700" :
                  selectedOrder.orderStatus === "CANCELLED" ? "bg-red-50 text-red-700" :
                  "bg-blue-50 text-blue-700"
                }`}>{selectedOrder.orderStatus}</span>
              </div>

              <div className="space-y-2">
                {statusSteps.map((step, index) => {
                  const currentIndex = getStatusIndex(selectedOrder.orderStatus);
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        isCompleted ? "bg-[#EC008C] text-white" : "bg-gray-100 text-gray-400"
                      } ${isCurrent ? "ring-2 ring-pink-200" : ""}`}>
                        {isCompleted ? "✓" : index + 1}
                      </div>
                      <span className={`text-sm ${isCompleted ? "text-gray-900 font-medium" : "text-gray-400"}`}>{step.replace(/_/g, " ")}</span>
                      {isCurrent && <span className="text-xs text-[#EC008C] font-semibold ml-1">Current</span>}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-medium text-gray-900 mb-2 text-sm">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.product?.name} x {item.quantity}</span>
                      <span className="font-medium text-gray-900">৳{item.totalPrice}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>৳{selectedOrder.total}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-0.5">Payment Method</p>
                  <p className="font-medium text-gray-900">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Payment Status</p>
                  <p className="font-medium text-gray-900">{selectedOrder.paymentStatus}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 text-sm">
                <p className="text-gray-500 mb-0.5">Delivery Address</p>
                <p className="text-gray-900">{selectedOrder.deliveryUpazila}, {selectedOrder.deliveryDistrict}, {selectedOrder.deliveryDivision}</p>
                <p className="text-gray-900">{selectedOrder.deliveryAddress}</p>
              </div>

              {selectedOrder.customRequirement && (
                <div className="border-t border-gray-100 pt-4 text-sm">
                  <p className="text-gray-500 mb-0.5">Custom Requirement</p>
                  <p className="text-gray-900">{selectedOrder.customRequirement}</p>
                </div>
              )}

              {selectedOrder.rider && (
                <div className="border-t border-gray-100 pt-4 text-sm">
                  <p className="text-gray-500 mb-1">Rider Info</p>
                  <p className="text-gray-900">{selectedOrder.rider.user?.name} &middot; {selectedOrder.rider.user?.phone}</p>
                </div>
              )}

              <button onClick={() => { setSelectedOrder(null); router.push(`/track-order?order=${selectedOrder.orderNumber}`); }} className="w-full flex items-center justify-center gap-2 bg-[#00215B] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#001845] transition mt-2">
                <ExternalLink size={16} /> Track Order
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
