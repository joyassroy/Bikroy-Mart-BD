import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { convertToWords } from "./numberToWords";

const STATUS_MAP = {
  PENDING: { en: "PENDING", bn: "অপেক্ষমান", color: [245, 158, 11] },
  CONFIRMED: { en: "CONFIRMED", bn: "নিশ্চিত", color: [0, 172, 204] },
  PROCESSING: { en: "PROCESSING", bn: "প্রক্রিয়াকরণ", color: [99, 102, 241] },
  SHIPPED: { en: "SHIPPED", bn: "পাঠানো হয়েছে", color: [139, 92, 246] },
  OUT_FOR_DELIVERY: { en: "OUT FOR DELIVERY", bn: "ডেলিভারি হচ্ছে", color: [236, 0, 140] },
  DELIVERED: { en: "DELIVERED", bn: "ডেলিভারি সম্পন্ন", color: [22, 163, 74] },
  CANCELLED: { en: "CANCELLED", bn: "বাতিল", color: [220, 38, 38] },
  RETURNED: { en: "RETURNED", bn: "ফেরত", color: [234, 88, 12] },
};

const PAYMENT_STATUS_MAP = {
  PAID: { en: "PAID", bn: "পরিশোধিত", color: [22, 163, 74] },
  PENDING: { en: "PENDING", bn: "অপেক্ষমান", color: [245, 158, 11] },
  FAILED: { en: "FAILED", bn: "ব্যর্থ", color: [220, 38, 38] },
  REFUNDED: { en: "REFUNDED", bn: "ফেরত দেওয়া হয়েছে", color: [139, 92, 246] },
};

