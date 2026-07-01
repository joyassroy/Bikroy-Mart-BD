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

  // Company logo
  const logoBase64 = "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAQHRFWHRTb2Z0d2FyZQBSZWFsRmF2aWNvbkdlbmVyYXRvciAoaHR0cHM6Ly9yZWFsZmF2aWNvbmdlbmVyYXRvci5uZXQpmZlW4QAADstJREFUeF7tWwl0FdUZnpeFpdiNUhUKyXsvAdva1nNsD6uixeXYnrqcIxWsnkNlX0JeWGSXHdkRhLIZUKQiCEf2vYCtCi0U1EhIWEIIWUgC2fPWmblf/3tn3iJJCAkZR07n4/yZN/Nm7p35vvv/9//vGyRYMBVSfSdYMBaWACbDEsBkWAKYDEsAk2EJYDIsAUyGJYDJsAQwGZYAJsMSwGRYApgMSwCTYQlgMiwBTIYlgMmwBDAZlgAmwxLAZFgCmAxLAJNhCWAyLAFMhiWAybAEMBmWACbDEsBkWAKYDJMFUAGmkDGxx7QjhkKW/bhC23ZHvWR+2A+qaH+YwXHYj5zwWXU30MQwTwCV6ParUDZEAZvpNvbHAJ9KqEp7uL4rGw7qqoSs/ScKeh/Np/3aCf7d7hK031cN+143fAGGQK1nNS1MEYCPcs+JBVBW2Gp8x+RiIJPEgFLjuwaDcecK4IEjlfWdGQZ3Q/LIDruqEL/Tp92GgQ5hjgCKCnV23V2r16cCvo24IxGIyD0V1I/akKDGELcqvHfeD9h3lJM3VBoWG00RQJ58G91mS9r80GjczrBl+og/TX+uipHPbmY6IMOxrURrjtXSxB3iNphoGvBHO5ztxroviqCOs+FfuR6cqwLKwE1FOW0r6Rw3WTV9Vi7bQpNzU0OBHyw7GshqBlyWbrJouIvHIpJtzr1jc/kdOWRd+FYEUGk6a7/4GhxLr6HnuhwoE2xIWFcKx/vliN9UCfvWasR97IZ9lw/xewNot5ce+VoMXtyRiQ5HGb6qr4OGwEuWTo99ieaZLI1wXCWxsygZuBQbFoJ7YIQXjTxyGQmbCutstrH4VgRwzryI+Hk5sC/JR8vo5mCvSyii0eR4rwz2jRWI31wtRIjf6UX8bj/2FngEAVK0hPuOAh0oexl2pqS+bmoH9SO53IhKdkNKqaLBQP71X3rsNDJVz3N4NsxzHqaH+is2MBJHvSIhMvjHf1BQWw93BOMFoHTTPi0L8W9mw74wF36/B7bolrCvKYFjXUnIC+I/oqxju0d4wc/2MUTZolBYkIsOR0gUEiHuWGP9n2lhXpgPHVLSUXqsI4LEuj97GeouomGPBPmQTQRALpSUUgmbqxoBPk1Q7dBx8RV4KCR2X3HsFn01HIYLINMDxE/JgHPWZdjnXxVe8MBS2q4sRHzq9ZAXxH1YRZOdO+QF7Q/IiDvAEE+FUtwRCBHWFDciMxehnK6Tq+Df0gLNkqqJ2CpEufziuPKehOKt8ZoXbCM6dkriGkWRIY31ijAlmmA+0Vziuxfr7KoxMF4Aekj7pEw4pl+Cc84V4QX2pXkkAHfn4NhEeEuj7AqRYd8TQNx+WQhg/4cmwG/2u2u2r1Jo8qwFqtZQYbcGSvkcyGVvwl8wG/4Lc+A9NRfeY4uBVTS6349Bi5GVerYT7JU6U26gdF0cVBIDGyXEjK5A9OhKOMeeEQLIanhCTky9UOMe7gSGC7Dwn+fgGJ8J+xsXkDA7W3iBY1Ee4skTbgXHHpoX9pEABxTEH2bCCxbn30FWtCQKbIU2uqVRZSLEyFNbALMo1i+kUb6UbLkEZY0k5g1bMp+tq8UkrZYvCzXz2w13mQc8mFoE56h0JEy8AOe0S0KEhHlXkbgk95bXddrlFqFIiEBe0OFQ5LdcCFlLC/myAk2m/EgRRZq2k/yIGcnjeDkZjeSRFZBo1LMZRPA8/rg++p5Xxl6oY2ifEgKe6yg++suLwyk0+bu8kMaUoTrdKTKi0qw/fKPnpoThAnQY8TUcrq/hHJcJ5xQSYOZlEYqeXl53cqkyFe13aBMyD0Wd9tAkfKhhpWg4yNB1VA2zCZRmTqURTselkW54FFJvCIkygtJQTzowmqiYIJE8lA+RkOmldP0Z+v4s95qTkQ03KQwXwD7kSyQkpSFh9LmQF8RRRgTZpz0L51WsiFIIp82v1tM8scUtJmT7Dm1CbrvHF9GiLM4N86CKek2l4gpKHvxZSyFvp3x+VTOoFF6QRNa/GYpT2kIdS4ROjaUWVDy1rBDXhrSBMogEGEjiDKbzfB4a/ZSlucpFm8pndOwkn4SDGVjg7hJApRtPHHASzuFfItF1VnhBwmSajGdkCS9wLMiFc2k+HKsoTL1z4xt1gYPXBZSWttvjqa+b2wLPeTCUHjdFgpdIPJhPNXdAiSAX+mDQOC7P3w7lEHnMse8hVAuIdaVGZGK3gKEC8JH2QL+TSBh8RnhB4pgM4QWOqRdFWsrngoQlBUhYfg3O1cVwri9FIhfhw+v45bpMGoJMW7ZuELg3qeEEi4Yyj/gvpV5CYBAVgTTSeX7P9OMv/C1PjPqYpCqx5UWbLdlH51DGFThNz/DNNaVuq9Nq6bPxMFQAhW4+8VUS4LXTwgs6UhGkzQUXQ17gXJiHhLdzcV9qseBNJcKvHfkLXU3Zht8H5YBUY9ApdIAHpf05QHNXnlblum6gVUox7km5ih8lXcS9w9PwzKJCbDqvIt2noIDE5FReef1BtE46h9jkUuTRPvOzEMWtR2RQX1QnUAqqvBsF35mxuBk9Z+6scexOYKgAPHgk9j0BZ79TcAw+LbzAMYbmAj0t5dVx148vi5FadXYL2PnHRCy/unAGfGPaA6k2qFvoFvfzibABa/oq9OUFojZwCpWH7ZTj24CZNlwf3hp9V+ehekgr/DCJcvoRlJ6OkhCYGIM2Qy9AVsgLkq/T9Vq+7z7RGsrxe1Bypset+2wkDBVgyBfVSOhzHAmv/AfO/qdDc4F9NNUEB6pFplK0aRIKV/wCcvEj5AEqih7rCoxtCTaHJr+3iRxO3A4qoo7U/PHmZvCIjlD0CRd2oUmb6YUXCSOllKLT9Bxt8h2iT9bj9BXYyGXwg3TsgK3JJ98gDBXAsbxAE+BlzQuclBF1cqVT2h4QD3pjwqOQCzvT56+00M0vIn5kVxRUysfVBUT8SrrFTWS7aT93en1dNhyqPg2rZfBmzEH+zl5g2UtRfqwvsJWI/4j63kZ9f0xbboHiehpsGAwVIKHPvzUBdC+4f8YlQXTe0CcoFBDxhT3prNpWORnKR5EXTCcBFhMJ63Ui9tVyu0rEJOnJg3f7/fDt7EDHq0OH87f9WhPxQ0m0o5Ix3p7I0/xgH7QA499tpn54yNscC7ZWEiEQ62i7nuxd3ZoYTd9iBDr2PR4S4KGDfJwpuPFad5S/+nso6d2hFC2u+2K+VExVKptFOTpfQthAn7dKIoAoqyg9XE3HaIs1JNI7FKpSNaJUMkZEyRtahJpi64ngdyRBpkrGSFBuwtvWNte+W2sTCZdKlbUIU+Sh6jI6/pYE/1vNjIpABgrAAkjo+ymR/zkeOqaKlLKgT2eUvfQIvJ90g/dEd0SutddAWQGQTIRNJqLma2Szv9sgXz8ONl9fVlhAW76Os4hsCe0rV6mYovR1mbauw/TAr+U5qiCWp8ZC0BX6Kie/blE0Iku9IOSZ9N1Mfl7T5v6RME4Aeuaf9z4Ox/wsEdyLn30Uxc/3gPsDEmBHt1te6ufMvES3NlASGQpm0Ih/ixNMuTllK+DLChP0SdmTATYlSjN9smWcuFnasoK4EV4Rz9btTZtmc7VHV2fFal5WA16oo23CwssaTQ/jBOA1QJ+j4tYL/9gFhX/qioqlXeBe0wPeLY9rC2lqhOlg+1cBz0mavUwC8Op1AgnwpkY432fDyTO+Wiv2lWGSyGDUkbGiSUWmdJVIwxhOKvU+3iYEC0xsBnXv6wi8QeeTWIEp0ZCrKAsaTxP++Jo0uLdPFQNAGNNCkhE/ChsmgMzjK934xWnjUPR0N1Qn90LlnO6oXNItTHB99gKR04/iuas5Ste/qA1vnZTQmBxoE/slWyaJXbW/to/+0RT1aOySONz0pVMR1piL8v6reyAnNxPfKUk1aSgZ9oOwAME+1btIALGCQ89b+ERXFD3ZDRVjeqJ0MnnBDMrzn7PVT75urLcklg9Ec3wUcjIGUGhQfFrOrwsQ/AE9MEgjK3/2E1RVB2qQKIgcQB7DuaRr2SAbvKmv1rh/IXDENf6BLWHEWxqGCeAndgp/3wPXyKoG9kLJiK4oG00Z0PjuYM/XT3zIno24RX+BRuDAGG0/KEiEABggRYQNqrDfTwqfM7gZCje6tEU1wSWfehu2zN3UMEwABDxU1XZH0ePdcKNfN5QOeARlw7rD83xU/aST+V/gP5Tw6c8fbrM6jYjzhwai9hqVElrFrA1M/6d91mI5E6tJwHkqFWYdLEfboV8gJrkS0ckeSEmV9NmNKFcF2gzPRA4LNq0YMhkbIgC/zcwne+ECWUHvZ5D51yeR0f8pVK+cCO/CV5Db96co+vO9ZG3EtmrK0/CdPULcaDOzcqsHZWHj4zfTC3SenY0Y1w2xKMfJs7kqIY2uEPv8c8hGVUAaUQIpxY2Ww7Ox+7IHii6e6LPp+a0XhgjQKDBtIOfLDO2STkEaxYnSfhzRXhGp1Pcra5gkVkMrYEsqx5DUAlyHnq8EOQ0Sa260qRXfigAysVFE287TLmgvSaVUwUbubkv2i1dEbCmlEWTy/Wp8P+kiXllboL2zH/w/BLpI4f1a3uW8y9BkAvgpIPSYdxELPnfjswIvin0QMZyv76ukAOdMTwShVZbBQiBilBqQZXzX0WQCGInOnTujS5cu9Z1WJzKKPCihwiSrIoDKBv/CZiwMFkANbyNHNwse5TEl/JuvzWZDVFQUWrVqJfYzMjKQnZ0Nv98vjNcBsbGx4ry0tDTx7j+3nJwcjBs3DnPnzhXfSRIVV4qCw4cPizto+7Yf969Q8ZPlMn68AhHQAliwvGJhVwQMyXlqwmAB6kegKvyCFiczN1d7X4jpgsmylt9zYrmFrgsEhFjcgqRzC54XFIe3wt/n6rmyGF9WMTy8KPxilfu2/g+BsTBdgJvBR+3tIFKMuxnfOQH+32AJYDIsAUyGJYDJsAQwGZYAJsMSwGRYApgMSwCTYQlgMiwBTIYlgMmwBDAZlgAmwxLAZFgCmAxLAJNhCWAyLAFMhiWAybAEMBmWACbDEsBkWAKYDEsAk2EJYDIsAUyGJYDJsAQwGf8DLkrCZ6BFLWQAAAAASUVORK5CYII=";
  doc.addImage(logoBase64, "PNG", margin, 4, 14, 14);

  // Company name
  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Bikroy-Mart-BD", margin + 18, 16);

  // Tagline
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 195, 230);
  doc.text("Your Trusted Online Grocery Store", margin + 18, 23);

  // Contact info
  doc.setFontSize(7.5);
  doc.setTextColor(150, 170, 210);
  doc.text("bikroymart.com  |  info@bikroymart.com  |  16469", margin + 18, 29);

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
