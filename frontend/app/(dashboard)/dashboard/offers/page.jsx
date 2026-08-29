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
    productId: "", dealPrice: "", quantity: "", startsAt: "", endsAt: "",
    ...EMPTY_PRODUCT_FIELDS,
  });

  const [promoForm, setPromoForm] = useState({
    title: "", description: "", offerPrice: "", buyQuantity: 1, getQuantity: 1, getDiscount: 100,
    items: [], startsAt: "", endsAt: "", sortOrder: 0,
    ...EMPTY_PRODUCT_FIELDS,
  });

  useEffect(() => {
    fetchAll();
    api.get("/products?limit=200").then((res) => setProducts(res.data.data || [])).catch(console.error);
    api.get("/categories").then((res) => setCategories(res.data.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    const catId = flashForm.categoryId || promoForm.categoryId;
    if (catId) {
      api.get(`/subcategories?categoryId=${catId}`).then((res) => setSubcategories(res.data.data || [])).catch(console.error);
    }
  }, [flashForm.categoryId, promoForm.categoryId]);

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
    setFlashForm({ productId: "", dealPrice: "", quantity: "", startsAt: "", endsAt: "", ...EMPTY_PRODUCT_FIELDS });
    setPromoForm({ title: "", description: "", offerPrice: "", buyQuantity: 1, getQuantity: 1, getDiscount: 100, items: [], startsAt: "", endsAt: "", sortOrder: 0, ...EMPTY_PRODUCT_FIELDS });
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

  const handleFlashSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let productId = flashForm.productId;

      if (!productId) {
        if (!flashForm.name || !flashForm.price || !flashForm.stock || !flashForm.categoryId) {
          toast.error("Select a product or fill product name, price, stock & category");
          setSubmitting(false);
          return;
        }
        const newProduct = await createProductFromForm(flashForm);
        productId = newProduct.id;
        const res = await api.get("/products?limit=200");
        setProducts(res.data.data || []);
      }

      const data = {
        productId, type: activeType,
        dealPrice: Number(flashForm.dealPrice),
        quantity: Number(flashForm.quantity),
        startsAt: flashForm.startsAt, endsAt: flashForm.endsAt,
      };

      if (editingId && editingSource === "flash") {
        await api.put(`/flash-deals/${editingId}`, data);
        toast.success("Offer updated");
      } else {
        await api.post("/flash-deals", data);
        toast.success("Offer created");
      }
      resetForms();
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    if (promoForm.items.length === 0) return toast.error("Add at least one product");
    setSubmitting(true);
    try {
      let items = [...promoForm.items];

      for (let i = 0; i < items.length; i++) {
        if (!items[i].productId && items[i].newProduct) {
          const np = items[i].newProduct;
          if (!np.name || !np.price || !np.stock || !np.categoryId) {
            toast.error(`Product ${i + 1}: fill name, price, stock & category`);
            setSubmitting(false);
            return;
          }
          const newProduct = await createProductFromForm(np);
          items[i] = { ...items[i], productId: newProduct.id };
        }
      }

      const cleanItems = items.map((it) => ({ productId: it.productId, quantity: it.quantity }));

      const data = {
        title: promoForm.title, description: promoForm.description, type: activeType,
        offerPrice: Number(promoForm.offerPrice),
        buyQuantity: promoForm.buyQuantity, getQuantity: promoForm.getQuantity,
        getDiscount: promoForm.getDiscount,
        items: cleanItems, startsAt: promoForm.startsAt, endsAt: promoForm.endsAt,
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
      productId: deal.productId,
      dealPrice: deal.dealPrice,
      quantity: deal.quantity,
      startsAt: deal.startsAt ? new Date(deal.startsAt).toISOString().slice(0, 16) : "",
      endsAt: deal.endsAt ? new Date(deal.endsAt).toISOString().slice(0, 16) : "",
      name: deal.product?.name || "",
      nameBn: deal.product?.nameBn || "",
      description: deal.product?.description || "",
      price: deal.product?.price || "",
      discountPrice: deal.product?.discountPrice || "",
      unit: deal.product?.unit || "piece",
      minQuantity: deal.product?.minQuantity || "1",
      stock: deal.product?.stock ?? "",
      sku: deal.product?.sku || "",
      categoryId: deal.product?.categoryId || "",
      subcategoryId: deal.product?.subcategoryId || "",
      deliveryTime: deal.product?.deliveryTime || "1-2 hours",
      isFeatured: deal.product?.isFeatured || false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePromoEdit = (offer) => {
    setActiveType(offer.type);
    setEditingId(offer.id);
    setEditingSource("promo");
    setPromoForm({
      title: offer.title,
      description: offer.description || "",
      offerPrice: offer.offerPrice,
      buyQuantity: offer.buyQuantity,
      getQuantity: offer.getQuantity,
      getDiscount: offer.getDiscount,
      items: offer.items?.map((i) => ({ productId: i.productId, quantity: i.quantity })) || [],
      startsAt: offer.startsAt ? new Date(offer.startsAt).toISOString().slice(0, 16) : "",
      endsAt: offer.endsAt ? new Date(offer.endsAt).toISOString().slice(0, 16) : "",
      sortOrder: offer.sortOrder || 0,
      ...EMPTY_PRODUCT_FIELDS,
    });
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

  const addPromoItem = () => {
    if (!promoForm.items.length || promoForm.items[promoForm.items.length - 1].productId || promoForm.items[promoForm.items.length - 1].newProduct) {
      setPromoForm({ ...promoForm, items: [...promoForm.items, { productId: "", quantity: 1, newProduct: null }] });
    }
  };

  const updatePromoItem = (index, field, value) => {
    const newItems = [...promoForm.items];
    newItems[index][field] = field === "quantity" ? Number(value) : value;
    setPromoForm({ ...promoForm, items: newItems });
  };

  const removePromoItem = (index) => {
    setPromoForm({ ...promoForm, items: promoForm.items.filter((_, i) => i !== index) });
  };

  const isMultiProduct = activeType === "COMBO" || activeType === "BOGO" || activeType === "CUSTOM";

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

        {!isMultiProduct ? (
          /* ============ Single Product Form (Flash Deal / Stock Clearance / Executive) ============ */
          <form onSubmit={handleFlashSubmit} className="space-y-6">
            {/* Product Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Existing Product</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search existing product..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none mb-1"
                />
              </div>
              <select value={flashForm.productId} onChange={(e) => setFlashForm({ ...flashForm, productId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                <option value="">-- Select product or leave empty to create new --</option>
                {filteredProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
                ))}
              </select>
            </div>

            {/* Product Details (for creating new product) */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-3 italic">Fill below to create a new product (only if no product selected above)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input type="text" value={flashForm.name} onChange={(e) => setFlashForm({ ...flashForm, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bengali Name</label>
                  <input type="text" value={flashForm.nameBn} onChange={(e) => setFlashForm({ ...flashForm, nameBn: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" value={flashForm.sku} onChange={(e) => setFlashForm({ ...flashForm, sku: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={flashForm.categoryId} onChange={(e) => setFlashForm({ ...flashForm, categoryId: e.target.value, subcategoryId: "" })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <select value={flashForm.subcategoryId} onChange={(e) => setFlashForm({ ...flashForm, subcategoryId: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                    <option value="">Select subcategory</option>
                    {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input type="number" step="0.01" value={flashForm.price} onChange={(e) => setFlashForm({ ...flashForm, price: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
                  <input type="number" step="0.01" value={flashForm.discountPrice} onChange={(e) => setFlashForm({ ...flashForm, discountPrice: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={flashForm.unit} onChange={(e) => setFlashForm({ ...flashForm, unit: e.target.value })}
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
                  <input type="number" step="0.01" value={flashForm.minQuantity} onChange={(e) => setFlashForm({ ...flashForm, minQuantity: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input type="number" value={flashForm.stock} onChange={(e) => setFlashForm({ ...flashForm, stock: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                  <input type="text" value={flashForm.deliveryTime} onChange={(e) => setFlashForm({ ...flashForm, deliveryTime: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={flashForm.description} onChange={(e) => setFlashForm({ ...flashForm, description: e.target.value })}
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
                  <input type="checkbox" checked={flashForm.isFeatured} onChange={(e) => setFlashForm({ ...flashForm, isFeatured: e.target.checked })}
                    className="text-primary-600 rounded" />
                  <label className="text-sm text-gray-700">Featured Product</label>
                </div>
              </div>
            </div>

            {/* Offer Details */}
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Offer Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Price *</label>
                  <input type="number" required step="0.01" value={flashForm.dealPrice} onChange={(e) => setFlashForm({ ...flashForm, dealPrice: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="Special price" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input type="number" required value={flashForm.quantity} onChange={(e) => setFlashForm({ ...flashForm, quantity: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="Available qty" />
                </div>
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
            </div>

            <button type="submit" disabled={submitting}
              className="bg-primary-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-primary-700 disabled:bg-gray-300 transition flex items-center gap-2">
              {submitting ? "Creating..." : editingId ? <><Edit2 size={14} /> Update</> : <><Plus size={14} /> Create</>}
            </button>
          </form>
        ) : (
          /* ============ Multi Product Form (Combo / BOGO / Custom) ============ */
          <form onSubmit={handlePromoSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title *</label>
                <input type="text" required value={promoForm.title} onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="e.g., Family Combo Pack" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={promoForm.description} onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
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

            {/* Products in bundle */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Products in Bundle *</label>
                <button type="button" onClick={addPromoItem} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  <Plus size={14} /> Add Product
                </button>
              </div>
              <div className="mb-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-3">
                {promoForm.items.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <select value={item.productId} onChange={(e) => updatePromoItem(idx, "productId", e.target.value)}
                        className="flex-1 border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        <option value="">-- Select existing or leave empty to create new --</option>
                        {filteredProducts.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
                        ))}
                      </select>
                      <input type="number" min="1" value={item.quantity} onChange={(e) => updatePromoItem(idx, "quantity", e.target.value)}
                        className="w-20 border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="Qty" />
                      <button type="button" onClick={() => removePromoItem(idx)} className="text-red-500 hover:text-red-700 p-1">
                        <X size={16} />
                      </button>
                    </div>
                    {!item.productId && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 border-l-2 border-primary-200">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
                          <input type="text" value={item.newProduct?.name || ""}
                            onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), name: e.target.value };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Bengali Name</label>
                          <input type="text" value={item.newProduct?.nameBn || ""}
                            onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), nameBn: e.target.value };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                          <input type="text" value={item.newProduct?.sku || ""}
                            onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), sku: e.target.value };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                          <select value={item.newProduct?.categoryId || ""} onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), categoryId: e.target.value, subcategoryId: "" };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                            <option value="">Select category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Subcategory</label>
                          <select value={item.newProduct?.subcategoryId || ""} onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), subcategoryId: e.target.value };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                            <option value="">Select subcategory</option>
                            {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Price *</label>
                          <input type="number" step="0.01" value={item.newProduct?.price || ""}
                            onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), price: e.target.value };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Discount Price</label>
                          <input type="number" step="0.01" value={item.newProduct?.discountPrice || ""}
                            onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), discountPrice: e.target.value };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                          <select value={item.newProduct?.unit || "piece"} onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), unit: e.target.value };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                            <option value="piece">Piece</option>
                            <option value="ekok">Ekok</option>
                            <option value="kg">Kilogram</option>
                            <option value="gram">Gram</option>
                            <option value="litre">Litre</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Min Quantity</label>
                          <input type="number" step="0.01" value={item.newProduct?.minQuantity || "1"}
                            onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), minQuantity: e.target.value };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Stock *</label>
                          <input type="number" value={item.newProduct?.stock || ""}
                            onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), stock: e.target.value };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Time</label>
                          <input type="text" value={item.newProduct?.deliveryTime || "1-2 hours"}
                            onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), deliveryTime: e.target.value };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                          <textarea rows={3} value={item.newProduct?.description || ""}
                            onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), description: e.target.value };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-2">Product Images (max 5)</label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-3 pb-4">
                                <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                                <p className="text-xs text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-400">PNG, JPG, WEBP (max 5)</p>
                              </div>
                              <input type="file" multiple accept="image/*" onChange={(e) => {
                                  if (e.target.files) {
                                    const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS) };
                                    np._imageFiles = Array.from(e.target.files).slice(0, 5);
                                    updatePromoItem(idx, "newProduct", np);
                                  }
                                }} className="hidden" />
                            </label>
                          </div>
                          {item.newProduct?._imageFiles?.length > 0 && (
                            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                              {item.newProduct._imageFiles.map((f, i) => (
                                <img key={i} src={URL.createObjectURL(f)} alt="preview" className="w-12 h-12 object-cover rounded border" />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <input type="checkbox" checked={item.newProduct?.isFeatured || false} onChange={(e) => {
                              const np = { ...(item.newProduct || EMPTY_PRODUCT_FIELDS), isFeatured: e.target.checked };
                              updatePromoItem(idx, "newProduct", np);
                            }}
                            className="text-primary-600 rounded" />
                          <label className="text-xs text-gray-600">Featured Product</label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="bg-primary-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-primary-700 disabled:bg-gray-300 transition flex items-center gap-2">
              {submitting ? "Creating..." : editingId ? <><Edit2 size={14} /> Update</> : <><Plus size={14} /> Create</>}
            </button>
          </form>
        )}
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
                          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition ${
                            deal.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}>{deal.isActive ? "Active" : "Inactive"}</button>
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
                        <div>
                          <p className="text-sm font-medium">{offer.title}</p>
                          <p className="text-xs text-gray-400">
                            {offer.items?.map((i) => `${i.product?.name} x${i.quantity}`).join(" + ")}
                          </p>
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
                          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition ${
                            offer.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}>{offer.isActive ? "Active" : "Inactive"}</button>
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
