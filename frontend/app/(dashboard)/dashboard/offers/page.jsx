"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, Trash2, Edit2, X, Tag, Package, Gift, Sparkles, ShoppingBag, Search } from "lucide-react";
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

export default function OffersPage() {
  const [activeType, setActiveType] = useState("FLASH_DEAL");
  const [flashDeals, setFlashDeals] = useState([]);
  const [promoOffers, setPromoOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingSource, setEditingSource] = useState(null); // "flash" or "promo"
  const [productSearch, setProductSearch] = useState("");
  const [flashPage, setFlashPage] = useState(1);
  const [promoPage, setPromoPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [flashForm, setFlashForm] = useState({
    productId: "", dealPrice: "", quantity: "", startsAt: "", endsAt: "",
  });

  const [promoForm, setPromoForm] = useState({
    title: "", description: "", offerPrice: "", buyQuantity: 1, getQuantity: 1, getDiscount: 100,
    items: [], startsAt: "", endsAt: "", sortOrder: 0,
  });

  useEffect(() => {
    fetchAll();
    api.get("/products?limit=200").then((res) => setProducts(res.data.data || [])).catch(console.error);
  }, []);

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
    setFlashForm({ productId: "", dealPrice: "", quantity: "", startsAt: "", endsAt: "" });
    setPromoForm({ title: "", description: "", offerPrice: "", buyQuantity: 1, getQuantity: 1, getDiscount: 100, items: [], startsAt: "", endsAt: "", sortOrder: 0 });
    setEditingId(null);
    setEditingSource(null);
    setProductSearch("");
  };

  const handleFlashSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...flashForm, type: activeType, dealPrice: Number(flashForm.dealPrice), quantity: Number(flashForm.quantity) };
      if (editingId && editingSource === "flash") {
        await api.put(`/flash-deals/${editingId}`, data);
        toast.success("Flash deal updated");
      } else {
        await api.post("/flash-deals", data);
        toast.success("Flash deal created");
      }
      resetForms();
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    if (promoForm.items.length === 0) return toast.error("Add at least one product");
    try {
      const data = { ...promoForm, type: activeType, offerPrice: Number(promoForm.offerPrice) };
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
    if (!promoForm.items.length || promoForm.items[promoForm.items.length - 1].productId) {
      setPromoForm({ ...promoForm, items: [...promoForm.items, { productId: "", quantity: 1 }] });
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
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">
            {editingId ? `Edit ${OFFER_TYPES.find((t) => t.value === activeType)?.label}` : `Add ${OFFER_TYPES.find((t) => t.value === activeType)?.label}`}
          </h3>
          {editingId && (
            <button onClick={resetForms} className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
              <X size={14} /> Cancel
            </button>
          )}
        </div>

        {!isMultiProduct ? (
          /* Single Product Form (Flash Deal / Stock Clearance / Executive) */
          <form onSubmit={handleFlashSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Product *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none mb-1"
                  />
                </div>
                <select required value={flashForm.productId} onChange={(e) => setFlashForm({ ...flashForm, productId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                  <option value="">Select product</option>
                  {filteredProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Deal Price *</label>
                <input type="number" required step="0.01" value={flashForm.dealPrice} onChange={(e) => setFlashForm({ ...flashForm, dealPrice: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Special price" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
                <input type="number" required value={flashForm.quantity} onChange={(e) => setFlashForm({ ...flashForm, quantity: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Available qty" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date *</label>
                <input type="datetime-local" required value={flashForm.startsAt} onChange={(e) => setFlashForm({ ...flashForm, startsAt: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date *</label>
                <input type="datetime-local" required value={flashForm.endsAt} onChange={(e) => setFlashForm({ ...flashForm, endsAt: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
              </div>
            </div>
            <button type="submit" className="bg-pink-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-pink-700 transition flex items-center gap-2">
              {editingId ? <><Edit2 size={14} /> Update</> : <><Plus size={14} /> Create</>}
            </button>
          </form>
        ) : (
          /* Multi Product Form (Combo / BOGO) */
          <form onSubmit={handlePromoSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Offer Title *</label>
                <input type="text" required value={promoForm.title} onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="e.g., Family Combo Pack" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bundle Price *</label>
                <input type="number" required step="0.01" value={promoForm.offerPrice} onChange={(e) => setPromoForm({ ...promoForm, offerPrice: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Total bundle price" />
              </div>
              {activeType === "BOGO" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Buy Quantity</label>
                    <input type="number" min="1" value={promoForm.buyQuantity} onChange={(e) => setPromoForm({ ...promoForm, buyQuantity: Number(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Get Quantity</label>
                    <input type="number" min="1" value={promoForm.getQuantity} onChange={(e) => setPromoForm({ ...promoForm, getQuantity: Number(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Get Discount % (100=free)</label>
                    <input type="number" min="0" max="100" value={promoForm.getDiscount} onChange={(e) => setPromoForm({ ...promoForm, getDiscount: Number(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date *</label>
                <input type="datetime-local" required value={promoForm.startsAt} onChange={(e) => setPromoForm({ ...promoForm, startsAt: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date *</label>
                <input type="datetime-local" required value={promoForm.endsAt} onChange={(e) => setPromoForm({ ...promoForm, endsAt: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
                <input type="number" value={promoForm.sortOrder} onChange={(e) => setPromoForm({ ...promoForm, sortOrder: Number(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
              </div>
            </div>

            {/* Products in bundle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">Products in Bundle *</label>
                <button type="button" onClick={addPromoItem} className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1">
                  <Plus size={12} /> Add Product
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
                    className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                {promoForm.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select required value={item.productId} onChange={(e) => updatePromoItem(idx, "productId", e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                      <option value="">Select product</option>
                      {filteredProducts.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
                      ))}
                    </select>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => updatePromoItem(idx, "quantity", e.target.value)}
                      className="w-20 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Qty" />
                    <button type="button" onClick={() => removePromoItem(idx)} className="text-red-500 hover:text-red-700 p-1">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="bg-pink-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-pink-700 transition flex items-center gap-2">
              {editingId ? <><Edit2 size={14} /> Update</> : <><Plus size={14} /> Create</>}
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
