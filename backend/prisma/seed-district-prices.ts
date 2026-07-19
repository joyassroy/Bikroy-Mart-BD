import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/bcrypt";

const prisma = new PrismaClient();

// Bangladesh has 64 districts (zilas) across 8 divisions
// We'll seed test data for a sample of real districts

const districts = [
  // Dhaka Division
  "Dhaka", "Gazipur", "Narayanganj", "Tangail", "Faridpur",
  // Chattogram Division
  "Chattogram", "Cumilla", "Cox's Bazar", "Feni", "Noakhali",
  // Rajshahi Division
  "Rajshahi", "Bogra", "Natore", "Pabna",
  // Khulna Division
  "Khulna", "Jashore", "Kushtia", "Satkhira",
  // Barishal Division
  "Barisal", "Bhola", "Patuakhali",
  // Sylhet Division
  "Sylhet", "Habiganj", "Maulvibazar", "Sunamganj",
  // Rangpur Division
  "Rangpur", "Dinajpur", "Kurigram", "Gaibandha",
  // Mymensingh Division
  "Mymensingh", "Jamalpur", "Netrakona",
];

// District-specific price overrides (using real district names)
const districtPriceOverrides: Record<string, Record<string, { price: number; discountPrice?: number }>> = {
  // Dhaka - competitive urban pricing (lower)
  Dhaka: {
    "miniket-rice-5kg": { price: 285, discountPrice: 265 },
    "broiler-chicken-whole-1kg": { price: 170, discountPrice: 155 },
    "farm-fresh-eggs-12": { price: 135, discountPrice: 125 },
    "teer-soybean-oil-5l": { price: 720, discountPrice: 699 },
    "aarong-full-cream-milk-1l": { price: 88, discountPrice: 82 },
    "apple-royal-gala-1kg": { price: 230, discountPrice: 200 },
  },
  // Gazipur - near Dhaka, similar pricing
  Gazipur: {
    "miniket-rice-5kg": { price: 290, discountPrice: 270 },
    "broiler-chicken-whole-1kg": { price: 172, discountPrice: 158 },
    "farm-fresh-eggs-12": { price: 138, discountPrice: 128 },
    "teer-soybean-oil-5l": { price: 725, discountPrice: 705 },
  },
  // Narayanganj - industrial area
  Narayanganj: {
    "miniket-rice-5kg": { price: 288, discountPrice: 268 },
    "broiler-chicken-whole-1kg": { price: 168, discountPrice: 152 },
    "farm-fresh-eggs-12": { price: 132, discountPrice: 122 },
  },
  // Chattogram - port city, slightly higher
  Chattogram: {
    "miniket-rice-5kg": { price: 330, discountPrice: 310 },
    "broiler-chicken-whole-1kg": { price: 195, discountPrice: 180 },
    "farm-fresh-eggs-12": { price: 155, discountPrice: 145 },
    "teer-soybean-oil-5l": { price: 800, discountPrice: 765 },
    "hilsa-fish-1kg": { price: 1050, discountPrice: 980 },
  },
  // Cox's Bazar - tourist area, higher
  "Cox's Bazar": {
    "miniket-rice-5kg": { price: 340, discountPrice: 320 },
    "broiler-chicken-whole-1kg": { price: 200, discountPrice: 185 },
    "hilsa-fish-1kg": { price: 1100, discountPrice: 1020 },
  },
  // Cumilla - mid-range
  Cumilla: {
    "miniket-rice-5kg": { price: 315, discountPrice: 295 },
    "broiler-chicken-whole-1kg": { price: 185, discountPrice: 170 },
    "farm-fresh-eggs-12": { price: 148, discountPrice: 138 },
  },
  // Rajshahi - agricultural, lower fruit/veg
  Rajshahi: {
    "miniket-rice-5kg": { price: 300, discountPrice: 280 },
    "fresh-banana-dozen": { price: 65, discountPrice: 55 },
    "fresh-tomato-500g": { price: 35, discountPrice: 30 },
    "broiler-chicken-whole-1kg": { price: 175, discountPrice: 160 },
    "teer-soybean-oil-5l": { price: 760, discountPrice: 730 },
  },
  // Bogra - division HQ
  Bogra: {
    "miniket-rice-5kg": { price: 305, discountPrice: 285 },
    "broiler-chicken-whole-1kg": { price: 178, discountPrice: 162 },
  },
  // Sylhet - tea region
  Sylhet: {
    "ispahani-mirzapore-tea-200g": { price: 130, discountPrice: 120 },
    "miniket-rice-5kg": { price: 310, discountPrice: 290 },
    "broiler-chicken-whole-1kg": { price: 180, discountPrice: 165 },
    "farm-fresh-eggs-12": { price: 145, discountPrice: 135 },
    "aarong-full-cream-milk-1l": { price: 92, discountPrice: 85 },
  },
  // Khulna - higher transport costs
  Khulna: {
    "miniket-rice-5kg": { price: 340, discountPrice: 315 },
    "broiler-chicken-whole-1kg": { price: 200, discountPrice: 185 },
    "farm-fresh-eggs-12": { price: 160, discountPrice: 148 },
    "teer-soybean-oil-5l": { price: 810, discountPrice: 775 },
    "hilsa-fish-1kg": { price: 1150, discountPrice: 1050 },
  },
  // Jashore - near India border
  Jashore: {
    "miniket-rice-5kg": { price: 310, discountPrice: 290 },
    "broiler-chicken-whole-1kg": { price: 182, discountPrice: 168 },
  },
  // Barisal - river delta
  Barisal: {
    "miniket-rice-5kg": { price: 325, discountPrice: 305 },
    "broiler-chicken-whole-1kg": { price: 190, discountPrice: 175 },
    "hilsa-fish-1kg": { price: 1080, discountPrice: 1000 },
  },
  // Rangpur - northern
  Rangpur: {
    "miniket-rice-5kg": { price: 295, discountPrice: 275 },
    "broiler-chicken-whole-1kg": { price: 172, discountPrice: 158 },
    "teer-soybean-oil-5l": { price: 745, discountPrice: 720 },
  },
  // Mymensingh
  Mymensingh: {
    "miniket-rice-5kg": { price: 305, discountPrice: 285 },
    "broiler-chicken-whole-1kg": { price: 178, discountPrice: 162 },
  },
  // Feni - Chittagong Division, mid-range
  Feni: {
    "miniket-rice-5kg": { price: 320, discountPrice: 300 },
    "broiler-chicken-whole-1kg": { price: 188, discountPrice: 173 },
    "farm-fresh-eggs-12": { price: 150, discountPrice: 140 },
    "teer-soybean-oil-5l": { price: 780, discountPrice: 750 },
  },
};

