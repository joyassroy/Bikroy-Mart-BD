const STATUS_LABELS = {
  PENDING: { en: "PENDING", bn: "অপেক্ষমান" },
  CONFIRMED: { en: "CONFIRMED", bn: "নিশ্চিত" },
  PROCESSING: { en: "PROCESSING", bn: "প্রক্রিয়াকরণ" },
  SHIPPED: { en: "SHIPPED", bn: "পাঠানো হয়েছে" },
  OUT_FOR_DELIVERY: { en: "OUT FOR DELIVERY", bn: "ডেলিভারি হচ্ছে" },
  DELIVERED: { en: "DELIVERED", bn: "ডেলিভারি সম্পন্ন" },
  CANCELLED: { en: "CANCELLED", bn: "বাতিল" },
  RETURNED: { en: "RETURNED", bn: "ফেরত" },
};

const PAYMENT_STATUS_LABELS = {
  PAID: { en: "PAID", bn: "পরিশোধিত" },
  PENDING: { en: "PENDING", bn: "অপেক্ষমান" },
  FAILED: { en: "FAILED", bn: "ব্যর্থ" },
  REFUNDED: { en: "REFUNDED", bn: "ফেরত দেওয়া হয়েছে" },
};

const PAYMENT_METHOD_LABELS = {
  COD: { en: "COD", bn: "ক্যাশ অন ডেলিভারি" },
  SSLCOMMERZ: { en: "Online Payment", bn: "অনলাইন পেমেন্ট" },
  BKASH: { en: "bKash", bn: "বিকাশ" },
  NAGAD: { en: "Nagad", bn: "নগদ" },
};

function extractOrderData(order, lang = "en") {
  return {
    orderNumber: order.orderNumber || "N/A",
    customerName: order.name || order.user?.name || "N/A",
    customerPhone: order.phone || order.user?.phone || "N/A",
    address: order.address || order.deliveryAddress || "",
    district: order.district || order.deliveryDistrict || "",
    division: order.division || order.deliveryDivision || "",
    upazila: order.upazila || order.deliveryUpazila || "",
    paymentMethod: order.paymentMethod || "COD",
    paymentStatus: order.paymentStatus || "PENDING",
    transactionId: order.transactionId || "",
    orderStatus: order.orderStatus || "CONFIRMED",
    subtotal: order.subtotal ?? order.total - (order.deliveryCharge ?? 0),
    deliveryCharge: order.deliveryCharge ?? 0,
    discount: order.discount || 0,
    total: order.total || 0,
    cancelReason: order.cancelReason || "",
    customRequirement: order.customRequirement || "",
    estimatedDelivery: order.estimatedDelivery || null,
    date: order.date || new Date(order.createdAt).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-BD", { day: "numeric", month: "short", year: "numeric" }),
    items: (order.items || []).map((item, i) => ({
      index: i + 1,
      name: item.name || item.product?.name || "Item",
      quantity: item.quantity,
      price: item.unitPrice || item.price || (item.totalPrice ? item.totalPrice / item.quantity : 0),
      totalPrice: item.totalPrice || (item.unitPrice || item.price || 0) * item.quantity,
    })),
  };
}

