import AccountClient from "./AccountClient";

export const metadata = {
  title: "My Account",
  description: "Manage your profile, delivery addresses, and past orders on Bikroymart BD.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return <AccountClient />;
}
