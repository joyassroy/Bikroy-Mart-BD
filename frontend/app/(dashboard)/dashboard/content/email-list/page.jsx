"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Mail, Trash2 } from "lucide-react";
import Pagination from "@/components/ui/Pagination";

export default function EmailListPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await api.get("/subscribers");
      setSubscribers(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch subscribers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    try {
      await api.delete(`/subscribers/${id}`);
      toast.success("Subscriber deleted");
      fetchSubscribers();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading email list...</div>;

  const totalPages = Math.ceil(subscribers.length / ITEMS_PER_PAGE);
  const paginated = subscribers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Email List</h1>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Mail size={18} /> {subscribers.length} Subscribers
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500 border-b">
                <th className="px-6 py-4 font-medium">Email Address</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Subscribed Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No subscribers found.</td>
                </tr>
              )}
              {paginated.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {sub.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      sub.status === 'SUBSCRIBED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(sub.subscribedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={subscribers.length} itemsPerPage={ITEMS_PER_PAGE} />
    </div>
  );
}
