import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/bcrypt";

const prisma = new PrismaClient();

const groceryCategories = [
  { name: "Food", nameBn: "খাদ্য", slug: "food", icon: "UtensilsCrossed", sortOrder: 1 },
  { name: "Fruits & Vegetables", nameBn: "ফল ও সবজি", slug: "fruits-vegetables", icon: "Apple", sortOrder: 2 },
  { name: "Meat & Fish", nameBn: "মাংস ও মাছ", slug: "meat-fish", icon: "Beef", sortOrder: 3 },
  { name: "Dairy & Eggs", nameBn: "দুগ্ধ ও ডিম", slug: "dairy-eggs", icon: "Egg", sortOrder: 4 },
  { name: "Drinks & Beverages", nameBn: "পানীয়", slug: "drinks-beverages", icon: "Coffee", sortOrder: 5 },
  { name: "Snacks & Frozen", nameBn: "স্ন্যাকস ও ফ্রোজেন", slug: "snacks-frozen", icon: "Cookie", sortOrder: 6 },
  { name: "Cooking Essentials", nameBn: "রান্নার উপকরণ", slug: "cooking-essentials", icon: "ChefHat", sortOrder: 7 },
  { name: "Bakery & Biscuits", nameBn: "বেকারি ও বিস্কুট", slug: "bakery-biscuits", icon: "Cake", sortOrder: 8 },
  { name: "Beauty & Health", nameBn: "সৌন্দর্য ও স্বাস্থ্য", slug: "beauty-health", icon: "Sparkles", sortOrder: 9 },
  { name: "Home Cleaning", nameBn: "বাড়ি পরিষ্কার", slug: "home-cleaning", icon: "SprayCan", sortOrder: 10 },
  { name: "Baby Care", nameBn: "শিশু যত্ন", slug: "baby-care", icon: "Baby", sortOrder: 11 },
  { name: "Pet Care", nameBn: "পোষা প্রাণী", slug: "pet-care", icon: "PawPrint", sortOrder: 12 },
];