const LABELS = {
  bn: {
    tagline: "ডেলিভারির ধরনে বিশ্বস্ত অনলাইন গ্রসারি স্টোর",
    invoiceTitle: "চালান",
    orderDetails: "অর্ডার বিবরণ",
    orderNumber: "অর্ডার নম্বর:",
    orderDate: "তারিখ:",
    payment: "পেমেন্ট:",
    status: "স্ট্যাটাস:",
    shipTo: "পাঠানো হবে",
    name: "নাম:",
    phone: "ফোন:",
    address: "ঠিকানা:",
    upazila: "উপজেলা:",
    district: "জেলা:",
    division: "বিভাগ:",
    itemHeader: "পদার্ততা",
    qtyHeader: "পরিমাণ",
    unitPriceHeader: "একক মূল্য",
    totalHeader: "মোট",
    subtotal: "উপমোট",
    delivery: "ডেলিভারি",
    discount: "ছাড়",
    grandTotal: "মোট",
    cancelReason: "বাতিলের কারণ:",
    thankYou: "বিক্রয়-মার্ট-বিডি দিয়ে কেনাকাটার জন্য ধন্যবাদ!",
    footerNote: "এটি একটি কম্পিউটার-জনিত চালান। স্বাক্ষরের প্রয়োজন নেই।",
    currency: "৳",
    font: "'Noto Sans Bengali','Hind Siliguri','Kalpurush',sans-serif",
    paymentMethod: "পেমেন্ট পদ্ধতি:",
    paymentStatus: "পেমেন্ট স্ট্যাটাস:",
    transactionId: "লেনদেন আইডি:",
    estimatedDelivery: "আনুমানিক ডেলিভারি:",
    companyAddress: "বিক্রয়-মার্ট-বিডি, ঢাকা, বাংলাদেশ",
    contact: "যোগাযোগ: 16469",
    website: "bikroymart.com",
    page: "পৃষ্ঠ",
    of: "এর",
  },
  en: {
    tagline: "Your Trusted Online Grocery Store",
    invoiceTitle: "INVOICE",
    orderDetails: "ORDER DETAILS",
    orderNumber: "Order Number:",
    orderDate: "Order Date:",
    payment: "Payment:",
    status: "Status:",
    shipTo: "SHIP TO",
    name: "Name:",
    phone: "Phone:",
    address: "Address:",
    upazila: "Upazila:",
    district: "District:",
    division: "Division:",
    itemHeader: "Item",
    qtyHeader: "Qty",
    unitPriceHeader: "Unit Price",
    totalHeader: "Total",
    subtotal: "Subtotal",
    delivery: "Delivery",
    discount: "Discount",
    grandTotal: "TOTAL",
    cancelReason: "Cancel Reason:",
    thankYou: "Thank you for shopping with Bikroy-Mart-BD!",
    footerNote: "This is a computer-generated invoice. No signature required.",
    currency: "Tk",
    font: "Inter,system-ui,-apple-system,sans-serif",
    paymentMethod: "Payment Method:",
    paymentStatus: "Payment Status:",
    transactionId: "Transaction ID:",
    estimatedDelivery: "Est. Delivery:",
    companyAddress: "Bikroy-Mart-BD, Dhaka, Bangladesh",
    contact: "Support: 16469",
    website: "bikroymart.com",
    page: "Page",
    of: "of",
  },
};

function getStatusText(status, lang) {
  const info = STATUS_LABELS[status] || STATUS_LABELS.CONFIRMED;
  return lang === "bn" ? info.bn : info.en;
}

function getPaymentMethodText(method, lang = "en") {
  const info = PAYMENT_METHOD_LABELS[method] || PAYMENT_METHOD_LABELS.COD;
  return lang === "bn" ? info.bn : info.en;
}

function getPaymentStatusText(status, lang) {
  const info = PAYMENT_STATUS_LABELS[status] || PAYMENT_STATUS_LABELS.PENDING;
  return lang === "bn" ? info.bn : info.en;
}

