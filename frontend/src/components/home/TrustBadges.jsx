"use client";
import { Clock, Shield, Headphones, CreditCard } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function TrustBadges() {
  const { t } = useLanguage();

  const badges = [
    { icon: Clock, title: t.fastDelivery, desc: t.fastDeliveryDesc, color: "text-[#00AFCC] bg-[#E8F4F8]" },
    { icon: Shield, title: t.qualityAssurance, desc: t.qualityAssuranceDesc, color: "text-[#EC008C] bg-[#FCE8F3]" },
    { icon: Headphones, title: t.customerSupport, desc: t.customerSupportDesc, color: "text-[#00215B] bg-[#E8EDF5]" },
    { icon: CreditCard, title: t.securePayment, desc: t.securePaymentDesc, color: "text-[#EC008C] bg-[#FCE8F3]" },
  ];

  return (
    <section className="max-w-[1200px] mx-auto mt-2 md:mt-4 hidden md:block">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#F1F1F1] bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        {badges.map((badge, i) => (
          <div key={i} className="flex items-center gap-2.5 p-3 lg:p-4">
            <div className={`${badge.color} p-2 md:p-2.5 rounded-full flex-shrink-0`}>
              <badge.icon size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[#181717] text-sm md:text-base leading-tight">{badge.title}</h3>
              <p className="text-xs md:text-sm text-[#667085] leading-tight mt-0.5">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
