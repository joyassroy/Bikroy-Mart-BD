"use client";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Upload, Trash2, Copy, FileIcon, ImageIcon } from "lucide-react";
import Pagination from "@/components/ui/Pagination";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await api.get("/media");
      setMedia(res.data.data);
    } catch (err) {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await api.post("/media", formData);
      toast.success("File uploaded successfully");
      fetchMedia();
    } catch (err) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      await api.delete(`/media/${id}`);
      toast.success("File deleted");
      fetchMedia();
    } catch (err) {
      toast.error("Failed to delete file");
    }
  };

  const copyToClipboard = (url) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("URL copied to clipboard");
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) return <div className="p-4 text-gray-500">Loading media library...</div>;

  const totalPages = Math.ceil(media.length / ITEMS_PER_PAGE);
  const paginated = media.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Media Library</h1>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-[#EC008C] text-white px-4 py-2 rounded-lg hover:bg-[#D60071] transition disabled:opacity-50"
          >
            <Upload size={18} /> {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {media.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 border-2 border-dashed rounded-xl">
            No media files found. Upload something!
          </div>
        )}
        
        {paginated.map((file) => (
          <div key={file.id} className="bg-white rounded-xl shadow-sm border overflow-hidden group relative">
            <div className="h-32 bg-gray-50 flex items-center justify-center p-2 relative">
              {file.fileType.startsWith("image/") ? (
                <img src={file.url} alt={file.filename} className="max-h-full object-contain" />
              ) : (
                <FileIcon size={48} className="text-gray-400" />
              )}
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => copyToClipboard(file.url)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-800"
                  title="Copy URL"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-gray-800 truncate" title={file.filename}>
                {file.filename}
              </p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase">
                {formatSize(file.size)} • {file.fileType.split("/")[1] || "FILE"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={media.length} itemsPerPage={ITEMS_PER_PAGE} />
    </div>
  );
}
