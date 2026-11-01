import SigninClient from "./SigninClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bmaart.com";

export const metadata = {
  title: "Sign In",
  description:
    "Sign in to your Bikroymart BD account to manage orders, track deliveries, and save favorite grocery items.",
  alternates: {
    canonical: "/signin",
  },
  openGraph: {
    title: "Sign In | Bikroymart BD",
    description: "Access your Bikroymart BD account.",
    url: `${SITE_URL}/signin`,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Sign In to Bikroymart BD" }],
  },
};

export default function SigninPage() {
  return <SigninClient />;
}
