import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
    orderStatus: order.orderStatus || "CONFIRMED",
    subtotal: order.subtotal ?? order.total - (order.deliveryCharge ?? 0),
    deliveryCharge: order.deliveryCharge ?? 0,
    discount: order.discount || 0,
    total: order.total || 0,
    cancelReason: order.cancelReason || "",
    date: order.date || new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" }),
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

function buildInvoiceHTML(order, lang) {
  const L = LABELS[lang] || LABELS.en;
  const d = extractOrderData(order);

  const currency = L.currency;

  const itemsHTML = d.items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"}">
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px;font-family:${L.font}">${item.index}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:13px;font-weight:500;font-family:${L.font}">${item.name}</td>
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

  return `
    <div id="invoice-capture" style="width:794px;background:#fff;padding:0;margin:0;font-family:${L.font};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#00215B 0%,#001845 100%);padding:32px 44px;display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:14px">
          <img src="/favicon.ico" style="width:44px;height:44px;border-radius:10px;background:#fff;padding:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15)" alt="logo" />
          <div>
            <div style="color:#fff;font-size:26px;font-weight:800;letter-spacing:0.3px;line-height:1.1">Bikroy-Mart-BD</div>
            <div style="color:#94b3e0;font-size:12px;margin-top:3px;letter-spacing:0.2px">${L.tagline}</div>
            <div style="color:#7090c0;font-size:10.5px;margin-top:3px">bikroymart.com &nbsp;|&nbsp; info@bikroymart.com &nbsp;|&nbsp; 16469</div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="background:#ec008c;color:#fff;padding:8px 28px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:1.5px;box-shadow:0 2px 8px rgba(236,0,140,0.3)">${L.invoiceTitle}</div>
          <div style="color:#94b3e0;font-size:11px;margin-top:8px;letter-spacing:0.3px">#${d.orderNumber}</div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:32px 44px">
        <!-- Info Cards -->
        <div style="display:flex;gap:20px;margin-bottom:28px">
          <div style="flex:1;background:#f4f7fb;border-radius:12px;padding:20px 22px;border:1px solid #e8ecf3">
            <div style="color:#00215B;font-size:13px;font-weight:700;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.8px;font-family:${L.font}">${L.orderDetails}</div>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:5px 0;color:#6b7280;font-size:12.5px;width:110px;font-family:${L.font}">${L.orderNumber}</td><td style="padding:5px 0;color:#111827;font-size:12.5px;font-weight:600">${d.orderNumber}</td></tr>
              <tr><td style="padding:5px 0;color:#6b7280;font-size:12.5px;font-family:${L.font}">${L.orderDate}</td><td style="padding:5px 0;color:#111827;font-size:12.5px;font-weight:600">${d.date}</td></tr>
              <tr><td style="padding:5px 0;color:#6b7280;font-size:12.5px;font-family:${L.font}">${L.payment}</td><td style="padding:5px 0;font-size:12.5px">${getPaymentBadgeHTML(d.paymentMethod)}</td></tr>
              <tr><td style="padding:5px 0;color:#6b7280;font-size:12.5px;font-family:${L.font}">${L.status}</td><td style="padding:5px 0;font-size:12.5px">${getBadgeHTML(d.orderStatus, lang)}</td></tr>
            </table>
          </div>
          <div style="flex:1;background:#f4f7fb;border-radius:12px;padding:20px 22px;border:1px solid #e8ecf3">
            <div style="color:#00215B;font-size:13px;font-weight:700;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.8px;font-family:${L.font}">${L.shipTo}</div>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:5px 0;color:#6b7280;font-size:12.5px;width:85px;font-family:${L.font}">${L.name}</td><td style="padding:5px 0;color:#111827;font-size:12.5px;font-weight:600">${d.customerName}</td></tr>
              <tr><td style="padding:5px 0;color:#6b7280;font-size:12.5px;font-family:${L.font}">${L.phone}</td><td style="padding:5px 0;color:#111827;font-size:12.5px">${d.customerPhone}</td></tr>
              <tr><td style="padding:5px 0;color:#6b7280;font-size:12.5px;font-family:${L.font}">${L.address}</td><td style="padding:5px 0;color:#111827;font-size:12.5px">${d.address || "N/A"}</td></tr>
              <tr><td style="padding:5px 0;color:#6b7280;font-size:12.5px;font-family:${L.font}">${L.upazila}</td><td style="padding:5px 0;color:#111827;font-size:12.5px">${d.upazila || "N/A"}</td></tr>
              <tr><td style="padding:5px 0;color:#6b7280;font-size:12.5px;font-family:${L.font}">${L.district}</td><td style="padding:5px 0;color:#111827;font-size:12.5px">${d.district || "N/A"}</td></tr>
              <tr><td style="padding:5px 0;color:#6b7280;font-size:12.5px;font-family:${L.font}">${L.division}</td><td style="padding:5px 0;color:#111827;font-size:12.5px">${d.division || "N/A"}</td></tr>
            </table>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
          <thead>
            <tr style="background:linear-gradient(135deg,#00215B,#003087)">
              <th style="padding:12px 14px;text-align:left;color:#fff;font-size:11.5px;font-weight:600;width:36px;letter-spacing:0.5px;border-radius:8px 0 0 0;font-family:${L.font}">#</th>
              <th style="padding:12px 14px;text-align:left;color:#fff;font-size:11.5px;font-weight:600;letter-spacing:0.5px;font-family:${L.font}">${L.itemHeader}</th>
              <th style="padding:12px 14px;text-align:center;color:#fff;font-size:11.5px;font-weight:600;width:60px;letter-spacing:0.5px;font-family:${L.font}">${L.qtyHeader}</th>
              <th style="padding:12px 14px;text-align:right;color:#fff;font-size:11.5px;font-weight:600;width:100px;letter-spacing:0.5px;font-family:${L.font}">${L.unitPriceHeader}</th>
              <th style="padding:12px 14px;text-align:right;color:#fff;font-size:11.5px;font-weight:600;width:100px;letter-spacing:0.5px;border-radius:0 8px 0 0;font-family:${L.font}">${L.totalHeader}</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>

        <!-- Totals -->
        <div style="display:flex;justify-content:flex-end">
          <div style="background:#f4f7fb;border-radius:12px;padding:18px 22px;min-width:280px;border:1px solid #e8ecf3">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:13px;font-family:${L.font}">${L.subtotal}</td>
                <td style="padding:6px 0;text-align:right;color:#374151;font-size:13px;font-family:${L.font}">${currency} ${d.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:13px;font-family:${L.font}">${L.delivery}</td>
                <td style="padding:6px 0;text-align:right;color:#374151;font-size:13px;font-family:${L.font}">${d.deliveryCharge === 0 ? '<span style="background:#16a34a;color:#fff;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600">FREE</span>' : `${currency} ${d.deliveryCharge.toLocaleString()}`}</td>
              </tr>
              ${discountRow}
            </table>
            <div style="border-top:2px solid #00215B;margin-top:10px;padding-top:10px;display:flex;justify-content:space-between;align-items:center">
              <span style="color:#00215B;font-size:15px;font-weight:700;font-family:${L.font}">${L.grandTotal}</span>
              <span style="color:#ec008c;font-size:20px;font-weight:800;letter-spacing:0.3px;font-family:${L.font}">${currency} ${d.total.toLocaleString()}</span>
            </div>
            ${cancelReasonHTML}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:linear-gradient(135deg,#00215B 0%,#001845 100%);padding:22px 44px;text-align:center">
        <div style="color:#fff;font-size:13px;font-weight:600;letter-spacing:0.2px;font-family:${L.font}">${L.thankYou}</div>
        <div style="color:#7090c0;font-size:10.5px;margin-top:5px">bikroymart.com &nbsp;|&nbsp; Support: WhatsApp / Messenger &nbsp;|&nbsp; 16469</div>
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
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pageHeight = pdf.internal.pageSize.getHeight();
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = -(pageHeight * (Math.ceil(imgHeight / pageHeight) - Math.ceil(heightLeft / pageHeight)));
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`invoice-${d.orderNumber}.pdf`);
}