// Test users for different real districts
const testUsers = [
  // Customers in different districts
  { name: "Rahim Uddin", email: "rahim@dhaka.com", phone: "01812345678", district: "Dhaka", role: "CUSTOMER" as const },
  { name: "Karim Mia", email: "karim@chattogram.com", phone: "01823456789", district: "Chattogram", role: "CUSTOMER" as const },
  { name: "Jamal Hossain", email: "jamal@rajshahi.com", phone: "01834567890", district: "Rajshahi", role: "CUSTOMER" as const },
  { name: "Sohel Rana", email: "sohel@sylhet.com", phone: "01845678901", district: "Sylhet", role: "CUSTOMER" as const },
  { name: "Babul Sheikh", email: "babul@khulna.com", phone: "01856789012", district: "Khulna", role: "CUSTOMER" as const },
  { name: "Nargis Akter", email: "nargis@gazipur.com", phone: "01867890123", district: "Gazipur", role: "CUSTOMER" as const },
  { name: "Habib Rahman", email: "habib@rangpur.com", phone: "01878901234", district: "Rangpur", role: "CUSTOMER" as const },
  { name: "Sumaiya Khatun", email: "sumaiya@barisal.com", phone: "01889012345", district: "Barisal", role: "CUSTOMER" as const },
  { name: "Faruk Ahmed", email: "faruk@coxsbazar.com", phone: "01890123456", district: "Cox's Bazar", role: "CUSTOMER" as const },
  // Managers
  { name: "Dhaka Manager", email: "manager.dhaka@test.com", phone: "01911111111", district: "Dhaka", role: "MANAGER" as const },
  { name: "Chattogram Manager", email: "manager.ctg@test.com", phone: "01922222222", district: "Chattogram", role: "MANAGER" as const },
  { name: "Rajshahi Manager", email: "manager.raj@test.com", phone: "01933333333", district: "Rajshahi", role: "MANAGER" as const },
  { name: "Gazipur Manager", email: "manager.gazipur@test.com", phone: "01966666666", district: "Gazipur", role: "MANAGER" as const },
  { name: "Feni Manager", email: "manager.feni@test.com", phone: "01988888888", district: "Feni", role: "MANAGER" as const },
  // Riders
  { name: "Dhaka Rider", email: "rider.dhaka@test.com", phone: "01944444444", district: "Dhaka", role: "RIDER" as const },
  { name: "Chattogram Rider", email: "rider.ctg@test.com", phone: "01955555555", district: "Chattogram", role: "RIDER" as const },
  { name: "Gazipur Rider", email: "rider.gazipur@test.com", phone: "01977777777", district: "Gazipur", role: "RIDER" as const },
  { name: "Feni Rider", email: "rider.feni@test.com", phone: "01999999999", district: "Feni", role: "RIDER" as const },
];

