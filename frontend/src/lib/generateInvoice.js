import jsPDF from "jspdf";

export function generateInvoicePDF(order) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

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
  const date = order.date || new Date(order.createdAt).toLocaleDateString("en-BD");
  const items = (order.items || []).map((item) => ({
    name: item.name || item.product?.name || "Item",
    quantity: item.quantity,
    price: item.unitPrice || item.price || item.totalPrice / item.quantity,
    totalPrice: item.totalPrice || item.unitPrice * item.quantity,
  }));

  // Header
  doc.setFillColor(0, 33, 91);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Bikroy-Mart-BD", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Your Trusted Online Grocery Store", 14, 26);
  doc.setFontSize(11);
  doc.text("INVOICE", pageWidth - 14, 18, { align: "right" });

  // Order info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const infoY = 45;
  doc.text("Order Number:", 14, infoY);
  doc.text("Date:", 14, infoY + 7);
  doc.text("Payment:", 14, infoY + 14);

  doc.setFont("helvetica", "normal");
  doc.text(orderNumber, 48, infoY);
  doc.text(date, 48, infoY + 7);
  doc.text(paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment", 48, infoY + 14);

  // Shipping address
  doc.setFont("helvetica", "bold");
  doc.text("Ship To:", pageWidth - 80, infoY);
  doc.setFont("helvetica", "normal");
  const addrLines = [customerName, customerPhone, address, [upazila, district, division].filter(Boolean).join(", ")].filter(Boolean);
  addrLines.forEach((line, i) => {
    doc.text(line.length > 40 ? line.substring(0, 40) + "..." : line, pageWidth - 80, infoY + 7 + i * 6);
  });

  // Table header
  const tableTop = 82;
  doc.setFillColor(240, 242, 245);
  doc.rect(14, tableTop, pageWidth - 28, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Item", 18, tableTop + 5.5);
  doc.text("Qty", 120, tableTop + 5.5);
  doc.text("Price", 140, tableTop + 5.5);
  doc.text("Total", pageWidth - 18, tableTop + 5.5, { align: "right" });

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let y = tableTop + 14;
  items.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(14, y - 4, pageWidth - 28, 8, "F");
    }
    const itemName = item.name.length > 35 ? item.name.substring(0, 35) + "..." : item.name;
    doc.text(itemName, 18, y);
    doc.text(String(item.quantity), 122, y);
    doc.text(`৳${item.price}`, 140, y);
    doc.text(`৳${item.totalPrice || item.price * item.quantity}`, pageWidth - 18, y, { align: "right" });
    y += 8;
  });

  // Divider
  y += 4;
  doc.setDrawColor(229, 231, 235);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Summary
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", 130, y);
  doc.text(`৳${subtotal}`, pageWidth - 18, y, { align: "right" });
  y += 8;
  doc.text("Delivery:", 130, y);
  doc.text(deliveryCharge === 0 ? "FREE" : `৳${deliveryCharge}`, pageWidth - 18, y, { align: "right" });
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total:", 130, y);
  doc.text(`৳${total}`, pageWidth - 18, y, { align: "right" });

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(102, 112, 133);
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.text("Thank you for shopping with Bikroy-Mart-BD!", pageWidth / 2, footerY, { align: "center" });
  doc.text("bikroymart.com | For support, contact us via WhatsApp or Messenger", pageWidth / 2, footerY + 5, { align: "center" });

  doc.save(`invoice-${orderNumber}.pdf`);
}
