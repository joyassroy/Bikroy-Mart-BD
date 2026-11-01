import ShopClient from "./ShopClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bmaart.com";

export const metadata = {
  title: "Shop Online - Fresh Groceries & Daily Essentials",
  description:
    "Browse thousands of fresh groceries, organic vegetables, seasonal fruits, meat, fish, dairy, snacks & household essentials at the best market prices with 60-minute express delivery across Bangladesh.",
  keywords: [
    "online grocery shop",
    "buy groceries online",
    "fresh vegetables bangladesh",
    "daily essentials online",
    "bikroymart shop",
    "bmaart products",
    "grocery super shop",
    "home delivery grocery",
  ],
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop Online - Fresh Groceries & Daily Essentials | Bikroymart BD",
    description:
      "Explore fresh groceries, vegetables, fruits, dairy, and household essentials with 60-minute delivery and best prices in Bangladesh.",
    url: `${SITE_URL}/shop`,
    siteName: "Bikroymart BD",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shop Online at Bikroymart BD",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Online - Fresh Groceries & Daily Essentials | Bikroymart BD",
    description:
      "Order fresh groceries, organic produce & daily essentials online with 60-minute express delivery.",
    images: ["/og-image.png"],
  },
};

export default function ShopPage() {
  return <ShopClient />;
}
