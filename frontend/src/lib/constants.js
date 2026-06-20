export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api";

export const DELIVERY_AREAS = [
  { division: "Dhaka", districts: ["Dhaka", "Gazipur", "Narayanganj", "Manikganj"] },
  { division: "Chattogram", districts: ["Chattogram", "Cox's Bazar"] },
  { division: "Sylhet", districts: ["Sylhet"] },
  { division: "Rajshahi", districts: ["Rajshahi", "Bogura"] },
  { division: "Khulna", districts: ["Khulna"] },
  { division: "Barishal", districts: ["Barishal"] },
  { division: "Rangpur", districts: ["Rangpur"] },
  { division: "Mymensingh", districts: ["Mymensingh"] },
];

export const ORDER_STATUSES = [
  { value: "PENDING", label: "Pending", color: "text-yellow-600 bg-yellow-50" },
  { value: "CONFIRMED", label: "Confirmed", color: "text-blue-600 bg-blue-50" },
  { value: "PROCESSING", label: "Processing", color: "text-indigo-600 bg-indigo-50" },
  { value: "SHIPPED", label: "Shipped", color: "text-purple-600 bg-purple-50" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", color: "text-orange-600 bg-orange-50" },
  { value: "DELIVERED", label: "Delivered", color: "text-green-600 bg-green-50" },
  { value: "CANCELLED", label: "Cancelled", color: "text-red-600 bg-red-50" },
];

export const PAYMENT_METHODS = [
  { value: "SSLCOMMERZ", label: "Online Payment" },
  { value: "COD", label: "Cash on Delivery" },
  { value: "BKASH", label: "bKash" },
  { value: "NAGAD", label: "Nagad" },
];

export const COLORS = {
  primary: { 50: "#e6f2fa", 100: "#b3d9ed", 200: "#80c0e0", 300: "#4da7d3", 400: "#2693c9", 500: "#0067A0", 600: "#005090", 700: "#004070", 800: "#003050", 900: "#002030" },
  accent: { 500: "#F59E0B", 600: "#D97706" },
  charcoal: "#323A3E",
  slate: "#516069",
  error: "#C30000",
  errorBg: "#FFEAEA",
  surface: "#F1F4F6",
};
