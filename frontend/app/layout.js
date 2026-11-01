import { Providers } from "@/helper/providers";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import ToasterClient from "./ToasterClient";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bmaart.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bikroymart BD - Best Online Grocery Shopping in Bangladesh",
    template: "%s | Bikroymart BD",
  },
  description:
    "Bikroymart BD is Bangladesh's trusted online grocery supermarket. Order fresh vegetables, fruits, fish, meat, dairy & daily bazaar essentials with 60-minute express delivery, live GPS tracking, and best market prices.",
  keywords: [
    "grocery online shopping",
    "online grocery store bangladesh",
    "bikroymart",
    "bikroy mart bd",
    "bmaart",
    "fresh vegetables dhaka",
    "grocery delivery shariatpur",
    "daily bazaar bangladesh",
    "fresh fruits online",
    "halal meat delivery",
    "fast grocery delivery bd",
    "online super shop bangladesh",
  ],
  authors: [{ name: "Bikroymart BD", url: SITE_URL }],
  creator: "Bikroymart BD",
  publisher: "Bikroymart BD",
  category: "Ecommerce, Grocery, Food & Essentials",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Bikroymart BD - Best Online Grocery Shopping in Bangladesh",
    description:
      "Order fresh groceries, vegetables, fish, meat & household essentials with 60-minute express delivery, live GPS tracking, and cash on delivery across Bangladesh.",
    url: SITE_URL,
    siteName: "Bikroymart BD",
    locale: "en_BD",
    alternateLocale: ["bn_BD"],
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bikroymart BD - Best Online Grocery Shopping in Bangladesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bikroymart BD - Best Online Grocery Shopping in Bangladesh",
    description:
      "Fresh groceries and daily essentials delivered to your doorstep in 60 minutes with live GPS tracking.",
    images: ["/og-image.png"],
    creator: "@bikroymartbd",
    site: "@bikroymartbd",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-BD": "/",
      "bn-BD": "/",
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#00215B",
};

export default function RootLayout({ children }) {
  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "Bikroymart BD",
    alternateName: ["Bikroy-Mart", "Bmaart", "Bikroy Mart BD"],
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    image: `${SITE_URL}/og-image.png`,
    description:
      "Next-Gen E-Commerce & Live Tracking Grocery Platform in Bangladesh.",
    telephone: "+8801810117100",
    priceRange: "৳",
    address: {
      "@type": "PostalAddress",
      addressCountry: "BD",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+8801810117100",
      contactType: "customer service",
      areaServed: "BD",
      availableLanguage: ["Bengali", "English"],
    },
    sameAs: [
      "https://facebook.com/bikroymartbd",
      "https://instagram.com/bikroymartbd",
    ],
  };

  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bikroymart BD",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/shop?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body className={`${nunito.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </Providers>
        <ToasterClient />
      </body>
    </html>
  );
}
