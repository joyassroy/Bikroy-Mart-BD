import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import MiddleBanner from "@/components/home/MiddleBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import TrustBadges from "@/components/home/TrustBadges";
import FlashDeals from "@/components/home/FlashDeals";
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
        <ProductTabs />
        <SponsorsMarquee />
      </main>
      <Footer />
    </div>
  );
}
