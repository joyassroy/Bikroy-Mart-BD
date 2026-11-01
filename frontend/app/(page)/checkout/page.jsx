import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Secure Checkout",
  description: "Complete your grocery order securely on Bikroymart BD.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
