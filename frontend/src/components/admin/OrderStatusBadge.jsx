"use client";
import { statusColors, paymentStatusColors } from "@/lib/orderConstants";

export function OrderStatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

export function PaymentStatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${paymentStatusColors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
