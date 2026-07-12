"use client";
import { Package, CheckCircle, Clock, Truck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const statusSteps = [
  { key: "PENDING", icon: Package, color: "#00215B" },
  { key: "CONFIRMED", icon: CheckCircle, color: "#00AFCC" },
  { key: "PROCESSING", icon: Clock, color: "#F59E0B" },
  { key: "SHIPPED", icon: Truck, color: "#EC008C" },
  { key: "DELIVERED", icon: CheckCircle, color: "#16A34A" },
];

const getStatusIndex = (status) => {
  const map = { PENDING: 0, CONFIRMED: 1, PROCESSING: 2, SHIPPED: 3, OUT_FOR_DELIVERY: 3, DELIVERED: 4 };
  return map[status] ?? -1;
};

export default function OrderStatusStepper({ orderStatus }) {
  const { t } = useLanguage();
  const stepLabels = [t.orderPlaced, t.confirmed, t.packaging, t.onTheWay, t.delivered];
  const currentIdx = getStatusIndex(orderStatus);
  const isCancelled = orderStatus === "CANCELLED";
  const isReturned = orderStatus === "RETURNED";

  if (isCancelled || isReturned) {
    return (
      <div className={`rounded-lg px-3 py-2.5 ${isCancelled ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200"}`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCancelled ? "bg-red-500" : "bg-gray-500"}`}>
            <span className="text-white text-xs font-bold">✕</span>
          </div>
          <div>
            <p className={`text-sm font-semibold ${isCancelled ? "text-red-700" : "text-gray-700"}`}>
              {isCancelled ? t.cancelled : "Returned"}
            </p>
            <p className={`text-[10px] ${isCancelled ? "text-red-500" : "text-gray-500"}`}>
              {isCancelled ? "This order has been cancelled" : "This order has been returned"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex items-start justify-between relative">
        <div className="absolute top-[14px] left-[10%] right-[10%] h-[2px] bg-gray-200 rounded-full" />
        {currentIdx >= 0 && (
          <div
            className="absolute top-[14px] left-[10%] h-[2px] rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, (currentIdx / (statusSteps.length - 1)) * 80)}%`,
              backgroundColor: statusSteps[currentIdx]?.color || "#EC008C",
            }}
          />
        )}

        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentIdx;
          const isCurrent = index === currentIdx;
          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  isCompleted
                    ? "text-white shadow-md"
                    : "bg-gray-100 text-gray-300 border-2 border-gray-200"
                } ${isCurrent ? "scale-110 ring-2 ring-offset-1" : ""}`}
                style={{
                  backgroundColor: isCompleted ? step.color : undefined,
                  ringColor: isCurrent ? step.color + "40" : undefined,
                }}
              >
                {isCompleted && !isCurrent ? (
                  <CheckCircle size={13} />
                ) : (
                  <step.icon size={13} />
                )}
              </div>
              <p className={`text-[8px] sm:text-[9px] font-semibold text-center mt-1.5 leading-tight ${
                isCompleted ? "text-gray-800" : "text-gray-300"
              }`}>
                {stepLabels[index]}
              </p>
              {isCurrent && (
                <span
                  className="mt-0.5 px-1.5 py-px rounded-full text-[7px] font-bold text-white"
                  style={{ backgroundColor: step.color }}
                >
                  Current
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
