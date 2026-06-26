import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import MiddleBanner from "@/components/home/MiddleBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import TrustBadges from "@/components/home/TrustBadges";
import FlashDeals from "@/components/home/FlashDeals";
import OfferSection from "@/components/home/OfferSection";
import ProductTabs from "@/components/home/ProductTabs";
import SponsorsMarquee from "@/components/home/SponsorsMarquee";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroBanner />
        <MiddleBanner />
        <CategoryGrid />
        <TrustBadges />
        <FlashDeals />
        <OfferSection
          type="STOCK_CLEARANCE"
          title="Stock Clearance Sale"
          subtitle="Huge discounts on excess inventory - grab before it's gone!"
          bgColor="from-[#FF6B6B] to-[#FF4757]"
          badgeColor="bg-[#FF4757]"
        />
        <OfferSection
          type="EXECUTIVE"
          title="Executive Offer"
          subtitle="Premium products at exclusive prices for our valued customers"
          bgColor="from-[#EC008C] to-[#D60071]"
          badgeColor="bg-[#D60071]"
        />
        <OfferSection
          type="COMBO"
          title="Combo Offer"
          subtitle="Buy more together, save more! Bundle deals on popular products"
          bgColor="from-[#00215B] to-[#00AFCC]"
          badgeColor="bg-[#00215B]"
        />
        <OfferSection
          type="BOGO"
          title="Buy One Get One Free"
          subtitle="Buy any product and get the second one at 50% off!"
          bgColor="from-[#00AFCC] to-[#009AB5]"
          badgeColor="bg-[#00AFCC]"
        />
        <ProductTabs />
        <SponsorsMarquee />
      </main>
      <Footer />
    </div>
  );
}
