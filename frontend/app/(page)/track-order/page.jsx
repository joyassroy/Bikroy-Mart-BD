import TrackOrderClient from "./TrackOrderClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bmaart.com";

export const metadata = {
  title: "Live GPS Order Tracking",
  description:
    "Track your Bikroymart BD grocery order in real-time with live GPS rider location map and status updates.",
  alternates: {
    canonical: "/track-order",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Live Order Tracking | Bikroymart BD",
    description:
      "Track your delivery in real-time with live rider map and status updates.",
    url: `${SITE_URL}/track-order`,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Track Order" }],
  },
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
