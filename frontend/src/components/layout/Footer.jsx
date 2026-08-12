"use client";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import { FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#00215B] text-white mt-8 md:mt-0 pb-16 lg:pb-0">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:gap-5 gap-6">
          {/* Brand */}
          <div className="w-full lg:max-w-[280px]">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">
              Bikroy<span className="text-[#EC008C]">-Mart</span>-BD
            </h3>
            <p className="text-xs sm:text-sm text-white/70 mb-3 leading-4 sm:leading-5">
              {t.aboutUsDesc}
            </p>
            <div className="flex gap-2">
              <a href="https://www.facebook.com/bmaartbd" target="_blank" rel="noopener noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#EC008C] transition text-[10px] sm:text-xs font-semibold" aria-label="Facebook">f</a>
              <a href="#" className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#EC008C] transition text-[10px] sm:text-xs font-semibold" aria-label="LinkedIn">in</a>
              <a href="#" className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#EC008C] transition text-[10px] sm:text-xs font-semibold" aria-label="YouTube">yt</a>
              <a href="https://wa.me/8801713678644" target="_blank" rel="noopener noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#EC008C] transition" aria-label="WhatsApp">
                <FaWhatsapp className="text-sm sm:text-base" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:max-w-[150px]">
            <h4 className="text-white font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">{t.quickLinks}</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs">
              <li><Link href="/shop" className="hover:text-[#EC008C] transition">{t.shop}</Link></li>
              <li><Link href="/about" className="hover:text-[#EC008C] transition">{t.aboutUs}</Link></li>
              <li><Link href="/contact" className="hover:text-[#EC008C] transition">{t.contact}</Link></li>
              <li><Link href="/store-locator" className="hover:text-[#EC008C] transition">{t.storeLocator}</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="lg:max-w-[150px]">
            <h4 className="text-white font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">{t.customerSupport}</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs">
              <li><Link href="/track-order" className="hover:text-[#EC008C] transition">{t.trackOrder}</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#EC008C] transition">{t.privacyPolicy}</Link></li>
              <li><Link href="/terms" className="hover:text-[#EC008C] transition">{t.termsOfService}</Link></li>
              <li><Link href="/return-policy" className="hover:text-[#EC008C] transition">{t.refundPolicy}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:max-w-[260px]">
            <h4 className="text-white font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">{t.contactInfo}</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs">
              <li className="flex items-center gap-1.5">📞 01713678644 (10am-9pm)</li>
              <li className="flex items-center gap-1.5">📧 bikroymartbd24@gmail.com</li>
              <li className="flex items-center gap-1.5">📍 Saidpur, Nilphamari, Bangladesh</li>
              <li>
                <a
                  href="https://wa.me/8801713678644"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#EC008C] transition"
                >
                  <FaWhatsapp className="text-sm" /> WhatsApp: 01713678644
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/bmaartbd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#EC008C] transition"
                >
                  Facebook: bmaartbd
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:items-center lg:flex-row gap-1 text-center sm:text-center text-xs sm:text-sm text-white/60">
          <span>© 2026 Bikroy-Mart-BD.</span>
          <span>{t.allRightsReserved}</span>
        </div>
      </div>
    </footer>
  );
}