function extractOrderData(order) {
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
    date: order.date || new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" }),
    items: (order.items || []).map((item, i) => ({
      index: i + 1,
      name: item.name || item.product?.name || "Item",
      image: item.product?.images?.[0] || item.productImage || null,
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
    paymentInfo: "পেমেন্ট তথ্য",
    paymentMethod: "পেমেন্ট পদ্ধতি:",
    paymentStatus: "পেমেন্ট স্ট্যাটাস:",
    transactionId: "লেনদেন আইডি:",
    estimatedDelivery: "আনুমানিক ডেলিভারি:",
    totalInWords: "মোট কথায়",
    trustBadges: "আমাদের প্রতিশ্রুতি",
    returnPolicy: "রিটার্ন নীতি",
    returnPolicyText: "ডেলিভারির ৩ দিনের মধ্যে পণ্য ফেরত দেওয়া যাবে। সাহায্যের জন্য সাপোর্টে যোগাযোগ করুন।",
    trackingLink: "অর্ডার ট্র্যাক করুন",
    companyAddress: "বিক্রয়-মার্ট-বিডি, ঢাকা, বাংলাদেশ",
    website: "বিক্রয়-মার্ট-বিডি",
    contact: "যোগাযোগ: 16469",
    authProducts: "১০০% প্রামাণিক পণ্য",
    easyReturns: "সহজ রিটার্ন",
    securePayment: "নিরাপদ পেমেন্ট",
    fastDelivery: "দ্রুত ডেলিভারি",
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
    paymentInfo: "PAYMENT INFORMATION",
    paymentMethod: "Payment Method:",
    paymentStatus: "Payment Status:",
    transactionId: "Transaction ID:",
    estimatedDelivery: "Est. Delivery:",
    totalInWords: "Total in Words",
    trustBadges: "OUR PROMISE",
    returnPolicy: "Return Policy",
    returnPolicyText: "Items can be returned within 3 days of delivery. Contact support for assistance.",
    trackingLink: "Track Order",
    companyAddress: "Bikroy-Mart-BD, Dhaka, Bangladesh",
    website: "bikroymart.com",
    contact: "Support: 16469",
    authProducts: "100% Authentic Products",
    easyReturns: "Easy Returns",
    securePayment: "Secure Payment",
    fastDelivery: "Fast Delivery",
    page: "Page",
    of: "of",
  },
};

function getBadgeHTML(status, lang) {
  const info = STATUS_MAP[status] || STATUS_MAP.CONFIRMED;
  const label = lang === "bn" ? info.bn : info.en;
  const [r, g, b] = info.color;
  return `<span style="background:rgb(${r},${g},${b});color:#fff;padding:3px 12px;border-radius:12px;font-size:11px;font-weight:600;letter-spacing:0.3px;display:inline-block">${label}</span>`;
}

function getPaymentBadgeHTML(method) {
  const isCOD = method === "COD" || method === "Cash on Delivery";
  const label = isCOD ? "COD" : "PAID";
  const [r, g, b] = isCOD ? [245, 158, 11] : [22, 163, 74];
  return `<span style="background:rgb(${r},${g},${b});color:#fff;padding:3px 12px;border-radius:12px;font-size:11px;font-weight:600;display:inline-block">${label}</span>`;
}

function getPaymentStatusBadgeHTML(status, lang) {
  const info = PAYMENT_STATUS_MAP[status] || PAYMENT_STATUS_MAP.PENDING;
  const label = lang === "bn" ? info.bn : info.en;
  const [r, g, b] = info.color;
  return `<span style="background:rgb(${r},${g},${b});color:#fff;padding:3px 12px;border-radius:12px;font-size:11px;font-weight:600;letter-spacing:0.3px;display:inline-block">${label}</span>`;
}

function buildInvoiceHTML(order, lang) {
  const L = LABELS[lang] || LABELS.en;
  const d = extractOrderData(order);
  const currency = L.currency;

  const trackingUrl = `https://bikroymart.com/track/${d.orderNumber}`;
  const totalInWords = convertToWords(d.total, lang);
  const formattedEstDelivery = d.estimatedDelivery
    ? new Date(d.estimatedDelivery).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-BD", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const itemsHTML = d.items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"}">
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px;font-family:${L.font}">${item.index}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:13px;font-weight:500;font-family:${L.font}">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;border-radius:8px;overflow:hidden;flex-shrink:0;background:#f3f4f6;display:flex;align-items:center;justify-content:center">
            ${item.image
              ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover" crossorigin="anonymous" />`
              : `<span style="color:#9ca3af;font-size:16px">📦</span>`
            }
          </div>
          <span>${item.name}</span>
        </div>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px;text-align:center;font-family:${L.font}">${item.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px;text-align:right;font-family:${L.font}">${currency} ${item.price.toLocaleString()}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:13px;text-align:right;font-weight:600;font-family:${L.font}">${currency} ${item.totalPrice.toLocaleString()}</td>
    </tr>
  `).join("");

  const discountRow = d.discount > 0 ? `
    <tr>
      <td colspan="4" style="padding:8px 14px;text-align:right;color:#6b7280;font-size:13px;font-family:${L.font}">${L.discount}</td>
      <td style="padding:8px 14px;text-align:right;color:#dc2626;font-size:13px;font-weight:600;font-family:${L.font}">-${currency} ${d.discount.toLocaleString()}</td>
    </tr>
  ` : "";

  const cancelReasonHTML = d.cancelReason && d.orderStatus === "CANCELLED" ? `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin-top:12px">
      <span style="color:#991b1b;font-size:12px;font-weight:600;font-family:${L.font}">${L.cancelReason}</span>
      <span style="color:#991b1b;font-size:12px;margin-left:6px;font-family:${L.font}">${d.cancelReason}</span>
    </div>
  ` : "";

  const estDeliveryHTML = formattedEstDelivery ? `
    <tr><td style="padding:5px 0;color:#6b7280;font-size:12.5px;width:130px;font-family:${L.font}">${L.estimatedDelivery}</td><td style="padding:5px 0;color:#111827;font-size:12.5px;font-weight:600">${formattedEstDelivery}</td></tr>
  ` : "";

  const transactionIdHTML = d.transactionId ? `
    <tr><td style="padding:5px 0;color:#6b7280;font-size:12.5px;width:130px;font-family:${L.font}">${L.transactionId}</td><td style="padding:5px 0;color:#111827;font-size:12.5px;font-weight:500;font-family:${L.font};word-break:break-all">${d.transactionId}</td></tr>
  ` : "";

  return `
    <div id="invoice-capture" style="width:794px;background:#fff;padding:0;margin:0;font-family:${L.font};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#00215B 0%,#001845 100%);padding:28px 40px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center;gap:14px">
            <img src="/favicon.ico" style="width:44px;height:44px;border-radius:10px;background:#fff;padding:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15)" alt="logo" crossorigin="anonymous" />
            <div>
              <div style="color:#fff;font-size:24px;font-weight:800;letter-spacing:0.3px;line-height:1.1">Bikroy-Mart-BD</div>
              <div style="color:#94b3e0;font-size:11px;margin-top:3px;letter-spacing:0.2px">${L.tagline}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="background:#ec008c;color:#fff;padding:8px 28px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:1.5px;box-shadow:0 2px 8px rgba(236,0,140,0.3)">${L.invoiceTitle}</div>
            <div style="color:#94b3e0;font-size:11px;margin-top:8px;letter-spacing:0.3px">#${d.orderNumber}</div>
          </div>
        </div>
        <!-- Company Info Bar -->
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.15);display:flex;justify-content:space-between;align-items:center">
          <div style="color:#7090c0;font-size:10px;font-family:${L.font}">
            ${L.companyAddress} &nbsp;|&nbsp; ${L.contact} &nbsp;|&nbsp; ${L.website}
          </div>
          <a href="${trackingUrl}" style="color:#ec008c;font-size:10px;text-decoration:underline;font-family:${L.font}">${L.trackingLink} →</a>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:28px 40px">
        <!-- Info Cards -->
        <div style="display:flex;gap:20px;margin-bottom:24px">
          <!-- Order Details -->
          <div style="flex:1;background:#f4f7fb;border-radius:12px;padding:20px 22px;border:1px solid #e8ecf3">
            <div style="color:#00215B;font-size:12px;font-weight:700;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.8px;font-family:${L.font}">${L.orderDetails}</div>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:4px 0;color:#6b7280;font-size:12px;width:130px;font-family:${L.font}">${L.orderNumber}</td><td style="padding:4px 0;color:#111827;font-size:12px;font-weight:600">${d.orderNumber}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;font-size:12px;font-family:${L.font}">${L.orderDate}</td><td style="padding:4px 0;color:#111827;font-size:12px;font-weight:600">${d.date}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;font-size:12px;font-family:${L.font}">${L.payment}</td><td style="padding:4px 0;font-size:12px;text-align:center">${getPaymentBadgeHTML(d.paymentMethod)}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;font-size:12px;font-family:${L.font}">${L.status}</td><td style="padding:4px 0;font-size:12px;text-align:center">${getBadgeHTML(d.orderStatus, lang)}</td></tr>
              ${estDeliveryHTML}
            </table>
          </div>
          <!-- Ship To -->
          <div style="flex:1;background:#f4f7fb;border-radius:12px;padding:20px 22px;border:1px solid #e8ecf3">
            <div style="color:#00215B;font-size:12px;font-weight:700;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.8px;font-family:${L.font}">${L.shipTo}</div>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:4px 0;color:#6b7280;font-size:12px;width:85px;font-family:${L.font}">${L.name}</td><td style="padding:4px 0;color:#111827;font-size:12px;font-weight:600">${d.customerName}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;font-size:12px;font-family:${L.font}">${L.phone}</td><td style="padding:4px 0;color:#111827;font-size:12px">${d.customerPhone}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;font-size:12px;font-family:${L.font}">${L.address}</td><td style="padding:4px 0;color:#111827;font-size:12px">${d.address || "N/A"}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;font-size:12px;font-family:${L.font}">${L.upazila}</td><td style="padding:4px 0;color:#111827;font-size:12px">${d.upazila || "N/A"}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;font-size:12px;font-family:${L.font}">${L.district}</td><td style="padding:4px 0;color:#111827;font-size:12px">${d.district || "N/A"}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;font-size:12px;font-family:${L.font}">${L.division}</td><td style="padding:4px 0;color:#111827;font-size:12px">${d.division || "N/A"}</td></tr>
            </table>
          </div>
        </div>

        <!-- Payment Information -->
        <div style="background:#f4f7fb;border-radius:12px;padding:16px 22px;border:1px solid #e8ecf3;margin-bottom:24px">
          <div style="color:#00215B;font-size:12px;font-weight:700;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.8px;font-family:${L.font}">${L.paymentInfo}</div>
          <div style="display:flex;gap:40px">
            <table style="border-collapse:collapse">
              <tr><td style="padding:3px 0;color:#6b7280;font-size:12px;width:120px;font-family:${L.font}">${L.paymentMethod}</td><td style="padding:3px 0;font-size:12px;text-align:center">${getPaymentBadgeHTML(d.paymentMethod)}</td></tr>
            </table>
            <table style="border-collapse:collapse">
              <tr><td style="padding:3px 0;color:#6b7280;font-size:12px;width:120px;font-family:${L.font}">${L.paymentStatus}</td><td style="padding:3px 0;font-size:12px;text-align:center">${getPaymentStatusBadgeHTML(d.paymentStatus, lang)}</td></tr>
            </table>
            ${transactionIdHTML ? `<table style="border-collapse:collapse">${transactionIdHTML}</table>` : ""}
          </div>
        </div>

        <!-- Items Table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
          <thead>
            <tr style="background:linear-gradient(135deg,#00215B,#003087)">
              <th style="padding:11px 14px;text-align:left;color:#fff;font-size:11px;font-weight:600;width:36px;letter-spacing:0.5px;border-radius:8px 0 0 0;font-family:${L.font}">#</th>
              <th style="padding:11px 14px;text-align:left;color:#fff;font-size:11px;font-weight:600;letter-spacing:0.5px;font-family:${L.font}">${L.itemHeader}</th>
              <th style="padding:11px 14px;text-align:center;color:#fff;font-size:11px;font-weight:600;width:60px;letter-spacing:0.5px;font-family:${L.font}">${L.qtyHeader}</th>
              <th style="padding:11px 14px;text-align:right;color:#fff;font-size:11px;font-weight:600;width:100px;letter-spacing:0.5px;font-family:${L.font}">${L.unitPriceHeader}</th>
              <th style="padding:11px 14px;text-align:right;color:#fff;font-size:11px;font-weight:600;width:100px;letter-spacing:0.5px;border-radius:0 8px 0 0;font-family:${L.font}">${L.totalHeader}</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>

        <!-- Totals + Cancel Reason Row -->
        <div style="display:flex;gap:20px;margin-bottom:24px">
          <!-- Total in Words -->
          <div style="flex:1;background:#f4f7fb;border-radius:12px;padding:14px 18px;border:1px solid #e8ecf3;display:flex;flex-direction:column;justify-content:center">
            <div style="color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;font-family:${L.font}">${L.totalInWords}</div>
            <div style="color:#111827;font-size:12.5px;font-weight:500;font-family:${L.font};line-height:1.4">${totalInWords}</div>
            ${cancelReasonHTML}
          </div>

          <!-- Totals -->
          <div style="background:#f4f7fb;border-radius:12px;padding:18px 22px;min-width:280px;border:1px solid #e8ecf3">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:5px 0;color:#6b7280;font-size:12.5px;font-family:${L.font}">${L.subtotal}</td>
                <td style="padding:5px 0;text-align:right;color:#374151;font-size:12.5px;font-family:${L.font}">${currency} ${d.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;color:#6b7280;font-size:12.5px;font-family:${L.font}">${L.delivery}</td>
                <td style="padding:5px 0;text-align:right;color:#374151;font-size:12.5px;font-family:${L.font}">${d.deliveryCharge === 0 ? '<span style="background:#16a34a;color:#fff;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600">FREE</span>' : `${currency} ${d.deliveryCharge.toLocaleString()}`}</td>
              </tr>
              ${discountRow}
            </table>
            <div style="border-top:2px solid #00215B;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;align-items:center">
              <span style="color:#00215B;font-size:14px;font-weight:700;font-family:${L.font}">${L.grandTotal}</span>
              <span style="color:#ec008c;font-size:20px;font-weight:800;letter-spacing:0.3px;font-family:${L.font}">${currency} ${d.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- Trust Badges -->
        <div style="background:linear-gradient(135deg,#f0f7ff 0%,#f4f7fb 100%);border-radius:12px;padding:18px 22px;border:1px solid #e0e8f3;margin-bottom:0">
          <div style="color:#00215B;font-size:12px;font-weight:700;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.8px;font-family:${L.font}">${L.trustBadges}</div>
          <div style="display:flex;gap:24px;margin-bottom:14px">
            <div style="display:flex;align-items:center;gap:6px;font-size:11.5px;color:#374151;font-family:${L.font}">
              <span style="color:#16a34a;font-size:14px">✓</span> ${L.authProducts}
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size:11.5px;color:#374151;font-family:${L.font}">
              <span style="color:#16a34a;font-size:14px">✓</span> ${L.easyReturns}
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size:11.5px;color:#374151;font-family:${L.font}">
              <span style="color:#16a34a;font-size:14px">✓</span> ${L.securePayment}
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size:11.5px;color:#374151;font-family:${L.font}">
              <span style="color:#16a34a;font-size:14px">✓</span> ${L.fastDelivery}
            </div>
          </div>
          <div style="border-top:1px solid #e0e8f3;padding-top:10px">
            <div style="color:#6b7280;font-size:11px;font-family:${L.font}"><strong>${L.returnPolicy}:</strong> ${L.returnPolicyText}</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:linear-gradient(135deg,#00215B 0%,#001845 100%);padding:20px 40px;text-align:center">
        <div style="color:#fff;font-size:13px;font-weight:600;letter-spacing:0.2px;font-family:${L.font}">${L.thankYou}</div>
        <div style="color:#7090c0;font-size:10px;margin-top:5px">${L.website} &nbsp;|&nbsp; ${L.contact} &nbsp;|&nbsp; bikroymart.com</div>
        <div style="color:#4a6590;font-size:9.5px;margin-top:4px;font-family:${L.font}">${L.footerNote}</div>
      </div>
    </div>
  `;
}

export async function generateInvoicePDF(order, lang = "en") {
  const d = extractOrderData(order);
  const L = LABELS[lang] || LABELS.en;

  const html = buildInvoiceHTML(order, lang);

  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1;background:#fff";
  container.innerHTML = html;
  document.body.appendChild(container);

  const el = container.querySelector("#invoice-capture");

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: 794,
    windowWidth: 794,
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const totalPages = Math.ceil(imgHeight / pageHeight);

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = -(pageHeight * (totalPages - Math.ceil(heightLeft / pageHeight)));
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(`${L.page} ${totalPages - Math.ceil(heightLeft / pageHeight) + 1} ${L.of} ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: "center" });

    heightLeft -= pageHeight;
  }

  if (totalPages === 1) {
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(`${L.page} 1 ${L.of} 1`, pageWidth / 2, pageHeight - 5, { align: "center" });
  }

  pdf.save(`invoice-${d.orderNumber}.pdf`);
}
