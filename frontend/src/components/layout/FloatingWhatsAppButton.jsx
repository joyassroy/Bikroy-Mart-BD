"use client";
import { FaWhatsapp } from "react-icons/fa";

export default function FloatingWhatsAppButton() {
  return (
    <a
      href="https://wa.me/8801XXXXXXXXX"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:bg-[#20BD5A] transition-all hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="text-white text-2xl" />
    </a>
  );
}
