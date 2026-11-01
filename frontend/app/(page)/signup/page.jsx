import SignupClient from "./SignupClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bmaart.com";

export const metadata = {
  title: "Create an Account",
  description:
    "Join Bikroymart BD today. Enjoy fast 60-minute grocery delivery, live GPS tracking, and exclusive discounts across Bangladesh.",
  alternates: {
    canonical: "/signup",
  },
  openGraph: {
    title: "Create an Account | Bikroymart BD",
    description: "Join Bangladesh's premier online grocery shopping platform.",
    url: `${SITE_URL}/signup`,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Join Bikroymart BD" }],
  },
};

export default function SignupPage() {
  return <SignupClient />;
}
