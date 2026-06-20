import { Providers } from "@/helper/providers";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Inter } from "next/font/google";
import "./globals.css";
import ToasterClient from "./ToasterClient";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Bikroy-Mart-BD - Best Online Grocery Shopping in Bangladesh",
    template: "%s | Bikroy-Mart-BD",
  },
  description: "Bikroy-Mart-BD - Your trusted online grocery store. Fresh products, 60-minute delivery, and the best prices in Bangladesh.",
  keywords: ["grocery", "online shopping", "bangladesh", "Bikroy-Mart", "fresh products", "delivery"],
  openGraph: {
    title: "Bikroy-Mart-BD - Best Online Grocery Shopping in Bangladesh",
    description: "Fresh groceries delivered to your doorstep in 60 minutes.",
    url: "https://bikroymart.com",
    siteName: "Bikroy-Mart-BD",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} antialiased`}>
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
