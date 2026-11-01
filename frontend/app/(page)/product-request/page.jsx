import ProductRequestClient from "./ProductRequestClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bmaart.com";

export const metadata = {
  title: "Product Request | Order Any Custom Item",
  description:
    "Can't find a grocery item or daily product? Submit a product request on Bikroymart BD and our local team will source and deliver it to your doorstep.",
  alternates: {
    canonical: "/product-request",
  },
  openGraph: {
    title: "Product Request | Bikroymart BD",
    description:
      "Request any custom product or grocery item. Bikroymart BD sources and delivers directly to your door.",
    url: `${SITE_URL}/product-request`,
    siteName: "Bikroymart BD",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Product Request at Bikroymart BD" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Request | Bikroymart BD",
    description: "Request any item not currently in stock.",
    images: ["/og-image.png"],
  },
};

export default function ProductRequestPage() {
  return <ProductRequestClient />;
}
