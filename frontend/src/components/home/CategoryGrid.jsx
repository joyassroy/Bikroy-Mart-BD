"use client";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CategoryGrid() {
  const { t } = useLanguage();

  const categories = [
    { name: t.food, slug: "food", icon: "🍞" },
    { name: t.fruitsVegetables, slug: "fruits-vegetables", icon: "🥬" },
    { name: t.meatFish, slug: "meat-fish", icon: "🥩" },
    { name: t.dairyEggs, slug: "dairy-eggs", icon: "🥛" },
    { name: t.drinks, slug: "drinks-beverages", icon: "☕" },
    { name: t.snacks, slug: "snacks-frozen", icon: "🍪" },
    { name: t.cooking, slug: "cooking-essentials", icon: "🍳" },
    { name: t.beauty, slug: "beauty-health", icon: "✨" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{t.shop} {t.home === "হোম" ? "শাকসবজি" : "by Category"}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            <span className="text-3xl block mb-2">{cat.icon}</span>
            <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
