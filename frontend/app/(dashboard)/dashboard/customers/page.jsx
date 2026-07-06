"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "@/lib/axios";
import { Users, Ban, CheckCircle, Edit2, Trash2, X, Shield, UserCog, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CustomersPage() {
  const { t } = useLanguage();
  const currentUser = useSelector((state) => state.user?.data);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "CUSTOMER" });
  const [filterRole, setFilterRole] = useState("ALL");

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
      toast.success(isBlocked ? t.userUnblocked : t.userBlocked);
      fetchUsers();
    } catch (err) { toast.error(t.failed); }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, phone: user.phone || "", role: user.role });
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/users/${editingUser.id}`, editForm);
      toast.success(t.userUpdated);
      setEditingUser(null);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || t.failed); }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success(`${t.roleChangedTo} ${newRole}`);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || t.failed); }
  };

  const handleDelete = async (userId) => {
    if (!confirm(t.confirmDeleteUser)) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success(t.userDeleted);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || t.failed); }
  };

  const roleOptions = ["ALL", "CUSTOMER", "MANAGER", "RIDER", "ADMIN"];
  const roleColors = {
    ADMIN: "bg-purple-100 text-purple-700",
    MANAGER: "bg-blue-100 text-blue-700",
    RIDER: "bg-amber-100 text-amber-700",
    CUSTOMER: "bg-green-100 text-green-700",
  };

  const filteredUsers = filterRole === "ALL" ? users : users.filter((u) => u.role === filterRole);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t.customers}</h1>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {roleOptions.map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              filterRole === role
                ? "bg-pink-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {role === "ALL" ? t.allUsers : role}
            <span className="ml-1 text-[10px] opacity-70">
              ({role === "ALL" ? users.length : users.filter((u) => u.role === role).length})
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">{t.user}</th>
                <th className="px-4 py-3 font-medium">{t.phone}</th>
                <th className="px-4 py-3 font-medium">{t.role}</th>
                <th className="px-4 py-3 font-medium">{t.orders}</th>
                <th className="px-4 py-3 font-medium">{t.joined}</th>
                <th className="px-4 py-3 font-medium">{t.status}</th>
                <th className="px-4 py-3 font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.loading}</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.noUsersFound}</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.phone || t.notAvailable}</td>
                  <td className="px-4 py-3">
                    {currentUser?.id === user.id ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${roleColors[user.role] || "bg-gray-100 text-gray-600"}`}>
                        {user.role} <Lock size={10} />
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-pink-500 ${roleColors[user.role] || "bg-gray-100 text-gray-600"}`}
                      >
                        <option value="CUSTOMER">{t.customer}</option>
                        <option value="MANAGER">{t.manager}</option>
                        <option value="RIDER">{t.rider}</option>
                        <option value="ADMIN">{t.admin}</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{user._count?.orders || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleBlock(user.id, user.isBlocked)}
                      className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition ${
                        user.isBlocked ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {user.isBlocked ? t.blocked : t.active}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {currentUser?.id === user.id ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleEdit(user)} className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition" title={t.editUser}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => toggleBlock(user.id, user.isBlocked)} className={`p-1 rounded transition ${user.isBlocked ? "text-green-500 hover:text-green-700 hover:bg-green-50" : "text-red-500 hover:text-red-700 hover:bg-red-50"}`} title={user.isBlocked ? t.unblock : t.block}>
                          {user.isBlocked ? <CheckCircle size={14} /> : <Ban size={14} />}
                        </button>
                        {user.role !== "ADMIN" && (
                          <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition" title={t.deleteUser}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingUser(null)} />
          <div className="relative bg-white rounded-xl p-6 shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <UserCog size={18} /> {t.editUser}
              </h3>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t.name}</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t.email}</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t.phone}</label>
                <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t.role}</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                  <option value="CUSTOMER">{t.customer}</option>
                  <option value="MANAGER">{t.manager}</option>
                  <option value="RIDER">{t.rider}</option>
                  <option value="ADMIN">{t.admin}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditingUser(null)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                {t.cancel}
              </button>
              <button onClick={handleSaveEdit} className="flex-1 bg-pink-600 text-white py-2 rounded-lg text-sm hover:bg-pink-700 transition">
                {t.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