// District coordinates (approximate centers)
const districtCoords: Record<string, { lat: number; lng: number }> = {
  "Dhaka": { lat: 23.8103, lng: 90.4125 },
  "Gazipur": { lat: 23.9999, lng: 90.4200 },
  "Narayanganj": { lat: 23.6349, lng: 90.5000 },
  "Chattogram": { lat: 22.3569, lng: 91.7832 },
  "Cox's Bazar": { lat: 21.4272, lng: 92.0058 },
  "Cumilla": { lat: 23.4607, lng: 91.1809 },
  "Rajshahi": { lat: 24.3636, lng: 88.6241 },
  "Bogra": { lat: 24.8510, lng: 89.3711 },
  "Sylhet": { lat: 24.8949, lng: 91.8687 },
  "Khulna": { lat: 22.8456, lng: 89.5403 },
  "Jashore": { lat: 23.1662, lng: 89.2082 },
  "Barisal": { lat: 22.7010, lng: 90.3535 },
  "Rangpur": { lat: 25.7460, lng: 89.2500 },
  "Mymensingh": { lat: 24.7471, lng: 90.4203 },
  "Feni": { lat: 23.0155, lng: 91.3977 },
};

async function main() {
  console.log("🌱 Seeding district prices and test users...\n");

  const password = await hashPassword("test123");

  // Create test users
  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { district: userData.district },
      create: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password,
        role: userData.role,
        district: userData.district,
      },
    });

    if (userData.role === "MANAGER") {
      await prisma.managerProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          assignedZila: userData.district,
          assignedDistrict: userData.district,
        },
      });
    } else if (userData.role === "RIDER") {
      const coords = districtCoords[userData.district] || { lat: 23.8103, lng: 90.4125 };
      await prisma.riderProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          assignedZila: userData.district,
          vehicleType: "Motorcycle",
          licenseNumber: `BD-RIDER-${userData.district.slice(0, 3).toUpperCase()}`,
          isAvailable: true,
          currentLat: coords.lat,
          currentLng: coords.lng,
        },
      });
    }

    console.log(`✅ ${userData.role}: ${userData.name} (${userData.district}) - ${userData.email}`);
  }

  console.log("\n📦 Setting district prices...\n");

  // Set district prices
  for (const [district, products] of Object.entries(districtPriceOverrides)) {
    console.log(`\n📍 ${district}:`);
    for (const [slug, pricing] of Object.entries(products)) {
      const product = await prisma.product.findUnique({ where: { slug } });
      if (!product) {
        console.log(`  ⚠️  Product not found: ${slug}`);
        continue;
      }

      await prisma.districtPrice.upsert({
        where: { productId_district: { productId: product.id, district } },
        update: { price: pricing.price, discountPrice: pricing.discountPrice || null },
        create: {
          productId: product.id,
          district,
          price: pricing.price,
          discountPrice: pricing.discountPrice || null,
        },
      });
      console.log(`  ✅ ${product.name}: ৳${pricing.price}${pricing.discountPrice ? ` (discount: ৳${pricing.discountPrice})` : ""}`);
    }
  }

  console.log("\n\n🎉 District prices and test users seeded!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Test Users (all password: test123):");
  console.log("─────────────────────────────────────────────");
  for (const u of testUsers) {
    console.log(`  ${u.role.padEnd(10)} ${u.email.padEnd(30)} ${u.district}`);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
