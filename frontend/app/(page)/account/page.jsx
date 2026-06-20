"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { User, Package, MapPin, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/redux/userSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AccountPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.user.data);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    if (!user) { router.push("/signin"); return; }
    api.get("/orders/my-orders").then((res) => setOrders(res.data.data || [])).catch(console.error);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("bm-token");
    dispatch(clearUser());
    toast.success("Logged out");
    router.push("/");
  };

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
                  <div className="p-10 text-center text-gray-400 text-base">No orders yet</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <div key={order.id} className="p-6">
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
                        <p className="mt-2 text-base font-medium text-gray-900">Total: ৳{order.total}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Saved Addresses</h3>
                <p className="text-gray-500 text-base">No saved addresses yet. Add one during checkout.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
