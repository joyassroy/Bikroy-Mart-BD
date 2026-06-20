"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Users, ShoppingCart, Ban, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function CustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleBlock = async (userId, isBlocked) => {
    try {
      await api.put(`/users/${userId}/${isBlocked ? "unblock" : "block"}`);
      toast.success(isBlocked ? "User unblocked" : "User blocked");
      fetchUsers();
    } catch (err) { toast.error("Failed"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Customers</h1>
      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : (
                users.filter((u) => u.role === "CUSTOMER").map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{user.phone || "N/A"}</td>
                    <td className="px-4 py-3 text-sm">{user._count?.orders || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleBlock(user.id, user.isBlocked)}
                        className={`text-sm px-3 py-1 rounded-lg ${user.isBlocked ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
