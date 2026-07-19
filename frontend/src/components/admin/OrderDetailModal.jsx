"use client";
import { X, Printer, MapPin, User, CreditCard, Package, Truck, StickyNote, AlertTriangle, ExternalLink } from "lucide-react";
import { printInvoice } from "@/lib/generateInvoice";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";
import OrderStatusStepper from "./OrderStatusStepper";
import { useLanguage } from "@/i18n/LanguageContext";

export default function OrderDetailModal({ order, onClose }) {
  const { t, language } = useLanguage();
  if (!order) return null;

  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString("en-BD", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="font-semibold text-gray-800">{order.orderNumber}</h2>
            <p className="text-xs text-gray-400">{createdAt}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status Stepper */}
          <OrderStatusStepper orderStatus={order.orderStatus} />

          {/* Payment Badge */}
          <div className="flex items-center gap-2">
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <User size={14} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.customer}</p>
            </div>
            <p className="text-sm font-medium">{order.user?.name}</p>
            <p className="text-sm text-gray-600">{order.user?.phone}</p>
          </div>

          {/* Delivery Address */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.deliveryAddress}</p>
            </div>
            <p className="text-sm">{order.deliveryAddress}</p>
            <p className="text-xs text-gray-500 mt-1">
              {[order.deliveryUpazila, order.deliveryDistrict, order.deliveryDivision].filter(Boolean).join(", ")}
            </p>
          </div>

          {/* Payment */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={14} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.payment}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{order.paymentMethod}</span>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            {order.transactionId && (
              <p className="text-xs text-gray-500 mt-1">TXN: {order.transactionId}</p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{t.total}</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">{t.subtotal}</span><span>৳{order.subtotal}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{t.deliveryFee}</span><span>{order.deliveryCharge > 0 ? `৳${order.deliveryCharge}` : t.free}</span></div>
              {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-600">-৳{order.discount}</span></div>}
              <div className="flex justify-between font-semibold border-t pt-1"><span>{t.total}</span><span>৳{order.total}</span></div>
            </div>
          </div>

          {/* Rider */}
          {order.rider && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Truck size={14} className="text-gray-400" />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rider</p>
              </div>
              <p className="text-sm">{order.rider.user?.name}</p>
            </div>
          )}

          {/* Items */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package size={14} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.items}</p>
            </div>
            <div className="space-y-1.5">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <span>{item.product?.name}</span>
                  <span className="text-gray-500">×{item.quantity}</span>
                  <span className="font-medium">৳{item.totalPrice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Requirement */}
          {order.customRequirement && (
            <div className="bg-amber-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={14} className="text-amber-600" />
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">{t.customRequirement}</p>
              </div>
              <p className="text-sm text-amber-800">{order.customRequirement}</p>
            </div>
          )}

          {/* Cancel Reason */}
          {order.cancelReason && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs font-medium text-red-700 mb-1">Cancel Reason</p>
              <p className="text-sm text-red-800">{order.cancelReason}</p>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <StickyNote size={14} className="text-blue-600" />
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">Notes</p>
              </div>
              <p className="text-sm text-blue-800">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-5 py-3 flex gap-2 rounded-b-xl">
          <button onClick={() => printInvoice(order, language)} className="flex-1 flex items-center justify-center gap-2 bg-[#00215B] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#001A4A] transition cursor-pointer">
            <Printer size={14} /> {language === "bn" ? "ইনভয়েস প্রিন্ট" : t.printInvoice}
          </button>
          <button onClick={() => printInvoice(order, language === "en" ? "bn" : "en")} className="flex items-center justify-center gap-1 bg-white border border-[#E5E7EB] text-gray-700 py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer" title={language === "en" ? "বাংলায় প্রিন্ট" : "Print in English"}>
            {language === "en" ? "বাং" : "EN"}
          </button>
          <button onClick={() => { window.location.href = `/track-order?order=${order.orderNumber}`; }} className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#E5E7EB] text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer">
            <ExternalLink size={14} /> Track Order
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-100 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-pointer">{t.close}</button>
        </div>
      </div>
    </div>
  );
}
