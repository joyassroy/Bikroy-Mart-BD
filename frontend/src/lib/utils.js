import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatPrice = (price) => {
  return new Intl.NumberFormat("bn-BD", { style: "currency", currency: "BDT" }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
};

export const truncate = (str, len = 50) => {
  if (!str) return "";
  return str.length > len ? str.substring(0, len) + "..." : str;
};

export const generateSlug = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};
