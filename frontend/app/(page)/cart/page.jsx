import CartClient from "./CartClient";

export const metadata = {
  title: "Shopping Cart",
  description: "View and manage items in your Bikroymart BD shopping cart.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <CartClient />;
}
