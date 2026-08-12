import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AboutSection from "@/components/about/AboutSection";

export const metadata = {
  title: "About Us",
  description: "Learn about Bikroymart BD - Bangladesh's premier online grocery platform. Meet our team and discover our story.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
