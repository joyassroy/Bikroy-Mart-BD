import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORY_BANNERS = [
  {
    title: "চাল ও শস্য সেরা মানের",
    subtitle: "Miniket, Nazirshail, Basmati সব এক জায়গায়",
    image: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "category",
    bgColor: "#00215B",
    categorySlug: "rice-grains",
  },
  {
    title: "তাজা ফল ও সবজি",
    subtitle: "খামার থেকে সরাসরি আপনার রান্নাঘরে",
    image: "https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "category",
    bgColor: "#16A34A",
    categorySlug: "fruits-vegetables",
  },
  {
    title: "তাজা মাংস ও মাছ",
    subtitle: "দৈনিক তাজা সরবরাহ — ভরসার নাম",
    image: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "category",
    bgColor: "#DC2626",
    categorySlug: "meat-fish",
  },
  {
    title: "দুধ, দই ও ডিম",
    subtitle: "পুষ্টিময় দুগ্ধজাত ও ডিমের সম্পূর্ণ কালেকশন",
    image: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "category",
    bgColor: "#00AFCC",
    categorySlug: "dairy-eggs",
  },
  {
    title: "পানীয় ও বাভারেজেস",
    subtitle: "চা, কফি, জুস ও সফট ড্রিংকস",
    image: "https://images.pexels.com/photos/1458671/pexels-photo-1458671.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/1458671/pexels-photo-1458671.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "category",
    bgColor: "#7C3AED",
    categorySlug: "drinks-beverages",
  },
  {
    title: "স্ন্যাকস ও চিপস",
    subtitle: "সুস্বাদু স্ন্যাকসের বিশাল কালেকশন",
    image: "https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "category",
    bgColor: "#EA580C",
    categorySlug: "snacks-chips",
  },
  {
    title: "তেল ও ঘি",
    subtitle: "শুদ্ধ সয়াবিন, সরিষা ও পাম তেল",
    image: "https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=600",
    position: "category",
    bgColor: "#CA8A04",
    categorySlug: "oil-ghee",
  },
  {
    title: "মসলা ও মশলা",
    subtitle: "হলুদ, মরিচ, গরম মসলা — সব এক জায়গায়",
    image: "https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "category",
    bgColor: "#B45309",
    categorySlug: "spices-condiments",
  },
  {
    title: "বেকারি ও বিস্কুট",
    subtitle: "তাজা রুটি, বান, কেক ও কুকিজ",
    image: "https://images.pexels.com/photos/1387070/pexels-photo-1387070.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/1387070/pexels-photo-1387070.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "category",
    bgColor: "#9333EA",
    categorySlug: "bakery-biscuits",
  },
  {
    title: "সৌন্দর্য ও স্বাস্থ্য",
    subtitle: "স্কিনকেয়ার, হেয়ারকেয়ার ও মুখের যত্ন",
    image: "https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "category",
    bgColor: "#EC008C",
    categorySlug: "beauty-health",
  },
  {
    title: "বাড়ি পরিষ্কার",
    subtitle: "সব ধরনের পরিষ্কার-পরিচ্ছন্নতার সামগ্রী",
    image: "https://images.pexels.com/photos/4099469/pexels-photo-4099469.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/4099469/pexels-photo-4099469.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "category",
    bgColor: "#0891B2",
    categorySlug: "home-cleaning",
  },
  {
    title: "শিশু যত্ন",
    subtitle: "শিশুদের জন্য সেরা মানের পণ্য",
    image: "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=600",
    position: "category",
    bgColor: "#DB2777",
    categorySlug: "baby-care",
  },
];

const OFFER_BANNERS = [
  {
    title: "কম্বো অফার",
    subtitle: "একসাথে কিনুন, বেশি সাশ্রয় করুন",
    image: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "offer_combo",
    bgColor: "#00215B",
    link: "/shop?offer=COMBO",
  },
  {
    title: "এক্সিকিউটিভ অফার",
    subtitle: "প্রিমিয়াম পণ্যে বিশেষ ছাড়",
    image: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "offer_executive",
    bgColor: "#EC008C",
    link: "/shop?offer=EXECUTIVE",
  },
  {
    title: "স্টক ক্লিয়ারেন্স",
    subtitle: "সীমিত সময়ের জন্য ৪০-৬০% পর্যন্ত ছাড়",
    image: "https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "offer_stock_clearance",
    bgColor: "#FF6B6B",
    link: "/shop?offer=STOCK_CLEARANCE",
  },
  {
    title: "বাই ওয়ান গেট ওয়ান",
    subtitle: "একটি কিনুন, একটি পান ফ্রিতে",
    image: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "offer_bogo",
    bgColor: "#00AFCC",
    link: "/shop?offer=BOGO",
  },
  {
    title: "কাস্টম অফার",
    subtitle: "বিশেষ বান্ডেল ডিল — একসাথে কিনুন, বেশি সাশ্রয় করুন!",
    image: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200",
    mobileImage: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=600",
    position: "offer_custom",
    bgColor: "#7C3AED",
    link: "/shop?offer=CUSTOM",
  },
];

async function main() {
  console.log("🗑️  Deleting old category and offer banners...");
  await prisma.banner.deleteMany({
    where: {
      position: {
        in: ["category", "offer_combo", "offer_executive", "offer_stock_clearance", "offer_bogo", "offer_custom"],
      },
    },
  });

  // Get all categories
  const categories = await prisma.category.findMany();
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    categoryMap[cat.slug] = cat.id;
  }

  console.log("📁 Creating category banners...");
  for (const banner of CATEGORY_BANNERS) {
    const catId = categoryMap[banner.categorySlug];
    if (!catId) {
      console.warn(`⚠️  Category not found: ${banner.categorySlug}`);
      continue;
    }
    await prisma.banner.create({
      data: {
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image,
        mobileImage: banner.mobileImage,
        position: banner.position,
        bgColor: banner.bgColor,
        categoryId: catId,
        sortOrder: CATEGORY_BANNERS.indexOf(banner) + 1,
        isActive: true,
      },
    });
    console.log(`  ✅ ${banner.title} → ${banner.categorySlug}`);
  }

  console.log("🎁 Creating offer banners...");
  for (const banner of OFFER_BANNERS) {
    await prisma.banner.create({
      data: {
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image,
        mobileImage: banner.mobileImage,
        position: banner.position,
        bgColor: banner.bgColor,
        link: banner.link,
        sortOrder: OFFER_BANNERS.indexOf(banner) + 1,
        isActive: true,
      },
    });
    console.log(`  ✅ ${banner.title}`);
  }

  console.log(`\n🎉 Done! Created ${CATEGORY_BANNERS.length} category banners + ${OFFER_BANNERS.length} offer banners`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
