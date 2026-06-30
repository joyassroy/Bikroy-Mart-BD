import jsPDF from "jspdf";

export function generateInvoicePDF(order) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Data extraction
  const orderNumber = order.orderNumber || "N/A";
  const customerName = order.name || order.user?.name || "N/A";
  const customerPhone = order.phone || order.user?.phone || "N/A";
  const address = order.address || order.deliveryAddress || "";
  const district = order.district || order.deliveryDistrict || "";
  const division = order.division || order.deliveryDivision || "";
  const upazila = order.upazila || order.deliveryUpazila || "";
  const paymentMethod = order.paymentMethod || "COD";
  const subtotal = order.subtotal ?? order.total - (order.deliveryCharge ?? 0);
  const deliveryCharge = order.deliveryCharge ?? 0;
  const total = order.total || 0;
  const date = order.date || new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" });
  const items = (order.items || []).map((item, i) => ({
    index: i + 1,
    name: item.name || item.product?.name || "Item",
    quantity: item.quantity,
    price: item.unitPrice || item.price || (item.totalPrice ? item.totalPrice / item.quantity : 0),
    totalPrice: item.totalPrice || (item.unitPrice || item.price || 0) * item.quantity,
  }));

  // ── Colors ──────────────────────────────────────────────────────
  const navy = [0, 33, 91];
  const magenta = [236, 0, 140];
  const green = [22, 163, 74];
  const blue = [0, 172, 204];
  const darkText = [30, 30, 30];
  const mutedText = [102, 112, 133];
  const lightBg = [245, 247, 251];
  const white = [255, 255, 255];
  const border = [220, 225, 235];

  let y = 0;

  // ── HEADER ──────────────────────────────────────────────────────
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 38, "F");

  // Company name
  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Bikroy-Mart-BD", margin, 16);

  // Tagline
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 195, 230);
  doc.text("Your Trusted Online Grocery Store", margin, 23);

  // Contact info
  doc.setFontSize(7.5);
  doc.setTextColor(150, 170, 210);
  doc.text("bikroymart.com  |  info@bikroymart.com  |  16469", margin, 29);

  // INVOICE badge
  doc.setFillColor(...magenta);
  doc.roundedRect(pageWidth - 52, 8, 38, 12, 2, 2, "F");
  doc.setTextColor(...white);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 33, 16.5, { align: "center" });

  // Order number under badge
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 195, 230);
  doc.text(orderNumber, pageWidth - 33, 27, { align: "center" });

  y = 44;

  // ── ORDER INFO + SHIPPING (2 columns) ──────────────────────────
  const colLeft = margin;
  const colRight = pageWidth / 2 + 5;
  const colRightWidth = contentWidth / 2 - 5;

  // Left column - Order Details
  doc.setFillColor(...lightBg);
  doc.roundedRect(colLeft, y, contentWidth / 2 - 5, 48, 2, 2, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navy);
  doc.text("ORDER DETAILS", colLeft + 5, y + 8);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);

  doc.text("Order Number:", colLeft + 5, y + 17);
  doc.setFont("helvetica", "bold");
  doc.text(orderNumber, colLeft + 38, y + 17);

  doc.setFont("helvetica", "normal");
  doc.text("Order Date:", colLeft + 5, y + 24);
  doc.setFont("helvetica", "bold");
  doc.text(date, colLeft + 38, y + 24);

  doc.setFont("helvetica", "normal");
  doc.text("Payment:", colLeft + 5, y + 31);
  // Payment badge
  const isCOD = paymentMethod === "COD" || paymentMethod === "Cash on Delivery";
  const payLabel = isCOD ? "COD" : "PAID";
  const payColor = isCOD ? [245, 158, 11] : green;
  const payLabelWidth = doc.getTextWidth(payLabel) + 8;
  doc.setFillColor(...payColor);
  doc.roundedRect(colLeft + 38, y + 26, payLabelWidth, 5.5, 1.5, 1.5, "F");
  doc.setTextColor(...white);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(payLabel, colLeft + 38 + payLabelWidth / 2, y + 30.2, { align: "center" });

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text("Status:", colLeft + 5, y + 38);
  doc.setFillColor(...green);
  const statusLabel = "CONFIRMED";
  const statusWidth = doc.getTextWidth(statusLabel) + 8;
  doc.roundedRect(colLeft + 38, y + 33.5, statusWidth, 5.5, 1.5, 1.5, "F");
  doc.setTextColor(...white);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(statusLabel, colLeft + 38 + statusWidth / 2, y + 37.7, { align: "center" });

  // Right column - Ship To
  doc.setFillColor(...lightBg);
  doc.roundedRect(colRight, y, colRightWidth, 48, 2, 2, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navy);
  doc.text("SHIP TO", colRight + 5, y + 8);

  const labelX = colRight + 5;
  const valueX = colRight + 30;
  let shipY = y + 16;

  // Name
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("Name:", labelX, shipY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text(customerName, valueX, shipY);

  // Phone
  shipY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("Phone:", labelX, shipY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(customerPhone, valueX, shipY);

  // Address
  shipY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("Address:", labelX, shipY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  const addrLines = doc.splitTextToSize(address || "N/A", colRightWidth - 35);
  doc.text(addrLines[0] || "N/A", valueX, shipY);

  // Upazila
  shipY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("Upazila:", labelX, shipY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(upazila || "N/A", valueX, shipY);

  // District
  shipY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("District:", labelX, shipY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(district || "N/A", valueX, shipY);

  // Division
  shipY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("Division:", labelX, shipY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(division || "N/A", valueX, shipY);

  y += 54;

  // ── ITEMS TABLE ─────────────────────────────────────────────────
  // Table header
  doc.setFillColor(...navy);
  doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");

  doc.setTextColor(...white);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("#", margin + 4, y + 5.5);
  doc.text("Item", margin + 14, y + 5.5);
  doc.text("Qty", margin + 110, y + 5.5);
  doc.text("Unit Price", margin + 130, y + 5.5);
  doc.text("Total", margin + contentWidth - 4, y + 5.5, { align: "right" });

  y += 10;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  items.forEach((item, i) => {
    // Alternating row bg
    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 252);
      doc.rect(margin, y - 3, contentWidth, 8, "F");
    }

    doc.setTextColor(...darkText);
    const itemName = item.name.length > 38 ? item.name.substring(0, 38) + "..." : item.name;
    doc.text(String(item.index), margin + 5, y + 2);
    doc.text(itemName, margin + 14, y + 2);
    doc.text(String(item.quantity), margin + 112, y + 2);
    doc.text(`Tk ${item.price.toLocaleString()}`, margin + 130, y + 2);
    doc.setFont("helvetica", "bold");
    doc.text(`Tk ${item.totalPrice.toLocaleString()}`, margin + contentWidth - 4, y + 2, { align: "right" });
    doc.setFont("helvetica", "normal");

    // Row border
    doc.setDrawColor(...border);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 5, margin + contentWidth, y + 5);

    y += 8;
  });

  y += 4;

  // ── TOTALS ──────────────────────────────────────────────────────
  const totalsX = margin + contentWidth - 75;
  const totalsValX = margin + contentWidth - 4;

  // Totals box
  doc.setFillColor(245, 247, 251);
  doc.roundedRect(totalsX - 5, y - 3, 75, 38, 2, 2, "F");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedText);
  doc.text("Subtotal", totalsX, y + 3);
  doc.setTextColor(...darkText);
  doc.text(`Tk ${subtotal.toLocaleString()}`, totalsValX, y + 3, { align: "right" });

  y += 9;
  doc.setTextColor(...mutedText);
  doc.text("Delivery", totalsX, y + 3);
  if (deliveryCharge === 0) {
    doc.setFillColor(...green);
    doc.roundedRect(totalsValX - 16, y - 0.5, 16, 5, 1.5, 1.5, "F");
    doc.setTextColor(...white);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("FREE", totalsValX - 8, y + 3, { align: "center" });
  } else {
    doc.setTextColor(...darkText);
    doc.setFontSize(8.5);
    doc.text(`Tk ${deliveryCharge.toLocaleString()}`, totalsValX, y + 3, { align: "right" });
  }

  y += 8;
  // Divider line
  doc.setDrawColor(...navy);
  doc.setLineWidth(0.5);
  doc.line(totalsX, y, totalsValX, y);

  y += 5;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navy);
  doc.text("TOTAL", totalsX, y + 3);
  doc.setTextColor(...magenta);
  doc.text(`Tk ${total.toLocaleString()}`, totalsValX, y + 3, { align: "right" });

  // ── FOOTER ──────────────────────────────────────────────────────
  const footerY = pageHeight - 22;

  // Thank you bar
  doc.setFillColor(...navy);
  doc.rect(0, footerY - 8, pageWidth, 28, "F");

  doc.setTextColor(...white);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Thank you for shopping with Bikroy-Mart-BD!", pageWidth / 2, footerY - 1, { align: "center" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 170, 210);
  doc.text("bikroymart.com  |  Support: WhatsApp / Messenger  |  16469", pageWidth / 2, footerY + 6, { align: "center" });

  doc.setFontSize(6.5);
  doc.setTextColor(100, 120, 160);
  doc.text("This is a computer-generated invoice. No signature required.", pageWidth / 2, footerY + 12, { align: "center" });

  // Save
  doc.save(`invoice-${orderNumber}.pdf`);
}
