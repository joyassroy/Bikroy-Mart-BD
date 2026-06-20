"use client";
import { Clock, Shield, Headphones, CreditCard } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function TrustBadges() {
  const { t } = useLanguage();

  const badges = [
    { icon: Clock, title: t.fastDelivery, desc: t.fastDeliveryDesc, color: "text-[#0067A0] bg-blue-50" },
    { icon: Shield, title: t.qualityAssurance, desc: t.qualityAssuranceDesc, color: "text-green-600 bg-green-50" },
    { icon: Headphones, title: t.customerSupport, desc: t.customerSupportDesc, color: "text-purple-600 bg-purple-50" },
    { icon: CreditCard, title: t.securePayment, desc: t.securePaymentDesc, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {badges.map((badge, i) => (
          <div key={i} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition">
            <div className={`${badge.color} p-2 rounded-full flex-shrink-0`}>
              <badge.icon size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">{badge.title}</h3>
              <p className="text-sm text-gray-500">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