function printInvoiceHTML(order, lang) {
  const L = LABELS[lang] || LABELS.en;
  const d = extractOrderData(order, lang);
  const currency = L.currency;

  const trackingUrl = `https://bikroymart.com/track/${d.orderNumber}`;
  const formattedEstDelivery = d.estimatedDelivery
    ? new Date(d.estimatedDelivery).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-BD", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const itemsHTML = d.items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"}">
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:11px;font-family:${L.font}">${item.index}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:11px;font-weight:500;font-family:${L.font}">${item.name}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:11px;text-align:center;font-family:${L.font}">${item.quantity}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:11px;text-align:right;font-family:${L.font}">${currency} ${item.price.toLocaleString()}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:11px;text-align:right;font-weight:700;font-family:${L.font}">${currency} ${item.totalPrice.toLocaleString()}</td>
    </tr>
  `).join("");

  const discountRow = d.discount > 0 ? `
    <tr>
      <td colspan="4" style="padding:6px 10px;text-align:right;color:#6b7280;font-size:11px;font-family:${L.font}">${L.discount}</td>
      <td style="padding:6px 10px;text-align:right;color:#dc2626;font-size:11px;font-weight:600;font-family:${L.font}">-${currency} ${d.discount.toLocaleString()}</td>
    </tr>
  ` : "";

  const cancelReasonHTML = d.cancelReason && d.orderStatus === "CANCELLED" ? `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:8px 12px;margin-top:8px">
      <span style="color:#991b1b;font-size:10px;font-weight:600;font-family:${L.font}">${L.cancelReason} ${d.cancelReason}</span>
    </div>
  ` : "";

  const estDeliveryHTML = formattedEstDelivery ? `
    <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;width:110px;font-family:${L.font}">${L.estimatedDelivery}</td><td style="padding:4px 0;color:#111827;font-size:11px;font-weight:600">${formattedEstDelivery}</td></tr>
  ` : "";

  const transactionIdHTML = d.transactionId ? `
    <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;width:110px;font-family:${L.font}">${L.transactionId}</td><td style="padding:4px 0;color:#111827;font-size:11px;font-weight:500;font-family:${L.font};word-break:break-all">${d.transactionId}</td></tr>
  ` : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoice #${d.orderNumber}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${L.font}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @media print { body { margin: 0; } @page { margin: 8mm; size: A4; } }
</style>
</head>
<body>
<div style="width:100%;max-width:794px;margin:0 auto;background:#fff;padding:0;font-family:${L.font}">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#00215B 0%,#001845 100%);padding:18px 28px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;align-items:center;gap:10px">
        <img src="/favicon.ico" style="width:32px;height:32px;border-radius:8px;background:#fff;padding:3px;box-shadow:0 1px 4px rgba(0,0,0,0.15)" alt="logo" />
        <div>
          <div style="color:#fff;font-size:18px;font-weight:800;letter-spacing:0.3px;line-height:1.1">Bikroy-Mart-BD</div>
          <div style="color:#94b3e0;font-size:9px;margin-top:2px;letter-spacing:0.2px">${L.tagline}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="background:#ec008c;color:#fff;padding:6px 20px;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:1.5px">${L.invoiceTitle}</div>
        <div style="color:#94b3e0;font-size:10px;margin-top:5px">#${d.orderNumber}</div>
      </div>
    </div>
    <div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.15);display:flex;justify-content:space-between;align-items:center">
      <div style="color:#7090c0;font-size:9px;font-family:${L.font}">${L.companyAddress} | ${L.contact} | ${L.website}</div>
      <a href="${trackingUrl}" style="color:#ec008c;font-size:9px;text-decoration:underline;font-family:${L.font}">${L.trackingLink} →</a>
    </div>
  </div>

  <!-- Body -->
  <div style="padding:18px 28px">
    <!-- Info Cards -->
    <div style="display:flex;gap:14px;margin-bottom:16px">
      <!-- Order Details -->
      <div style="flex:1;background:#f4f7fb;border-radius:10px;padding:14px 16px;border:1px solid #e8ecf3">
        <div style="color:#00215B;font-size:10px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.8px;font-family:${L.font}">${L.orderDetails}</div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;width:110px;font-family:${L.font}">${L.orderNumber}</td><td style="padding:4px 0;color:#111827;font-size:11px;font-weight:600">${d.orderNumber}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.orderDate}</td><td style="padding:4px 0;color:#111827;font-size:11px;font-weight:600">${d.date}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.payment}</td><td style="padding:4px 0;color:#111827;font-size:11px;font-weight:600;font-family:${L.font}">${getPaymentMethodText(d.paymentMethod, lang)}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.status}</td><td style="padding:4px 0;color:#111827;font-size:11px;font-weight:600;font-family:${L.font}">${getStatusText(d.orderStatus, lang)}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.paymentStatus}</td><td style="padding:4px 0;color:#111827;font-size:11px;font-weight:600;font-family:${L.font}">${getPaymentStatusText(d.paymentStatus, lang)}</td></tr>
          ${estDeliveryHTML}
          ${transactionIdHTML}
        </table>
      </div>
      <!-- Ship To -->
      <div style="flex:1;background:#f4f7fb;border-radius:10px;padding:14px 16px;border:1px solid #e8ecf3">
        <div style="color:#00215B;font-size:10px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.8px;font-family:${L.font}">${L.shipTo}</div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;width:75px;font-family:${L.font}">${L.name}</td><td style="padding:4px 0;color:#111827;font-size:11px;font-weight:600">${d.customerName}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.phone}</td><td style="padding:4px 0;color:#111827;font-size:11px">${d.customerPhone}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.address}</td><td style="padding:4px 0;color:#111827;font-size:11px">${d.address || "N/A"}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.upazila}</td><td style="padding:4px 0;color:#111827;font-size:11px">${d.upazila || "N/A"}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.district}</td><td style="padding:4px 0;color:#111827;font-size:11px">${d.district || "N/A"}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.division}</td><td style="padding:4px 0;color:#111827;font-size:11px">${d.division || "N/A"}</td></tr>
        </table>
      </div>
    </div>

    <!-- Items Table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;border-radius:10px;overflow:hidden;border:1px solid #e8ecf3">
      <thead>
        <tr style="background:linear-gradient(135deg,#00215B,#003087)">
          <th style="padding:10px;text-align:left;color:#fff;font-size:10px;font-weight:700;width:30px;letter-spacing:0.8px;text-transform:uppercase;font-family:${L.font}">#</th>
          <th style="padding:10px;text-align:left;color:#fff;font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;font-family:${L.font}">${L.itemHeader}</th>
          <th style="padding:10px;text-align:center;color:#fff;font-size:10px;font-weight:700;width:50px;letter-spacing:0.8px;text-transform:uppercase;font-family:${L.font}">${L.qtyHeader}</th>
          <th style="padding:10px;text-align:right;color:#fff;font-size:10px;font-weight:700;width:90px;letter-spacing:0.8px;text-transform:uppercase;font-family:${L.font}">${L.unitPriceHeader}</th>
          <th style="padding:10px;text-align:right;color:#fff;font-size:10px;font-weight:700;width:90px;letter-spacing:0.8px;text-transform:uppercase;font-family:${L.font}">${L.totalHeader}</th>
        </tr>
      </thead>
      <tbody>${itemsHTML}</tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;gap:14px;margin-bottom:16px">
      ${cancelReasonHTML ? `<div style="flex:1">${cancelReasonHTML}</div>` : ""}
      <div style="background:#f4f7fb;border-radius:10px;padding:14px 16px;min-width:250px;border:1px solid #e8ecf3;margin-left:auto">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.subtotal}</td>
            <td style="padding:4px 0;text-align:right;color:#374151;font-size:11px;font-family:${L.font}">${currency} ${d.subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.delivery}</td>
            <td style="padding:4px 0;text-align:right;color:#374151;font-size:11px;font-family:${L.font}">${d.deliveryCharge === 0 ? '<span style="background:#16a34a;color:#fff;padding:1px 8px;border-radius:8px;font-size:10px;font-weight:600">FREE</span>' : `${currency} ${d.deliveryCharge.toLocaleString()}`}</td>
          </tr>
          ${discountRow}
        </table>
        <div style="border-top:2px solid #00215B;margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;align-items:center">
          <span style="color:#00215B;font-size:12px;font-weight:700;font-family:${L.font}">${L.grandTotal}</span>
          <span style="color:#ec008c;font-size:16px;font-weight:800;font-family:${L.font}">${currency} ${d.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:linear-gradient(135deg,#00215B 0%,#001845 100%);padding:12px 28px;text-align:center">
    <div style="color:#fff;font-size:11px;font-weight:600;font-family:${L.font}">${L.thankYou}</div>
    <div style="color:#7090c0;font-size:9px;margin-top:3px">${L.website} | ${L.contact}</div>
    <div style="color:#4a6590;font-size:8.5px;margin-top:2px;font-family:${L.font}">${L.footerNote}</div>
  </div>

</div>
</body>
</html>`;
}

