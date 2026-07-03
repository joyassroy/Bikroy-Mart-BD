"use client";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { Home, Headphones, Search } from "lucide-react";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <main className="max-w-[600px] mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8 sm:p-12">
          <div className="text-7xl sm:text-8xl font-black text-[#EC008C] mb-4 leading-none">
            404
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#00215B] mb-2">
            {t.pageNotFound}
          </h1>
          <p className="text-sm text-[#667085] mb-8 max-w-sm mx-auto">
            {t.pageNotFoundDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#EC008C] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#D60071] transition"
            >
              <Home size={16} />
              {t.goHome}
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#00215B] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#001845] transition"
            >
              <Search size={16} />
              {t.continueShopping || "Continue Shopping"}
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <p className="text-xs text-[#99A0B4] mb-2">{t.needHelp}</p>
            <a
              href="https://wa.me/8801810117100"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0067A0] hover:text-[#00215B] transition"
            >
              <Headphones size={14} />
              {t.contactSupport}
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
