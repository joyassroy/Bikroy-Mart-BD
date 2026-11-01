import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AboutSection from "@/components/about/AboutSection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bmaart.com";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Bikroymart BD - Bangladesh's premier online grocery and super store. Discover our mission to deliver farm-fresh goods within 60 minutes with live GPS tracking.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Bikroymart BD",
    description:
      "Discover the story behind Bikroymart BD, our mission to modernize grocery shopping, and our customer-first commitment in Bangladesh.",
    url: `${SITE_URL}/about`,
    siteName: "Bikroymart BD",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "About Bikroymart BD",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Bikroymart BD",
    description:
      "Learn about Bikroymart BD - Bangladesh's next-generation online grocery store.",
    images: ["/og-image.png"],
  },
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
