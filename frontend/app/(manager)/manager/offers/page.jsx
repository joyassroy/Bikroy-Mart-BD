"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, Trash2, Edit2, X, Tag, Package, Gift, Sparkles, ShoppingBag, Search, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "@/components/ui/Pagination";

const OFFER_TYPES = [
  { value: "FLASH_DEAL", label: "Flash Deal", icon: Tag, color: "text-orange-600 bg-orange-50" },
  { value: "STOCK_CLEARANCE", label: "Stock Clearance", icon: Package, color: "text-red-600 bg-red-50" },
  { value: "EXECUTIVE", label: "Executive", icon: Sparkles, color: "text-pink-600 bg-pink-50" },
  { value: "COMBO", label: "Combo Offer", icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
  { value: "BOGO", label: "Buy One Get One", icon: Gift, color: "text-teal-600 bg-teal-50" },
  { value: "CUSTOM", label: "Custom Offer", icon: Tag, color: "text-purple-600 bg-purple-50" },
];

const IMG_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api").replace("/api", "");

const EMPTY_PRODUCT_FIELDS = {
  name: "", nameBn: "", description: "", price: "", discountPrice: "",
  unit: "piece", minQuantity: "1", stock: "", sku: "", categoryId: "",
  subcategoryId: "", deliveryTime: "1-2 hours", isFeatured: false,
};

const toDateTimeLocal = (d) => {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const toIsoDateTime = (localInput) => {
  if (!localInput) return "";
  const dt = new Date(localInput);
  return isNaN(dt.getTime()) ? "" : dt.toISOString();
};

const getOfferRunStatus = (startsAt, endsAt, isActive) => {
  if (!isActive) return { label: "Inactive", className: "bg-gray-100 text-gray-500 hover:bg-gray-200" };
  const now = Date.now();
  if (new Date(startsAt).getTime() > now) return { label: "Upcoming", className: "bg-amber-100 text-amber-700 hover:bg-amber-200" };
  if (new Date(endsAt).getTime() < now) return { label: "Expired", className: "bg-gray-100 text-gray-400 hover:bg-gray-200" };
  return { label: "Active", className: "bg-green-100 text-green-700 hover:bg-green-200" };
};

export default function OffersPage() {
  const [activeType, setActiveType] = useState("FLASH_DEAL");
  const [flashDeals, setFlashDeals] = useState([]);
  const [promoOffers, setPromoOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingSource, setEditingSource] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [flashPage, setFlashPage] = useState(1);
  const [promoPage, setPromoPage] = useState(1);
  const [imageFiles, setImageFiles] = useState([]);
  const ITEMS_PER_PAGE = 10;

  const [flashForm, setFlashForm] = useState({
    items: [], startsAt: "", endsAt: "",
  });

  const [promoForm, setPromoForm] = useState({
    title: "", offerDescription: "", offerPrice: "", buyQuantity: 1, getQuantity: 1, getDiscount: 100,
    items: [], startsAt: "", endsAt: "", sortOrder: 0,
  });
  const [addProductId, setAddProductId] = useState("");
  const [newProductFields, setNewProductFields] = useState({ ...EMPTY_PRODUCT_FIELDS });

  useEffect(() => {
    fetchAll();
    api.get("/products?limit=200").then((res) => setProducts(res.data.data || [])).catch(console.error);
    api.get("/categories").then((res) => setCategories(res.data.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    const catId = newProductFields.categoryId;
    if (catId) {
      api.get(`/subcategories?categoryId=${catId}`).then((res) => setSubcategories(res.data.data || [])).catch(console.error);
    }
  }, [newProductFields.categoryId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [flashRes, promoRes] = await Promise.all([
        api.get("/flash-deals?all=true").catch(() => ({ data: { data: [] } })),
        api.get("/offers/admin/all").catch(() => ({ data: { data: [] } })),
      ]);
      setFlashDeals(flashRes.data.data || []);
      setPromoOffers(promoRes.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const resetForms = () => {
    setFlashForm({ items: [], startsAt: "", endsAt: "" });
    setPromoForm({ title: "", offerDescription: "", offerPrice: "", buyQuantity: 1, getQuantity: 1, getDiscount: 100, items: [], startsAt: "", endsAt: "", sortOrder: 0 });
    setNewProductFields({ ...EMPTY_PRODUCT_FIELDS });
    setAddProductId("");
    setEditingId(null);
    setEditingSource(null);
    setProductSearch("");
    setImageFiles([]);
    setSubcategories([]);
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files).slice(0, 5));
    }
  };

  const createProductFromForm = async (formFields) => {
    const formData = new FormData();
    formData.append("name", formFields.name);
    formData.append("nameBn", formFields.nameBn);
    formData.append("description", formFields.description);
    formData.append("price", formFields.price);
    formData.append("discountPrice", formFields.discountPrice || "");
    formData.append("unit", formFields.unit);
    formData.append("minQuantity", formFields.minQuantity || "1");
    formData.append("stock", formFields.stock);
    formData.append("sku", formFields.sku);
    formData.append("categoryId", formFields.categoryId);
    formData.append("subcategoryId", formFields.subcategoryId || "");
    formData.append("deliveryTime", formFields.deliveryTime);
    formData.append("isFeatured", formFields.isFeatured);
    const files = formFields._imageFiles || imageFiles;
    files.forEach((file) => formData.append("images", file));
    const res = await api.post("/products", formData);
    return res.data.data;
  };

  const addProductToItems = (product, quantity = 1) => {
    if (!product?.id) return;
    if (promoForm.items.some((it) => it.productId === product.id)) {
      toast.error("Product already added to offer");
      return;
    }
    setPromoForm({
      ...promoForm,
      items: [...promoForm.items, { productId: product.id, quantity, name: product.name, price: product.price, image: product.images?.[0] || "" }],
    });
  };

  const updateItemQty = (index, quantity) => {
    setPromoForm({
      ...promoForm,
      items: promoForm.items.map((it, i) => (i === index ? { ...it, quantity: Number(quantity) || 0 } : it)),
    });
  };

  const removeItem = (index) => {
    setPromoForm({ ...promoForm, items: promoForm.items.filter((_, i) => i !== index) });
  };

  const handleCreateProductAndAdd = async () => {
    if (!newProductFields.name || !newProductFields.price || !newProductFields.stock || !newProductFields.categoryId) {
      toast.error("Fill product name, price, stock & category");
      return;
    }
    setSubmitting(true);
    try {
      const newProduct = await createProductFromForm(newProductFields);
      addProductToItems(newProduct, 1);
      setNewProductFields({ ...EMPTY_PRODUCT_FIELDS });
      setImageFiles([]);
      setSubcategories([]);
      const res = await api.get("/products?limit=200");
      setProducts(res.data.data || []);
      toast.success("Product created & added to offer");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create product"); }
    finally { setSubmitting(false); }
  };

  const addProductToFlashItems = (product) => {
    if (!product?.id) return;
    if (flashForm.items.some((it) => it.productId === product.id)) {
      toast.error("Product already added to offer");
      return;
    }
    setFlashForm({
      ...flashForm,
      items: [...flashForm.items, {
        productId: product.id,
        dealPrice: product.discountPrice || product.price,
        quantity: 1,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "",
      }],
    });
  };

  const updateFlashItem = (index, field, value) => {
    setFlashForm({
      ...flashForm,
      items: flashForm.items.map((it, i) =>
        i === index ? { ...it, [field]: Number(value) || 0 } : it
      ),
    });
  };

  const removeFlashItem = (index) => {
    setFlashForm({ ...flashForm, items: flashForm.items.filter((_, i) => i !== index) });
  };

  const handleCreateProductAndAddFlash = async () => {
    if (!newProductFields.name || !newProductFields.price || !newProductFields.stock || !newProductFields.categoryId) {
      toast.error("Fill product name, price, stock & category");
      return;
    }
    setSubmitting(true);
    try {
      const newProduct = await createProductFromForm(newProductFields);
      addProductToFlashItems(newProduct);
      setNewProductFields({ ...EMPTY_PRODUCT_FIELDS });
      setImageFiles([]);
      setSubcategories([]);
      const res = await api.get("/products?limit=200");
      setProducts(res.data.data || []);
      toast.success("Product created & added to offer");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create product"); }
    finally { setSubmitting(false); }
  };

  const handleFlashSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (flashForm.items.length === 0) {
        toast.error("Add at least one product to the offer");
        setSubmitting(false);
        return;
      }
      const data = flashForm.items.map((it) => ({
        productId: it.productId,
        type: activeType,
        dealPrice: Number(it.dealPrice),
        quantity: Number(it.quantity),
        startsAt: toIsoDateTime(flashForm.startsAt), endsAt: toIsoDateTime(flashForm.endsAt),
      }));

      if (editingId && editingSource === "flash") {
        await api.put(`/flash-deals/${editingId}`, data[0]);
        toast.success("Offer updated");
      } else {
        await Promise.all(data.map((d) => api.post("/flash-deals", d)));
        toast.success(data.length > 1 ? `${data.length} offers created` : "Offer created");
      }
      resetForms();
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const items = promoForm.items.map(({ productId, quantity }) => ({ productId, quantity }));
      if (items.length === 0) {
        toast.error("Add at least one product to the offer");
        setSubmitting(false);
        return;
      }

      const data = {
        title: promoForm.title, description: promoForm.offerDescription, type: activeType,
        offerPrice: Number(promoForm.offerPrice),
        buyQuantity: promoForm.buyQuantity, getQuantity: promoForm.getQuantity,
        getDiscount: promoForm.getDiscount,
        items, startsAt: toIsoDateTime(promoForm.startsAt), endsAt: toIsoDateTime(promoForm.endsAt),
        sortOrder: promoForm.sortOrder,
      };

      if (editingId && editingSource === "promo") {
        await api.put(`/offers/${editingId}`, data);
        toast.success("Offer updated");
      } else {
        await api.post("/offers", data);
        toast.success("Offer created");
      }
      resetForms();
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const handleFlashEdit = (deal) => {
    setActiveType(deal.type);
    setEditingId(deal.id);
    setEditingSource("flash");
    setFlashForm({
      items: [{
        productId: deal.productId,
        dealPrice: deal.dealPrice,
        quantity: deal.quantity,
        name: deal.product?.name || "",
        price: deal.product?.price || "",
        image: deal.product?.images?.[0] || "",
      }],
      startsAt: toDateTimeLocal(deal.startsAt),
      endsAt: toDateTimeLocal(deal.endsAt),
    });
    setNewProductFields({ ...EMPTY_PRODUCT_FIELDS });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePromoEdit = (offer) => {
    setActiveType(offer.type);
    setEditingId(offer.id);
    setEditingSource("promo");
    setPromoForm({
      title: offer.title,
      offerDescription: offer.description || "",
      offerPrice: offer.offerPrice,
      buyQuantity: offer.buyQuantity,
      getQuantity: offer.getQuantity,
      getDiscount: offer.getDiscount,
      items: (offer.items || []).map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        name: i.product?.name || "",
        price: i.product?.price || "",
        image: i.product?.images?.[0] || "",
      })),
      startsAt: toDateTimeLocal(offer.startsAt),
      endsAt: toDateTimeLocal(offer.endsAt),
      sortOrder: offer.sortOrder || 0,
    });
    setNewProductFields({ ...EMPTY_PRODUCT_FIELDS });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Delete this offer?")) return;
    try {
      if (type === "flash") await api.delete(`/flash-deals/${id}`);
      else await api.delete(`/offers/${id}`);
      toast.success("Deleted");
      fetchAll();
    } catch (err) { toast.error("Failed"); }
  };

  const toggleActive = async (type, id, isActive) => {
    try {
      if (type === "flash") await api.put(`/flash-deals/${id}`, { isActive: !isActive });
      else await api.put(`/offers/${id}`, { isActive: !isActive });
      toast.success(isActive ? "Deactivated" : "Activated");
      fetchAll();
    } catch (err) { toast.error("Failed"); }
  };

  const isFlashType = activeType === "FLASH_DEAL" || activeType === "STOCK_CLEARANCE" || activeType === "EXECUTIVE";

  const currentItems = flashDeals.filter((d) => d.type === activeType);
  const currentPromoItems = promoOffers.filter((o) => o.type === activeType);

  const flashTotalPages = Math.ceil(currentItems.length / ITEMS_PER_PAGE);
  const paginatedFlash = currentItems.slice((flashPage - 1) * ITEMS_PER_PAGE, flashPage * ITEMS_PER_PAGE);
  const promoTotalPages = Math.ceil(currentPromoItems.length / ITEMS_PER_PAGE);
  const paginatedPromo = currentPromoItems.slice((promoPage - 1) * ITEMS_PER_PAGE, promoPage * ITEMS_PER_PAGE);

  useEffect(() => { setFlashPage(1); setPromoPage(1); }, [activeType]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Offers Management</h1>

      {/* Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {OFFER_TYPES.map((ot) => (
          <button key={ot.value} onClick={() => { setActiveType(ot.value); resetForms(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
              activeType === ot.value ? ot.color + " ring-2 ring-offset-1" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            <ot.icon size={14} /> {ot.label}
          </button>
        ))}
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6 max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800">
            {editingId ? `Edit ${OFFER_TYPES.find((t) => t.value === activeType)?.label}` : `Add ${OFFER_TYPES.find((t) => t.value === activeType)?.label}`}
          </h3>
          {editingId && (
            <button onClick={resetForms} className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
              <X size={14} /> Cancel
            </button>
          )}
        </div>

        <form onSubmit={isFlashType ? handleFlashSubmit : handlePromoSubmit} className="space-y-6">
          {/* Offer Products */}
          {isFlashType ? (
            <div className="border-b pb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Offer Products *</p>
              {flashForm.items.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No products added yet. Add existing products or create a new one below.</p>
              ) : (
                <div className="space-y-2">
                  {flashForm.items.map((it, idx) => (
                    <div key={it.productId} className="flex items-center gap-3 border rounded-lg p-2">
                      {it.image ? (
                        <img src={it.image.startsWith("/") ? `${IMG_BASE}${it.image}` : it.image} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg">📦</div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{it.name}</p>
                        <p className="text-xs text-gray-400">৳{it.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" step="0.01" min="1" value={it.dealPrice}
                          onChange={(e) => updateFlashItem(idx, "dealPrice", e.target.value)}
                          className="w-24 border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="Deal price" />
                        <input type="number" min="1" value={it.quantity}
                          onChange={(e) => updateFlashItem(idx, "quantity", e.target.value)}
                          className="w-20 border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="Qty" />
                        <button type="button" onClick={() => removeFlashItem(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="border-b pb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Offer Products *</p>
              {promoForm.items.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No products added yet. Add existing products or create a new one below.</p>
              ) : (
                <div className="space-y-2">
                  {promoForm.items.map((it, idx) => (
                    <div key={it.productId} className="flex items-center gap-3 border rounded-lg p-2">
                      {it.image ? (
                        <img src={it.image.startsWith("/") ? `${IMG_BASE}${it.image}` : it.image} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg">📦</div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{it.name}</p>
                        <p className="text-xs text-gray-400">৳{it.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" min="1" value={it.quantity}
                          onChange={(e) => updateItemQty(idx, e.target.value)}
                          className="w-20 border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Existing Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Existing Product</label>
            <div className="relative mb-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search existing product..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select value={addProductId} onChange={(e) => setAddProductId(e.target.value)}
                className="flex-1 w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                <option value="">-- Select product --</option>
                {filteredProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
                ))}
              </select>
              <button type="button" onClick={() => { const p = filteredProducts.find((x) => x.id === addProductId); if (p) { if (isFlashType) addProductToFlashItems(p); else addProductToItems(p); setAddProductId(""); } }}
                disabled={!addProductId}
                className="px-4 py-2.5 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 transition flex items-center gap-1">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Create New Product */}
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-3 italic">Or fill below to create a new product and add it to this offer</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" value={newProductFields.name} onChange={(e) => setNewProductFields({ ...newProductFields, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bengali Name</label>
                <input type="text" value={newProductFields.nameBn} onChange={(e) => setNewProductFields({ ...newProductFields, nameBn: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input type="text" value={newProductFields.sku} onChange={(e) => setNewProductFields({ ...newProductFields, sku: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={newProductFields.categoryId} onChange={(e) => setNewProductFields({ ...newProductFields, categoryId: e.target.value, subcategoryId: "" })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                <select value={newProductFields.subcategoryId} onChange={(e) => setNewProductFields({ ...newProductFields, subcategoryId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                  <option value="">Select subcategory</option>
                  {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <input type="number" step="0.01" value={newProductFields.price} onChange={(e) => setNewProductFields({ ...newProductFields, price: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
                <input type="number" step="0.01" value={newProductFields.discountPrice} onChange={(e) => setNewProductFields({ ...newProductFields, discountPrice: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select value={newProductFields.unit} onChange={(e) => setNewProductFields({ ...newProductFields, unit: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                  <option value="piece">Piece</option>
                  <option value="ekok">Ekok</option>
                  <option value="kg">Kilogram</option>
                  <option value="gram">Gram</option>
                  <option value="litre">Litre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Quantity</label>
                <input type="number" step="0.01" value={newProductFields.minQuantity} onChange={(e) => setNewProductFields({ ...newProductFields, minQuantity: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                <input type="number" value={newProductFields.stock} onChange={(e) => setNewProductFields({ ...newProductFields, stock: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                <input type="text" value={newProductFields.deliveryTime} onChange={(e) => setNewProductFields({ ...newProductFields, deliveryTime: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={newProductFields.description} onChange={(e) => setNewProductFields({ ...newProductFields, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (max 5)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP (max 5 files)</p>
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                {imageFiles.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {imageFiles.map((f, i) => (
                      <div key={i} className="relative flex-shrink-0">
                        <img src={URL.createObjectURL(f)} alt="preview" className="w-16 h-16 object-cover rounded border" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input type="checkbox" checked={newProductFields.isFeatured} onChange={(e) => setNewProductFields({ ...newProductFields, isFeatured: e.target.checked })}
                  className="text-primary-600 rounded" />
                <label className="text-sm text-gray-700">Featured Product</label>
              </div>
            </div>
            <button type="button" onClick={isFlashType ? handleCreateProductAndAddFlash : handleCreateProductAndAdd} disabled={submitting}
              className="mt-4 bg-primary-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-primary-700 disabled:bg-gray-300 transition flex items-center gap-2">
              {submitting ? "Creating..." : <><Plus size={14} /> Create & Add to Offer</>}
            </button>
          </div>

          {/* Offer Details */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Offer Details</p>
            {isFlashType ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="datetime-local" required value={flashForm.startsAt} onChange={(e) => setFlashForm({ ...flashForm, startsAt: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input type="datetime-local" required value={flashForm.endsAt} onChange={(e) => setFlashForm({ ...flashForm, endsAt: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title *</label>
                  <input type="text" required value={promoForm.title} onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="e.g., Family Combo Pack" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Description</label>
                  <textarea rows={3} value={promoForm.offerDescription} onChange={(e) => setPromoForm({ ...promoForm, offerDescription: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="Offer description..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Price *</label>
                  <input type="number" required step="0.01" value={promoForm.offerPrice} onChange={(e) => setPromoForm({ ...promoForm, offerPrice: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="Total bundle price" />
                </div>
                {activeType === "BOGO" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buy Quantity</label>
                      <input type="number" min="1" value={promoForm.buyQuantity} onChange={(e) => setPromoForm({ ...promoForm, buyQuantity: Number(e.target.value) })}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Get Quantity</label>
                      <input type="number" min="1" value={promoForm.getQuantity} onChange={(e) => setPromoForm({ ...promoForm, getQuantity: Number(e.target.value) })}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Get Discount % (100=free)</label>
                      <input type="number" min="0" max="100" value={promoForm.getDiscount} onChange={(e) => setPromoForm({ ...promoForm, getDiscount: Number(e.target.value) })}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="datetime-local" required value={promoForm.startsAt} onChange={(e) => setPromoForm({ ...promoForm, startsAt: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input type="datetime-local" required value={promoForm.endsAt} onChange={(e) => setPromoForm({ ...promoForm, endsAt: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" value={promoForm.sortOrder} onChange={(e) => setPromoForm({ ...promoForm, sortOrder: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting}
            className="bg-primary-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-primary-700 disabled:bg-gray-300 transition flex items-center gap-2">
            {submitting ? "Creating..." : editingId ? <><Edit2 size={14} /> Update</> : <><Plus size={14} /> Create</>}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{OFFER_TYPES.find((t) => t.value === activeType)?.label}s</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Product(s)</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : (
                <>
                  {paginatedFlash.map((deal) => (
                    <tr key={deal.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {deal.product?.images?.[0] ? (
                            <img src={deal.product.images[0].startsWith("/") ? `${IMG_BASE}${deal.product.images[0]}` : deal.product.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg">📦</div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{deal.product?.name}</p>
                            <p className="text-xs text-gray-400">Qty: {deal.quantity} | Sold: {deal.sold}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-green-600">৳{deal.dealPrice}</span>
                        <span className="text-xs text-gray-400 line-through ml-1">৳{deal.product?.price}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(deal.startsAt).toLocaleDateString()} - {new Date(deal.endsAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(deal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive("flash", deal.id, deal.isActive)}
                          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition ${getOfferRunStatus(deal.startsAt, deal.endsAt, deal.isActive).className}`}>{getOfferRunStatus(deal.startsAt, deal.endsAt, deal.isActive).label}</button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleFlashEdit(deal)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete("flash", deal.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedPromo.map((offer) => (
                    <tr key={offer.id} className="border-b hover:bg-gray-50 bg-blue-50/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {offer.items?.[0]?.product?.images?.[0] ? (
                            <img src={offer.items[0].product.images[0].startsWith("/") ? `${IMG_BASE}${offer.items[0].product.images[0]}` : offer.items[0].product.images[0]} alt="" className="w-10 h-10 rounded object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg border border-gray-200">📦</div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{offer.title}</p>
                            <p className="text-xs text-gray-400 max-w-[200px] truncate" title={offer.items?.map((i) => `${i.product?.name} x${i.quantity}`).join(" + ")}>
                              {offer.items?.map((i) => `${i.product?.name} x${i.quantity}`).join(" + ")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-green-600">৳{offer.offerPrice}</span>
                        {activeType === "BOGO" && (
                          <span className="text-xs text-teal-600 block">Buy {offer.buyQuantity} Get {offer.getQuantity} ({offer.getDiscount}% off)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(offer.startsAt).toLocaleDateString()} - {new Date(offer.endsAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive("promo", offer.id, offer.isActive)}
                          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition ${getOfferRunStatus(offer.startsAt, offer.endsAt, offer.isActive).className}`}>{getOfferRunStatus(offer.startsAt, offer.endsAt, offer.isActive).label}</button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handlePromoEdit(offer)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete("promo", offer.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && currentPromoItems.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No offers of this type yet</td></tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {currentItems.length > ITEMS_PER_PAGE && (
        <Pagination currentPage={flashPage} totalPages={flashTotalPages} onPageChange={setFlashPage} totalItems={currentItems.length} itemsPerPage={ITEMS_PER_PAGE} />
      )}
      {currentPromoItems.length > ITEMS_PER_PAGE && (
        <Pagination currentPage={promoPage} totalPages={promoTotalPages} onPageChange={setPromoPage} totalItems={currentPromoItems.length} itemsPerPage={ITEMS_PER_PAGE} />
      )}
    </div>
  );
}