const subcategoryData: Record<string, { name: string; nameBn: string; slug: string }[]> = {
  food: [
    { name: "Rice", nameBn: "চাল", slug: "rice" },
    { name: "Dal & Lentils", nameBn: "ডাল", slug: "dal-lentils" },
    { name: "Oil & Ghee", nameBn: "তেল ও ঘি", slug: "oil-ghee" },
    { name: "Spices", nameBn: "মসলা", slug: "spices" },
    { name: "Salt & Sugar", nameBn: "লবণ ও চিনি", slug: "salt-sugar" },
  ],
  "fruits-vegetables": [
    { name: "Fresh Fruits", nameBn: "তাজা ফল", slug: "fresh-fruits" },
    { name: "Fresh Vegetables", nameBn: "তাজা সবজি", slug: "fresh-vegetables" },
    { name: "Dry Fruits", nameBn: "শুকনো ফল", slug: "dry-fruits" },
  ],
  "meat-fish": [
    { name: "Beef", nameBn: "গরুর মাংস", slug: "beef" },
    { name: "Chicken", nameBn: "মুরগির মাংস", slug: "chicken" },
    { name: "Mutton", nameBn: "খসির মাংস", slug: "mutton" },
    { name: "Fish", nameBn: "মাছ", slug: "fish" },
  ],
  "dairy-eggs": [
    { name: "Milk", nameBn: "দুধ", slug: "milk" },
    { name: "Yogurt & Laban", nameBn: "দই ও লাবান", slug: "yogurt-laban" },
    { name: "Cheese & Butter", nameBn: "পনির ও মাখন", slug: "cheese-butter" },
    { name: "Eggs", nameBn: "ডিম", slug: "eggs" },
  ],
  "drinks-beverages": [
    { name: "Tea", nameBn: "চা", slug: "tea" },
    { name: "Coffee", nameBn: "কফি", slug: "coffee" },
    { name: "Juice", nameBn: "জুস", slug: "juice" },
    { name: "Soft Drinks", nameBn: "সফট ড্রিংকস", slug: "soft-drinks" },
    { name: "Water", nameBn: "পানি", slug: "water" },
  ],
  "snacks-frozen": [
    { name: "Biscuits", nameBn: "বিস্কুট", slug: "biscuits" },
    { name: "Chips & Noodles", nameBn: "চিপস ও নুডলস", slug: "chips-noodles" },
    { name: "Frozen Food", nameBn: "ফ্রোজেন ফুড", slug: "frozen-food" },
    { name: "Cakes & Pastries", nameBn: "কেক ও পেস্ট্রি", slug: "cakes-pastries" },
  ],
  "cooking-essentials": [
    { name: "Flour & Atta", nameBn: "আটা ও ময়দা", slug: "flour-atta" },
    { name: "Sauces & Pickles", nameBn: "সস ও আচার", slug: "sauces-pickles" },
    { name: "Condiments", nameBn: "মশলা", slug: "condiments" },
  ],
  "bakery-biscuits": [
    { name: "Bread", nameBn: "রুটি", slug: "bread" },
    { name: "Cakes", nameBn: "কেক", slug: "cakes" },
    { name: "Biscuits", nameBn: "বিস্কুট", slug: "bakery-biscuits" },
  ],
  "beauty-health": [
    { name: "Skincare", nameBn: "স্কিনকেয়ার", slug: "skincare" },
    { name: "Haircare", nameBn: "হেয়ারকেয়ার", slug: "haircare" },
    { name: "Oral Care", nameBn: "মুখের যত্ন", slug: "oral-care" },
    { name: "Body Wash", nameBn: "বডি ওয়াশ", slug: "body-wash" },
  ],
  "home-cleaning": [
    { name: "Dishwash", nameBn: "বাসন ধোনো", slug: "dishwash" },
    { name: "Laundry", nameBn: "কাপড় ধোনো", slug: "laundry" },
    { name: "Floor Cleaners", nameBn: "মেঝে পরিষ্কার", slug: "floor-cleaners" },
  ],
  "baby-care": [
    { name: "Baby Food", nameBn: "শিশুর খাদ্য", slug: "baby-food" },
    { name: "Diapers", nameBn: "ডায়াপার", slug: "diapers" },
    { name: "Baby Bath", nameBn: "শিশুর গোসল", slug: "baby-bath" },
  ],
  "pet-care": [
    { name: "Cat Food", nameBn: "বিড়াল খাবার", slug: "cat-food" },
    { name: "Dog Food", nameBn: "কুকুর খাবার", slug: "dog-food" },
  ],
};

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await hashPassword("admin123");
  const admin = await prisma.user.upsert({
    where: { email: "admin@bikroymart.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@bikroymart.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  // Create categories
  for (const cat of groceryCategories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, nameBn: cat.nameBn, icon: cat.icon, sortOrder: cat.sortOrder },
      create: cat,
    });
    console.log("Category:", category.name);

    // Create subcategories
    const subs = subcategoryData[cat.slug] || [];
    for (const sub of subs) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, nameBn: sub.nameBn, categoryId: category.id },
        create: { ...sub, categoryId: category.id },
      });
    }
  }

  // Create sample banners
  await prisma.banner.createMany({
    data: [
      { title: "Welcome to Bikroy-Mart-BD", image: "/images/banner1.jpg", position: "hero", sortOrder: 1 },
      { title: "Fresh Vegetables Daily", image: "/images/banner2.jpg", position: "hero", sortOrder: 2 },
      { title: "60 Minutes Delivery", image: "/images/banner3.jpg", position: "center", sortOrder: 1 },
    ],
    skipDuplicates: true,
  });

  // Create sample coupons
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      minPurchase: 500,
      maxDiscount: 200,
      expiresAt: new Date("2026-12-31"),
    },
  });

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
