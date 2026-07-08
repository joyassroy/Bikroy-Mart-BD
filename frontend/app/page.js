"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import OfferCarousel from "@/components/home/OfferCarousel";
import CategoryGrid from "@/components/home/CategoryGrid";
import TrustBadges from "@/components/home/TrustBadges";
import FlashDeals from "@/components/home/FlashDeals";
import OfferSection from "@/components/home/OfferSection";
import ProductTabs from "@/components/home/ProductTabs";
import SponsorsMarquee from "@/components/home/SponsorsMarquee";
import FloatingCartButton from "@/components/home/FloatingCartButton";
import FloatingChatButton from "@/components/layout/FloatingChatButton";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <FloatingCartButton />
      <FloatingChatButton />
      <main>
        <HeroBanner />
        <OfferCarousel />
        <CategoryGrid />
        <SponsorsMarquee />
        <TrustBadges />
        <FlashDeals />
        <OfferSection
          type="STOCK_CLEARANCE"
          title={t.stockClearanceSale}
          subtitle={t.stockClearanceDesc}
          bgColor="from-[#FF6B6B] to-[#FF4757]"
          badgeColor="bg-[#FF4757]"
        />
        <OfferSection
          type="EXECUTIVE"
          title={t.executiveOffer}
          subtitle={t.executiveOfferDesc}
          bgColor="from-[#EC008C] to-[#D60071]"
          badgeColor="bg-[#D60071]"
        />
        <OfferSection
          type="COMBO"
          title={t.comboOffer}
          subtitle={t.comboOfferDesc}
          bgColor="from-[#00215B] to-[#00AFCC]"
          badgeColor="bg-[#00215B]"
        />
        <OfferSection
          type="BOGO"
          title={t.bogoOffer}
          subtitle={t.bogoOfferDesc}
          bgColor="from-[#00AFCC] to-[#009AB5]"
          badgeColor="bg-[#00AFCC]"
        />
        <OfferSection
          type="CUSTOM"
          title={t.customOffer}
          subtitle={t.customOfferDesc}
          bgColor="from-[#7C3AED] to-[#6D28D9]"
          badgeColor="bg-[#7C3AED]"
        />
        <ProductTabs />
      </main>
      <Footer />
    </div>
  );
}
