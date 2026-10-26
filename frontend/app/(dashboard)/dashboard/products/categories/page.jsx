"use client";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/axios";
import { Plus, Edit, Trash2, X, Image as ImageIcon, Search, ArrowUp, ArrowDown, GripVertical, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import Pagination from "@/components/ui/Pagination";

export default function CategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reordering, setReordering] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [orderedCategories, setOrderedCategories] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const reorderingRef = useRef(false);
  const draggedIdRef = useRef(null);
  const ITEMS_PER_PAGE = 10;
  
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    icon: "",
    sortOrder: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories?all=true");
      setCategories(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        nameBn: category.nameBn || "",
        icon: category.icon || "",
        sortOrder: category.sortOrder || 0,
        isActive: category.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", nameBn: "", icon: "", sortOrder: "", isActive: true });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append("image", imageFile);

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, data);
        toast.success(t.categoryUpdated);
      } else {
        await api.post("/categories", data);
        toast.success(t.categoryCreated);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || t.somethingWentWrong);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDeleteCategory)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success(t.categoryDeleted);
      fetchCategories();
    } catch (err) { toast.error(t.failedToDelete); }
  };

  const moveWithin = (list, from, to) => {
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= list.length ||
      to >= list.length
    ) {
      return list;
    }
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  };

  const resetDrag = () => {
    draggedIdRef.current = null;
    setDraggedId(null);
    setDragOverId(null);
  };

  const persistOrder = async (ordered) => {
    if (reorderingRef.current) return false;

    reorderingRef.current = true;
    setReordering(true);

    const previous = categories;
    const withOrder = ordered.map((category, index) => ({
      ...category,
      sortOrder: index,
    }));

    setCategories(withOrder);
    try {
      await api.put("/categories/reorder", {
        ids: withOrder.map((category) => category.id),
      });
      toast.success(t.categoryOrderUpdated || "Category order updated");
      await fetchCategories();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || t.somethingWentWrong);
      setCategories(previous);
      return false;
    } finally {
      reorderingRef.current = false;
      setReordering(false);
    }
  };

  const handleMove = (categoryId, direction) => {
    if (reorderingRef.current || search) return;
    const currentIndex = categories.findIndex((c) => c.id === categoryId);
    const targetIndex = currentIndex + direction;
    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= categories.length) return;

    persistOrder(moveWithin(categories, currentIndex, targetIndex));
  };

  const handleDrop = (targetId) => {
    const sourceId = draggedIdRef.current;
    if (
      !sourceId ||
      sourceId === targetId ||
      reorderingRef.current ||
      search
    ) {
      resetDrag();
      return;
    }

    const from = categories.findIndex((c) => c.id === sourceId);
    const to = categories.findIndex((c) => c.id === targetId);
    resetDrag();

    if (from === -1 || to === -1) return;
    persistOrder(moveWithin(categories, from, to));
  };

  const handleOpenReorder = () => {
    setOrderedCategories(categories.map((category) => ({ ...category })));
    resetDrag();
    setShowReorder(true);
  };

  const handleModalMove = (from, to) => {
    setOrderedCategories((prev) =>
      moveWithin(prev, from, to).map((category, index) => ({
        ...category,
        sortOrder: index,
      }))
    );
  };

  const handleModalMoveTo = (categoryId, position) => {
    const from = orderedCategories.findIndex((c) => c.id === categoryId);
    if (from === -1) return;

    const to = Math.max(0, Math.min(position, orderedCategories.length - 1));
    if (from === to) return;
    handleModalMove(from, to);
  };

  const handleModalDrop = (targetId) => {
    const sourceId = draggedIdRef.current;
    if (!sourceId || sourceId === targetId) {
      resetDrag();
      return;
    }

    const from = orderedCategories.findIndex((c) => c.id === sourceId);
    const to = orderedCategories.findIndex((c) => c.id === targetId);
    resetDrag();

    if (from === -1 || to === -1) return;
    handleModalMove(from, to);
  };

  const orderChanged =
    orderedCategories.length !== categories.length ||
    orderedCategories.some((category, index) => category.id !== categories[index]?.id);

  const handleSaveOrder = async () => {
    if (savingOrder || reorderingRef.current || !orderChanged) return;

    setSavingOrder(true);
    const success = await persistOrder(orderedCategories);
    setSavingOrder(false);
    if (success) setShowReorder(false);
  };

  const filteredCategories = search
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.nameBn && c.nameBn.toLowerCase().includes(search.toLowerCase()))
      )
    : categories;

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t.categories}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenReorder}
            disabled={categories.length < 2 || reordering}
            className="border border-[#E5E7EB] text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <GripVertical size={16} /> {t.reorder || "Reorder"}
          </button>
          <button onClick={() => handleOpenModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 flex items-center gap-2">
            <Plus size={16} /> {t.addCategory}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:border-[#EC008C] transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3 font-medium">{t.serial || "Serial"}</th>
                <th className="px-4 py-3 font-medium">{t.image}</th>
                <th className="px-4 py-3 font-medium">{t.name}</th>
                <th className="px-4 py-3 font-medium">{t.nameBn}</th>
                <th className="px-4 py-3 font-medium">{t.sortOrder}</th>
                <th className="px-4 py-3 font-medium">{t.status}</th>
                <th className="px-4 py-3 font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.loading}</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t.noCategoriesFound}</td></tr>
              ) : (
                paginatedCategories.map((c) => {
                  const position = categories.findIndex((cat) => cat.id === c.id);
                  const isDropTarget = dragOverId === c.id && draggedId !== c.id;
                  return (
                  <tr
                    key={c.id}
                    onDragOver={(e) => {
                      if (!draggedIdRef.current || search) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (dragOverId !== c.id) setDragOverId(c.id);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(c.id);
                    }}
                    className={`border-b transition-colors ${
                      isDropTarget ? "bg-[#FCE8F3]" : "hover:bg-gray-50"
                    } ${draggedId === c.id ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-gray-500">
                      <div className="flex items-center gap-2">
                        <span
                          draggable={!reordering && !search}
                          onDragStart={(e) => {
                            draggedIdRef.current = c.id;
                            setDraggedId(c.id);
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", c.id);
                            const row = e.currentTarget.closest("tr");
                            if (row) e.dataTransfer.setDragImage(row, 20, 20);
                          }}
                          onDragEnd={resetDrag}
                          title={
                            search
                              ? t.clearSearchToReorder || "Clear search to reorder"
                              : t.dragToReorder || "Drag to reorder"
                          }
                          className={
                            reordering || search
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing"
                          }
                        >
                          <GripVertical size={14} />
                        </span>
                        <span>{position + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.image ? (
                        <img src={c.image.startsWith('http') ? c.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5004'}${c.image}`} alt={c.name} className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.nameBn || '-'}</td>
                    <td className="px-4 py-3 text-sm">{c.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {c.isActive ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMove(c.id, -1)}
                          disabled={reordering || !!search || position <= 0}
                          title={
                            search
                              ? t.clearSearchToReorder || "Clear search to reorder"
                              : t.moveUp || "Move up"
                          }
                          className="text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMove(c.id, 1)}
                          disabled={
                            reordering ||
                            !!search ||
                            position === -1 ||
                            position >= categories.length - 1
                          }
                          title={
                            search
                              ? t.clearSearchToReorder || "Clear search to reorder"
                              : t.moveDown || "Move down"
                          }
                          className="text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button onClick={() => handleOpenModal(c)} className="text-blue-500 hover:text-blue-700"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredCategories.length} itemsPerPage={ITEMS_PER_PAGE} />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">{editingId ? t.editCategory : t.addCategory}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameEn} *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameBn}</label>
                <input type="text" value={formData.nameBn} onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.image}</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.sortOrder}</label>
                  <input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value === "" ? "" : parseInt(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div className="flex flex-col justify-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm font-medium text-gray-700">{t.active}</span>
                  </label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t.cancel}</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReorder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-start justify-between gap-3 p-4 border-b">
              <div>
                <h2 className="font-semibold text-lg">
                  {t.reorderCategories || "Reorder Categories"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t.dragToReorder ||
                    "Drag rows or type a serial number to move a category."}
                </p>
              </div>
              <button
                onClick={() => setShowReorder(false)}
                disabled={savingOrder}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {orderedCategories.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">
                  {t.noCategoriesFound}
                </p>
              ) : (
                orderedCategories.map((category, index) => {
                  const isDropTarget =
                    dragOverId === category.id && draggedId !== category.id;
                  return (
                    <div
                      key={category.id}
                      data-reorder-row
                      onDragOver={(e) => {
                        if (!draggedIdRef.current || savingOrder) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (dragOverId !== category.id) {
                          setDragOverId(category.id);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleModalDrop(category.id);
                      }}
                      className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                        isDropTarget
                          ? "border-[#EC008C] bg-[#FCE8F3]"
                          : "border-transparent hover:bg-gray-50"
                      } ${draggedId === category.id ? "opacity-50" : ""}`}
                    >
                      <span
                        draggable={!savingOrder}
                        onDragStart={(e) => {
                          draggedIdRef.current = category.id;
                          setDraggedId(category.id);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", category.id);
                          const row = e.currentTarget.closest("[data-reorder-row]");
                          if (row) e.dataTransfer.setDragImage(row, 20, 20);
                        }}
                        onDragEnd={resetDrag}
                        title={t.dragToReorder || "Drag to reorder"}
                        className={
                          savingOrder
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing"
                        }
                      >
                        <GripVertical size={16} />
                      </span>

                      <span className="w-7 text-center text-xs font-bold text-white bg-[#00215B] rounded-full py-1">
                        {index + 1}
                      </span>

                      {category.image ? (
                        <img
                          src={
                            category.image.startsWith("http")
                              ? category.image
                              : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5004"}${category.image}`
                          }
                          alt={category.name}
                          className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                          <ImageIcon size={16} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {category.name}
                        </p>
                        {category.nameBn && (
                          <p className="text-[11px] text-gray-400 truncate">
                            {category.nameBn}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleModalMove(index, index - 1)}
                          disabled={savingOrder || index === 0}
                          title={t.moveUp || "Move up"}
                          className="text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModalMove(index, index + 1)}
                          disabled={
                            savingOrder || index === orderedCategories.length - 1
                          }
                          title={t.moveDown || "Move down"}
                          className="text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      <PositionInput
                        value={index + 1}
                        max={orderedCategories.length}
                        disabled={savingOrder}
                        label={t.moveToPosition || "Move to position"}
                        onCommit={(position) =>
                          handleModalMoveTo(category.id, position)
                        }
                      />
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t flex items-center justify-between gap-2">
              <span className="text-[11px] text-gray-400">
                {orderedCategories.length} {t.categories}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReorder(false)}
                  disabled={savingOrder}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={savingOrder || reordering || !orderChanged}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingOrder ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {savingOrder ? t.saving : t.saveOrder || "Save Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PositionInput({ value, max, disabled, onCommit, label }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);

    if (Number.isNaN(parsed) || parsed < 1 || parsed > max) {
      setDraft(String(value));
      return;
    }

    if (parsed - 1 !== value - 1) {
      onCommit(parsed - 1);
    } else {
      setDraft(String(value));
    }
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min={1}
      max={max}
      value={draft}
      disabled={disabled}
      aria-label={label}
      title={label}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          setDraft(String(value));
          e.currentTarget.blur();
        }
      }}
      className="w-14 border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#EC008C]/30 focus:border-[#EC008C] disabled:opacity-40"
    />
  );
}
