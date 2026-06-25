"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "", author: "", isPublished: true });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await api.get("/blogs");
      setBlogs(res.data.data);
    } catch (err) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingId(blog.id);
      setFormData({ 
        title: blog.title, 
        content: blog.content, 
        author: blog.author || "", 
        isPublished: blog.isPublished 
      });
    } else {
      setEditingId(null);
      setFormData({ title: "", content: "", author: "", isPublished: true });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("author", formData.author);
    data.append("isPublished", formData.isPublished);
    if (imageFile) data.append("image", imageFile);

    try {
      if (editingId) {
        await api.put(`/blogs/${editingId}`, data);
        toast.success("Blog updated");
      } else {
        await api.post("/blogs", data);
        toast.success("Blog created");
      }
      setShowModal(false);
      fetchBlogs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save blog");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success("Blog deleted");
      fetchBlogs();
    } catch (err) {
      toast.error("Failed to delete blog");
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading blogs...</div>;

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#EC008C] text-white px-4 py-2 rounded-lg hover:bg-[#D60071] transition"
        >
          <Plus size={18} /> Add Blog
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="h-48 bg-gray-100">
              {blog.image ? (
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{blog.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{blog.content}</p>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className={`px-2 py-1 rounded text-xs font-medium ${blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {blog.isPublished ? "Published" : "Draft"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(blog)} className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 rounded">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(blog.id)} className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Blog" : "Create Blog"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Author</label>
                <input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea required rows="6" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <input type="file" onChange={e => setImageFile(e.target.files[0])} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPublished" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} />
                <label htmlFor="isPublished">Publish immediately</label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#EC008C] text-white rounded-lg hover:bg-[#D60071]">Save Blog</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
