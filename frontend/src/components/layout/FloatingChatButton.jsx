"use client";
import { useState, useEffect } from "react";
import { FaWhatsapp, FaFacebookMessenger } from "react-icons/fa";
import { MessageCircle, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const WHATSAPP_NUMBER = "8801713678644";
const MESSENGER_LINK = "https://www.facebook.com/bmaartbd";

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const bottomOffset = isMobile ? "bottom-36" : "bottom-6";

  return (
    <div className={`fixed ${bottomOffset} right-4 sm:right-6 z-[90]`}>
      {isOpen && (
        <div className="mb-3 flex flex-col gap-2 items-end animate-in slide-in-from-bottom-2 duration-200">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white rounded-full pl-3 pr-4 py-2 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:scale-105"
            onClick={() => setIsOpen(false)}
          >
            <FaWhatsapp className="text-[#25D366] text-lg" />
            <span className="text-xs font-semibold text-gray-700">WhatsApp</span>
          </a>
          <a
            href={MESSENGER_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white rounded-full pl-3 pr-4 py-2 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:scale-105"
            onClick={() => setIsOpen(false)}
          >
            <FaFacebookMessenger className="text-[#0084FF] text-lg" />
            <span className="text-xs font-semibold text-gray-700">Messenger</span>
          </a>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#00215B] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,33,91,0.4)] hover:bg-[#001A4A] hover:scale-110 transition-all"
        aria-label={t.chatWithUs}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
