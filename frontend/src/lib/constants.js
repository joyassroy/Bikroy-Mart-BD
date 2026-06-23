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
  primary: { 50: "#E8EDF5", 100: "#C5D1E8", 200: "#8FA3D1", 300: "#5975BA", 400: "#2E4B8A", 500: "#00215B", 600: "#001A4A", 700: "#00143A", 800: "#000E2A", 900: "#00081A" },
  cta: { 50: "#FCE8F3", 100: "#F9B0DB", 200: "#F06EB5", 300: "#E85AA0", 400: "#EC008C", 500: "#D60071", 600: "#B8005C", 700: "#9A004D", 800: "#7C003E", 900: "#5E002F" },
  cyan: { 50: "#E8F4F8", 100: "#B3E3ED", 200: "#80D3E0", 300: "#4DC3D3", 400: "#26B3C9", 500: "#00AFCC", 600: "#009AB5", 700: "#00859E", 800: "#007087", 900: "#005B70" },
  navy: "#00215B",
  magenta: "#EC008C",
  charcoal: "#364152",
  slate: "#5A6C91",
  muted: "#667085",
  border: "#E5E7EB",
  surface: "#F4F7FB",
  surfaceLight: "#F9FAFB",
  error: "#FF6B6B",
  errorBg: "#FFF0F0",
};
