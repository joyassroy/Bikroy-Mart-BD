"use client";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">
              Bikroy<span className="text-blue-400">-Mart</span>-BD
            </h3>
            <p className="text-sm text-gray-400 mb-3 leading-5">
              {t.aboutUsDesc}
            </p>
            <div className="flex gap-2">
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-500 transition text-sm font-semibold" aria-label="Facebook">f</a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-500 transition text-sm font-semibold" aria-label="LinkedIn">in</a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-500 transition text-sm font-semibold" aria-label="YouTube">yt</a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">{t.quickLinks}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-blue-400 transition">{t.shop}</Link></li>
              <li><Link href="/about" className="hover:text-blue-400 transition">{t.aboutUs}</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition">{t.contact}</Link></li>
              <li><Link href="/store-locator" className="hover:text-blue-400 transition">{t.storeLocator}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">{t.customerSupport}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/track-order" className="hover:text-blue-400 transition">{t.trackOrder}</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-blue-400 transition">{t.privacyPolicy}</Link></li>
              <li><Link href="/terms" className="hover:text-blue-400 transition">{t.termsOfService}</Link></li>
              <li><Link href="/return-policy" className="hover:text-blue-400 transition">{t.refundPolicy}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">{t.contactInfo}</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">📞 16469 (8am-10pm)</li>
              <li className="flex items-center gap-2">📧 info@bikroymart.com</li>
              <li className="flex items-center gap-2">📍 Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 text-center text-sm text-gray-400">
          © 2026 Bikroy-Mart-BD. {t.allRightsReserved}
        </div>
      </div>
    </footer>
  );
}