export function printInvoice(order, lang = "en") {
  const html = printInvoiceHTML(order, lang);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => { win.print(); };
}

export function printCustomRequestInvoice(request, lang = "en") {
  const L = lang === "bn"
    ? {
        shopName: "Bikroy-Mart-BD", tagline: "ডেলিভারির ধরনে বিশ্বস্ত অনলাইন গ্রসারি স্টোর",
        invoice: "ইনভয়েস", requestNo: "অনুরোধ নং", date: "তারিখ",
        shipTo: "পাঠানো হবে", name: "নাম:", phone: "ফোন:",
        address: "ঠিকানা:", upazila: "উপজেলা:", district: "জেলা:", division: "বিভাগ:",
        product: "পণ্য", qty: "পরিমাণ", unit: "একক", unitPrice: "একক মূল্য", totalHeader: "মোট",
        subtotal: "উপমোট", delivery: "ডেলিভারি ফি", grandTotal: "মোট",
        paid: "পরিশোধিত", unpaid: "অপরিশোধিত",
        notes: "গ্রাহকের নোট:", managerNotes: "ম্যানেজার নোট:",
        thankYou: "বিক্রয়-মার্ট-বিডি দিয়ে কেনাকাটার জন্য ধন্যবাদ!",
        footerNote: "এটি একটি কম্পিউটার-জনিত চালান। স্বাক্ষরের প্রয়োজন নেই।",
        currency: "৳", companyAddress: "বিক্রয়-মার্ট-বিডি, ঢাকা, বাংলাদেশ",
        contact: "যোগাযোগ: 16469", website: "bikroymart.com",
        font: "'Noto Sans Bengali','Hind Siliguri','Kalpurush',sans-serif",
      }
    : {
        shopName: "Bikroy-Mart-BD", tagline: "Your Trusted Online Grocery Store",
        invoice: "INVOICE", requestNo: "Request No.", date: "Date",
        shipTo: "SHIP TO", name: "Name:", phone: "Phone:",
        address: "Address:", upazila: "Upazila:", district: "District:", division: "Division:",
        product: "Product", qty: "Qty", unit: "Unit", unitPrice: "Unit Price", totalHeader: "Total",
        subtotal: "Subtotal", delivery: "Delivery Fee", grandTotal: "TOTAL",
        paid: "PAID", unpaid: "UNPAID",
        notes: "Customer Notes:", managerNotes: "Manager Notes:",
        thankYou: "Thank you for shopping with Bikroy-Mart-BD!",
        footerNote: "This is a computer-generated invoice. No signature required.",
        currency: "Tk", companyAddress: "Bikroy-Mart-BD, Dhaka, Bangladesh",
        contact: "Support: 16469", website: "bikroymart.com",
        font: "Inter,system-ui,-apple-system,sans-serif",
      };

  const formattedDate = request.createdAt
    ? new Date(request.createdAt).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-BD", { day: "numeric", month: "short", year: "numeric" })
    : "N/A";

  const addressParts = [request.deliveryAddress, request.deliveryUpazila, request.deliveryDistrict, request.deliveryDivision].filter(Boolean);
  const fullAddress = addressParts.join(", ") || "N/A";

  const payLabel = request.paymentStatus === "PAID" ? L.paid : L.unpaid;
  const payColor = request.paymentStatus === "PAID" ? "#10b981" : "#eab308";

  const subtotal = (request.quotedPrice || 0) * (request.quantity || 1);
  const deliveryCharge = request.deliveryCharge || 0;
  const total = request.totalAmount || subtotal + deliveryCharge;

  const trackingUrl = `https://bikroymart.com/track/${request.requestNumber}`;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${L.invoice} - ${request.requestNumber}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${L.font}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @media print { body { margin: 0; } @page { margin: 8mm; size: A4; } }
</style>
</head>
<body>
<div style="width:100%;max-width:794px;margin:0 auto;background:#fff;padding:0;font-family:${L.font}">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#00215B 0%,#001845 100%);padding:18px 28px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;align-items:center;gap:10px">
        <img src="/favicon.ico" style="width:32px;height:32px;border-radius:8px;background:#fff;padding:3px;box-shadow:0 1px 4px rgba(0,0,0,0.15)" alt="logo" />
        <div>
          <div style="color:#fff;font-size:18px;font-weight:800;letter-spacing:0.3px;line-height:1.1">Bikroy-Mart-BD</div>
          <div style="color:#94b3e0;font-size:9px;margin-top:2px;letter-spacing:0.2px">${L.tagline}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="background:#ec008c;color:#fff;padding:6px 20px;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:1.5px">${L.invoice}</div>
        <div style="color:#94b3e0;font-size:10px;margin-top:5px">#${request.requestNumber || "N/A"}</div>
      </div>
    </div>
    <div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.15);display:flex;justify-content:space-between;align-items:center">
      <div style="color:#7090c0;font-size:9px;font-family:${L.font}">${L.companyAddress} | ${L.contact} | ${L.website}</div>
      <a href="${trackingUrl}" style="color:#ec008c;font-size:9px;text-decoration:underline;font-family:${L.font}">Track Order →</a>
    </div>
  </div>

  <!-- Body -->
  <div style="padding:18px 28px">
    <!-- Info Cards -->
    <div style="display:flex;gap:14px;margin-bottom:16px">
      <!-- Order Details -->
      <div style="flex:1;background:#f4f7fb;border-radius:10px;padding:14px 16px;border:1px solid #e8ecf3">
        <div style="color:#00215B;font-size:10px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.8px;font-family:${L.font}">${L.requestNo.replace(":", "")}</div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;width:100px;font-family:${L.font}">${L.requestNo}</td><td style="padding:4px 0;color:#111827;font-size:11px;font-weight:600">${request.requestNumber || "N/A"}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.date}</td><td style="padding:4px 0;color:#111827;font-size:11px;font-weight:600">${formattedDate}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.payment}</td><td style="padding:4px 0;color:#111827;font-size:11px;font-weight:600"><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;color:#fff;background:${payColor};">${payLabel}</span></td></tr>
        </table>
      </div>
      <!-- Ship To -->
      <div style="flex:1;background:#f4f7fb;border-radius:10px;padding:14px 16px;border:1px solid #e8ecf3">
        <div style="color:#00215B;font-size:10px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.8px;font-family:${L.font}">${L.shipTo}</div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;width:75px;font-family:${L.font}">${L.name}</td><td style="padding:4px 0;color:#111827;font-size:11px;font-weight:600">${request.user?.name || "N/A"}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.phone}</td><td style="padding:4px 0;color:#111827;font-size:11px">${request.user?.phone || "N/A"}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.address}</td><td style="padding:4px 0;color:#111827;font-size:11px">${fullAddress}</td></tr>
        </table>
      </div>
    </div>

    <!-- Items Table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;border-radius:10px;overflow:hidden;border:1px solid #e8ecf3">
      <thead>
        <tr style="background:linear-gradient(135deg,#00215B,#003087)">
          <th style="padding:10px;text-align:left;color:#fff;font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;font-family:${L.font}">${L.product}</th>
          <th style="padding:10px;text-align:center;color:#fff;font-size:10px;font-weight:700;width:50px;letter-spacing:0.8px;text-transform:uppercase;font-family:${L.font}">${L.qty}</th>
          <th style="padding:10px;text-align:center;color:#fff;font-size:10px;font-weight:700;width:60px;letter-spacing:0.8px;text-transform:uppercase;font-family:${L.font}">${L.unit}</th>
          <th style="padding:10px;text-align:right;color:#fff;font-size:10px;font-weight:700;width:90px;letter-spacing:0.8px;text-transform:uppercase;font-family:${L.font}">${L.unitPrice}</th>
          <th style="padding:10px;text-align:right;color:#fff;font-size:10px;font-weight:700;width:90px;letter-spacing:0.8px;text-transform:uppercase;font-family:${L.font}">${L.totalHeader}</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#f9fafb">
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:11px;font-weight:500;font-family:${L.font}">${request.productName || "N/A"}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:11px;text-align:center;font-family:${L.font}">${request.quantity || 1}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:11px;text-align:center;font-family:${L.font}">${request.unit || "piece"}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:11px;text-align:right;font-family:${L.font}">${L.currency} ${(request.quotedPrice || 0).toLocaleString()}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:11px;text-align:right;font-weight:700;font-family:${L.font}">${L.currency} ${subtotal.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;gap:14px;margin-bottom:16px">
      <div style="flex:1">
        ${request.customerNotes ? `<div style="background:#f4f7fb;border-radius:10px;padding:14px 16px;border:1px solid #e8ecf3"><div style="color:#00215B;font-size:10px;font-weight:700;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;font-family:${L.font}">${L.notes}</div><p style="font-size:11px;color:#374151;font-family:${L.font}">${request.customerNotes}</p></div>` : ""}
        ${request.managerNotes ? `<div style="background:#fffbeb;border-radius:10px;padding:14px 16px;border:1px solid #fde68a;margin-top:${request.customerNotes ? "10px" : "0"}"><div style="color:#92400e;font-size:10px;font-weight:700;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;font-family:${L.font}">${L.managerNotes}</div><p style="font-size:11px;color:#78350f;font-family:${L.font}">${request.managerNotes}</p></div>` : ""}
      </div>
      <div style="background:#f4f7fb;border-radius:10px;padding:14px 16px;min-width:250px;border:1px solid #e8ecf3">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.subtotal}</td>
            <td style="padding:4px 0;text-align:right;color:#374151;font-size:11px;font-family:${L.font}">${L.currency} ${subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:11px;font-family:${L.font}">${L.delivery}</td>
            <td style="padding:4px 0;text-align:right;color:#374151;font-size:11px;font-family:${L.font}">${deliveryCharge === 0 ? '<span style="background:#16a34a;color:#fff;padding:1px 8px;border-radius:8px;font-size:10px;font-weight:600">FREE</span>' : `${L.currency} ${deliveryCharge.toLocaleString()}`}</td>
          </tr>
        </table>
        <div style="border-top:2px solid #00215B;margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;align-items:center">
          <span style="color:#00215B;font-size:12px;font-weight:700;font-family:${L.font}">${L.grandTotal}</span>
          <span style="color:#ec008c;font-size:16px;font-weight:800;font-family:${L.font}">${L.currency} ${total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:linear-gradient(135deg,#00215B 0%,#001845 100%);padding:12px 28px;text-align:center">
    <div style="color:#fff;font-size:11px;font-weight:600;font-family:${L.font}">${L.thankYou}</div>
    <div style="color:#7090c0;font-size:9px;margin-top:3px">${L.website} | ${L.contact}</div>
    <div style="color:#4a6590;font-size:8.5px;margin-top:2px;font-family:${L.font}">${L.footerNote}</div>
  </div>

</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => { win.print(); };
}
