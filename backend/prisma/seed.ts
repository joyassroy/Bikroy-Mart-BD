import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/bcrypt";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// SHWAPNO-STYLE CATEGORIES (matching real Shwapno BD categories)
// ─────────────────────────────────────────────────────────────────────────────
const groceryCategories = [
  { name: "Rice & Grains", nameBn: "চাল ও শস্য", slug: "rice-grains", icon: "Wheat", sortOrder: 1, image: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { name: "Fruits & Vegetables", nameBn: "ফল ও সবজি", slug: "fruits-vegetables", icon: "Apple", sortOrder: 2, image: "https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { name: "Meat & Fish", nameBn: "মাংস ও মাছ", slug: "meat-fish", icon: "Beef", sortOrder: 3, image: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { name: "Dairy & Eggs", nameBn: "দুধ ও ডিম", slug: "dairy-eggs", icon: "Egg", sortOrder: 4, image: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { name: "Drinks & Beverages", nameBn: "পানীয়", slug: "drinks-beverages", icon: "Coffee", sortOrder: 5, image: "https://images.pexels.com/photos/1458671/pexels-photo-1458671.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { name: "Snacks & Chips", nameBn: "স্ন্যাকস ও চিপস", slug: "snacks-chips", icon: "Cookie", sortOrder: 6, image: "https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { name: "Oil & Ghee", nameBn: "তেল ও ঘি", slug: "oil-ghee", icon: "Droplets", sortOrder: 7, image: "https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=400" },
  { name: "Spices & Condiments", nameBn: "মসলা ও মশলা", slug: "spices-condiments", icon: "ChefHat", sortOrder: 8, image: "https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { name: "Bakery & Biscuits", nameBn: "বেকারি ও বিস্কুট", slug: "bakery-biscuits", icon: "Cake", sortOrder: 9, image: "https://images.pexels.com/photos/1387070/pexels-photo-1387070.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { name: "Beauty & Health", nameBn: "সৌন্দর্য ও স্বাস্থ্য", slug: "beauty-health", icon: "Sparkles", sortOrder: 10, image: "https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { name: "Home Cleaning", nameBn: "বাড়ি পরিষ্কার", slug: "home-cleaning", icon: "SprayCan", sortOrder: 11, image: "https://images.pexels.com/photos/4099469/pexels-photo-4099469.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { name: "Baby Care", nameBn: "শিশু যত্ন", slug: "baby-care", icon: "Baby", sortOrder: 12, image: "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=400" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SUBCATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
const subcategoryData: Record<string, { name: string; nameBn: string; slug: string }[]> = {
  "rice-grains": [
    { name: "Miniket Rice", nameBn: "মিনিকেট চাল", slug: "miniket-rice" },
    { name: "Nazirshail Rice", nameBn: "নাজিরশাইল চাল", slug: "nazirshail-rice" },
    { name: "Basmati Rice", nameBn: "বাসমতি চাল", slug: "basmati-rice" },
    { name: "Atap Rice", nameBn: "আতপ চাল", slug: "atap-rice" },
    { name: "Dal & Lentils", nameBn: "ডাল", slug: "dal-lentils" },
    { name: "Flour & Atta", nameBn: "আটা ও ময়দা", slug: "flour-atta" },
  ],
  "fruits-vegetables": [
    { name: "Fresh Vegetables", nameBn: "তাজা সবজি", slug: "fresh-vegetables" },
    { name: "Fresh Fruits", nameBn: "তাজা ফল", slug: "fresh-fruits" },
    { name: "Dry Fruits", nameBn: "শুকনো ফল", slug: "dry-fruits" },
    { name: "Herbs & Leaves", nameBn: "শাক ও পাতা", slug: "herbs-leaves" },
  ],
  "meat-fish": [
    { name: "Chicken", nameBn: "মুরগির মাংস", slug: "chicken" },
    { name: "Beef", nameBn: "গরুর মাংস", slug: "beef" },
    { name: "Mutton", nameBn: "খাসির মাংস", slug: "mutton" },
    { name: "Fresh Fish", nameBn: "তাজা মাছ", slug: "fresh-fish" },
    { name: "Frozen Fish", nameBn: "ফ্রোজেন মাছ", slug: "frozen-fish" },
  ],
  "dairy-eggs": [
    { name: "Milk", nameBn: "দুধ", slug: "milk" },
    { name: "Yogurt", nameBn: "দই", slug: "yogurt" },
    { name: "Cheese & Butter", nameBn: "পনির ও মাখন", slug: "cheese-butter" },
    { name: "Eggs", nameBn: "ডিম", slug: "eggs" },
  ],
  "drinks-beverages": [
    { name: "Tea & Coffee", nameBn: "চা ও কফি", slug: "tea-coffee" },
    { name: "Juice & Drinks", nameBn: "জুস ও পানীয়", slug: "juice-drinks" },
    { name: "Soft Drinks", nameBn: "সফট ড্রিংকস", slug: "soft-drinks" },
    { name: "Water", nameBn: "পানি", slug: "water" },
  ],
  "snacks-chips": [
    { name: "Potato Chips", nameBn: "আলুর চিপস", slug: "potato-chips" },
    { name: "Noodles", nameBn: "নুডলস", slug: "noodles" },
    { name: "Biscuits", nameBn: "বিস্কুট", slug: "biscuits-snacks" },
    { name: "Chocolates", nameBn: "চকোলেট", slug: "chocolates" },
  ],
  "oil-ghee": [
    { name: "Soybean Oil", nameBn: "সয়াবিন তেল", slug: "soybean-oil" },
    { name: "Mustard Oil", nameBn: "সরিষার তেল", slug: "mustard-oil" },
    { name: "Palm Oil", nameBn: "পাম তেল", slug: "palm-oil" },
    { name: "Pure Ghee", nameBn: "বিশুদ্ধ ঘি", slug: "pure-ghee" },
  ],
  "spices-condiments": [
    { name: "Turmeric", nameBn: "হলুদ", slug: "turmeric" },
    { name: "Chilli Powder", nameBn: "মরিচের গুঁড়া", slug: "chilli-powder" },
    { name: "Garam Masala", nameBn: "গরম মসলা", slug: "garam-masala" },
    { name: "Salt & Sugar", nameBn: "লবণ ও চিনি", slug: "salt-sugar" },
    { name: "Sauces & Pickles", nameBn: "সস ও আচার", slug: "sauces-pickles" },
  ],
  "bakery-biscuits": [
    { name: "Bread & Bun", nameBn: "রুটি ও বান", slug: "bread-bun" },
    { name: "Cake", nameBn: "কেক", slug: "cake" },
    { name: "Cookies", nameBn: "কুকিজ", slug: "cookies" },
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
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// REAL SHWAPNO-STYLE PRODUCTS WITH REAL GROCERY IMAGES
// Image source: Pexels (free, commercial use allowed)
// ─────────────────────────────────────────────────────────────────────────────
const productData = [
  // ── Rice & Grains ─────────────────────────────────────────────────────────
  {
    name: "Miniket Rice 5kg", nameBn: "মিনিকেট চাল ৫ কেজি",
    slug: "miniket-rice-5kg",
    description: "Premium quality Miniket rice. Fine, long-grain white rice perfect for everyday cooking. Sourced from the finest paddy fields of Bangladesh.",
    price: 320, discountPrice: 299, unit: "5kg pack", stock: 150, sku: "MKR-001",
    categorySlug: "rice-grains", subcategorySlug: "miniket-rice",
    images: ["https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Best Seller", "Fresh"],
  },
  {
    name: "Nazirshail Rice 5kg", nameBn: "নাজিরশাইল চাল ৫ কেজি",
    slug: "nazirshail-rice-5kg",
    description: "Aromatic Nazirshail rice, a premium short-grain rice with unique aroma. Ideal for special occasions and everyday meals.",
    price: 350, discountPrice: 325, unit: "5kg pack", stock: 120, sku: "NSR-001",
    categorySlug: "rice-grains", subcategorySlug: "nazirshail-rice",
    images: ["https://images.pexels.com/photos/7421261/pexels-photo-7421261.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Popular"],
  },
  {
    name: "Basmati Rice 1kg", nameBn: "বাসমতি চাল ১ কেজি",
    slug: "basmati-rice-1kg",
    description: "Premium aged Basmati rice with long, slender grains and a beautiful aroma. Perfect for biryani and pulao.",
    price: 180, discountPrice: 165, unit: "1kg pack", stock: 80, sku: "BSR-001",
    categorySlug: "rice-grains", subcategorySlug: "basmati-rice",
    images: ["https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Premium"],
  },
  {
    name: "Teer Wheat Flour (Atta) 2kg", nameBn: "টীর আটা ২ কেজি",
    slug: "teer-atta-2kg",
    description: "Finely ground whole wheat flour. Rich in fiber and nutrients. Perfect for making roti, paratha, and chapati.",
    price: 120, discountPrice: 110, unit: "2kg pack", stock: 200, sku: "TWF-001",
    categorySlug: "rice-grains", subcategorySlug: "flour-atta",
    images: ["https://images.pexels.com/photos/5765/flour-wheat-bread-food.jpg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },
  {
    name: "Musur Dal 1kg", nameBn: "মসুর ডাল ১ কেজি",
    slug: "musur-dal-1kg",
    description: "Premium quality red lentils (Musur Dal). High in protein and iron. Cook quickly and make a delicious and nutritious meal.",
    price: 135, discountPrice: 125, unit: "1kg pack", stock: 180, sku: "MSD-001",
    categorySlug: "rice-grains", subcategorySlug: "dal-lentils",
    images: ["https://images.pexels.com/photos/7425451/pexels-photo-7425451.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Nutritious"],
  },

  // ── Fruits & Vegetables ───────────────────────────────────────────────────
  {
    name: "Fresh Tomato 500g", nameBn: "তাজা টমেটো ৫০০ গ্রাম",
    slug: "fresh-tomato-500g",
    description: "Freshly harvested juicy red tomatoes. Great for cooking curries, salads, and sauces.",
    price: 45, discountPrice: null, unit: "500g", stock: 100, sku: "FVG-001",
    categorySlug: "fruits-vegetables", subcategorySlug: "fresh-vegetables",
    images: ["https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Fresh"],
  },
  {
    name: "Green Capsicum 250g", nameBn: "সবুজ ক্যাপসিকাম ২৫০ গ্রাম",
    slug: "green-capsicum-250g",
    description: "Fresh crunchy green bell peppers. Rich in Vitamin C. Great for stir-fries, salads, and cooking.",
    price: 55, discountPrice: 48, unit: "250g", stock: 60, sku: "FVG-002",
    categorySlug: "fruits-vegetables", subcategorySlug: "fresh-vegetables",
    images: ["https://images.pexels.com/photos/594137/pexels-photo-594137.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },
  {
    name: "Fresh Banana (Dozen)", nameBn: "তাজা কলা (ডজন)",
    slug: "fresh-banana-dozen",
    description: "Sweet and ripe yellow bananas. A dozen pack. Rich in potassium and natural energy.",
    price: 80, discountPrice: 70, unit: "12 pcs", stock: 90, sku: "FRT-001",
    categorySlug: "fruits-vegetables", subcategorySlug: "fresh-fruits",
    images: ["https://images.pexels.com/photos/2316466/pexels-photo-2316466.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Fresh", "Popular"],
  },
  {
    name: "Apple (Royal Gala) 1kg", nameBn: "আপেল (রয়্যাল গালা) ১ কেজি",
    slug: "apple-royal-gala-1kg",
    description: "Imported Royal Gala apples. Crisp, sweet, and juicy. A perfect healthy snack.",
    price: 250, discountPrice: 220, unit: "1kg", stock: 50, sku: "FRT-002",
    categorySlug: "fruits-vegetables", subcategorySlug: "fresh-fruits",
    images: ["https://images.pexels.com/photos/1510392/pexels-photo-1510392.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Imported"],
  },
  {
    name: "Broccoli 500g", nameBn: "ব্রোকোলি ৫০০ গ্রাম",
    slug: "broccoli-500g",
    description: "Fresh and crunchy broccoli. Rich in vitamins, minerals, and antioxidants.",
    price: 90, discountPrice: 80, unit: "500g", stock: 40, sku: "FVG-003",
    categorySlug: "fruits-vegetables", subcategorySlug: "fresh-vegetables",
    images: ["https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Healthy"],
  },
  {
    name: "Watermelon (Whole)", nameBn: "তরমুজ (সম্পূর্ণ)",
    slug: "watermelon-whole",
    description: "Large, sweet and juicy watermelon. Perfect for hot summer days. Rich in vitamins A and C.",
    price: 120, discountPrice: 100, unit: "1 piece (approx 3-4kg)", stock: 35, sku: "FRT-003",
    categorySlug: "fruits-vegetables", subcategorySlug: "fresh-fruits",
    images: ["https://images.pexels.com/photos/1313267/pexels-photo-1313267.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Seasonal"],
  },

  // ── Meat & Fish ───────────────────────────────────────────────────────────
  {
    name: "Broiler Chicken (Whole) 1kg", nameBn: "ব্রয়লার মুরগি (সম্পূর্ণ) ১ কেজি",
    slug: "broiler-chicken-whole-1kg",
    description: "Farm-fresh whole broiler chicken. Cleaned and ready to cook. High in protein.",
    price: 185, discountPrice: 175, unit: "1kg", stock: 80, sku: "MCH-001",
    categorySlug: "meat-fish", subcategorySlug: "chicken",
    images: ["https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Fresh", "Best Seller"],
  },
  {
    name: "Chicken Breast Boneless 500g", nameBn: "বোনলেস চিকেন ব্রেস্ট ৫০০ গ্রাম",
    slug: "chicken-breast-boneless-500g",
    description: "Premium boneless, skinless chicken breast. Perfect for grilling, stir-frying, and healthy meals.",
    price: 160, discountPrice: 145, unit: "500g", stock: 60, sku: "MCH-002",
    categorySlug: "meat-fish", subcategorySlug: "chicken",
    images: ["https://images.pexels.com/photos/6210753/pexels-photo-6210753.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Healthy"],
  },
  {
    name: "Hilsa Fish (Ilish) 1kg", nameBn: "ইলিশ মাছ ১ কেজি",
    slug: "hilsa-fish-1kg",
    description: "Bangladesh's national fish - fresh Hilsa (Ilish). Rich in omega-3 fatty acids. Best for bhapa ilish and mustard curry.",
    price: 1200, discountPrice: 1100, unit: "1kg", stock: 25, sku: "MFH-001",
    categorySlug: "meat-fish", subcategorySlug: "fresh-fish",
    images: ["https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Premium", "Seasonal"],
  },
  {
    name: "Rui Fish 1kg", nameBn: "রুই মাছ ১ কেজি",
    slug: "rui-fish-1kg",
    description: "Fresh Rui (Rohu) fish. A popular freshwater fish in Bangladesh. Great for curry.",
    price: 280, discountPrice: 260, unit: "1kg", stock: 50, sku: "MFR-001",
    categorySlug: "meat-fish", subcategorySlug: "fresh-fish",
    images: ["https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Fresh"],
  },
  {
    name: "Beef (Lean Cut) 500g", nameBn: "গরুর মাংস (লীন কাট) ৫০০ গ্রাম",
    slug: "beef-lean-cut-500g",
    description: "Fresh lean beef cuts. Perfect for curries, kofta, and bhuna. Halal certified.",
    price: 450, discountPrice: 420, unit: "500g", stock: 40, sku: "MBF-001",
    categorySlug: "meat-fish", subcategorySlug: "beef",
    images: ["https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Halal", "Fresh"],
  },

  // ── Dairy & Eggs ──────────────────────────────────────────────────────────
  {
    name: "Farm Fresh Eggs (12 pcs)", nameBn: "ফার্ম ফ্রেশ ডিম ১২টি",
    slug: "farm-fresh-eggs-12",
    description: "Fresh farm eggs from free-range hens. Rich in protein and essential vitamins. A nutritious breakfast staple.",
    price: 150, discountPrice: 140, unit: "12 pcs", stock: 120, sku: "DEG-001",
    categorySlug: "dairy-eggs", subcategorySlug: "eggs",
    images: ["https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Fresh", "Best Seller"],
  },
  {
    name: "Aarong Full Cream Milk 1L", nameBn: "আড়ং ফুল ক্রিম দুধ ১ লিটার",
    slug: "aarong-full-cream-milk-1l",
    description: "Premium full cream pasteurized milk. Rich in calcium and vitamins. No preservatives added.",
    price: 95, discountPrice: 90, unit: "1 litre", stock: 100, sku: "DML-001",
    categorySlug: "dairy-eggs", subcategorySlug: "milk",
    images: ["https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Popular"],
  },
  {
    name: "Aarong Set Yogurt 400g", nameBn: "আড়ং সেট দই ৪০০ গ্রাম",
    slug: "aarong-set-yogurt-400g",
    description: "Thick and creamy set yogurt made from fresh full cream milk. Perfect for breakfast and desserts.",
    price: 85, discountPrice: 78, unit: "400g", stock: 70, sku: "DYG-001",
    categorySlug: "dairy-eggs", subcategorySlug: "yogurt",
    images: ["https://images.pexels.com/photos/1435706/pexels-photo-1435706.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },
  {
    name: "Pran Butter 200g", nameBn: "প্রাণ বাটার ২০০ গ্রাম",
    slug: "pran-butter-200g",
    description: "Smooth and creamy dairy butter. Great for baking, toast, and cooking. Made from fresh cream.",
    price: 130, discountPrice: 120, unit: "200g", stock: 60, sku: "DBT-001",
    categorySlug: "dairy-eggs", subcategorySlug: "cheese-butter",
    images: ["https://images.pexels.com/photos/531334/pexels-photo-531334.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },

  // ── Drinks & Beverages ────────────────────────────────────────────────────
  {
    name: "Ispahani Mirzapore Tea 200g", nameBn: "ইস্পাহানি মির্জাপোর চা ২০০ গ্রাম",
    slug: "ispahani-mirzapore-tea-200g",
    description: "Bangladesh's most loved tea brand. Strong, aromatic blend from the finest tea gardens of Sylhet.",
    price: 145, discountPrice: 135, unit: "200g pack", stock: 150, sku: "BVT-001",
    categorySlug: "drinks-beverages", subcategorySlug: "tea-coffee",
    images: ["https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Best Seller"],
  },
  {
    name: "Coca-Cola 250ml (6 Pack)", nameBn: "কোকা-কোলা ২৫০ মিলি (৬ পিস)",
    slug: "coca-cola-250ml-6pack",
    description: "The classic refreshing Coca-Cola. A perfect pack of 6 cans for the whole family.",
    price: 240, discountPrice: 220, unit: "6 x 250ml", stock: 80, sku: "BVS-001",
    categorySlug: "drinks-beverages", subcategorySlug: "soft-drinks",
    images: ["https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },
  {
    name: "Pran Mango Juice 250ml", nameBn: "প্রাণ ম্যাঙ্গো জুস ২৫০ মিলি",
    slug: "pran-mango-juice-250ml",
    description: "Refreshing and sweet mango fruit drink. Made with real mango pulp. No artificial colors.",
    price: 35, discountPrice: null, unit: "250ml tetra pack", stock: 200, sku: "BVJ-001",
    categorySlug: "drinks-beverages", subcategorySlug: "juice-drinks",
    images: ["https://images.pexels.com/photos/1458671/pexels-photo-1458671.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Popular"],
  },
  {
    name: "Mum Drinking Water 2L", nameBn: "মাম মিনারেল ওয়াটার ২ লিটার",
    slug: "mum-drinking-water-2l",
    description: "Pure and refreshing mineral drinking water. Perfect hydration for the whole family.",
    price: 40, discountPrice: 35, unit: "2 litre bottle", stock: 300, sku: "BWR-001",
    categorySlug: "drinks-beverages", subcategorySlug: "water",
    images: ["https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },

  // ── Snacks & Chips ────────────────────────────────────────────────────────
  {
    name: "Lays Chips Classic 75g", nameBn: "লেইস চিপস ক্লাসিক ৭৫ গ্রাম",
    slug: "lays-chips-classic-75g",
    description: "America's favorite crispy potato chips. Perfectly salted for a great snacking experience.",
    price: 85, discountPrice: 75, unit: "75g pack", stock: 100, sku: "SNC-001",
    categorySlug: "snacks-chips", subcategorySlug: "potato-chips",
    images: ["https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Popular"],
  },
  {
    name: "Maggi Noodles 70g (Pack of 4)", nameBn: "ম্যাগি নুডলস ৭০ গ্রাম (৪ প্যাক)",
    slug: "maggi-noodles-70g-4pack",
    description: "The classic 2-minute noodles. Quick, delicious, and satisfying. A household favorite.",
    price: 120, discountPrice: 108, unit: "4 x 70g", stock: 150, sku: "SNN-001",
    categorySlug: "snacks-chips", subcategorySlug: "noodles",
    images: ["https://images.pexels.com/photos/1731535/pexels-photo-1731535.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },
  {
    name: "Oreo Biscuit 120g", nameBn: "ওরিও বিস্কুট ১২০ গ্রাম",
    slug: "oreo-biscuit-120g",
    description: "The world's favorite cookie. Crispy chocolate wafers with creamy vanilla filling.",
    price: 95, discountPrice: 85, unit: "120g pack", stock: 90, sku: "SNB-001",
    categorySlug: "snacks-chips", subcategorySlug: "biscuits-snacks",
    images: ["https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },
  {
    name: "KitKat Chocolate 4 Finger", nameBn: "কিটক্যাট চকোলেট ৪ ফিঙ্গার",
    slug: "kitkat-chocolate-4finger",
    description: "Have a break, have a KitKat! Crispy wafer fingers covered in milk chocolate.",
    price: 60, discountPrice: 55, unit: "45g bar", stock: 120, sku: "SNC-002",
    categorySlug: "snacks-chips", subcategorySlug: "chocolates",
    images: ["https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Popular"],
  },

  // ── Oil & Ghee ────────────────────────────────────────────────────────────
  {
    name: "Teer Soybean Oil 5L", nameBn: "টীর সয়াবিন তেল ৫ লিটার",
    slug: "teer-soybean-oil-5l",
    description: "Premium quality soybean cooking oil. Cholesterol-free, rich in polyunsaturated fats. A household essential.",
    price: 780, discountPrice: 749, unit: "5 litre", stock: 100, sku: "OGS-001",
    categorySlug: "oil-ghee", subcategorySlug: "soybean-oil",
    images: ["https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Best Seller"],
  },
  {
    name: "Mustard Oil 1L", nameBn: "সরিষার তেল ১ লিটার",
    slug: "mustard-oil-1l",
    description: "Pure cold-pressed mustard oil with a strong, pungent flavor. Essential for authentic Bengali cooking.",
    price: 200, discountPrice: 185, unit: "1 litre", stock: 80, sku: "OGM-001",
    categorySlug: "oil-ghee", subcategorySlug: "mustard-oil",
    images: ["https://images.pexels.com/photos/461428/pexels-photo-461428.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Traditional"],
  },
  {
    name: "Aarong Pure Ghee 200g", nameBn: "আড়ং বিশুদ্ধ ঘি ২০০ গ্রাম",
    slug: "aarong-pure-ghee-200g",
    description: "Premium quality pure ghee made from fresh dairy cream. Rich, aromatic, and perfect for biryani and halwa.",
    price: 350, discountPrice: 320, unit: "200g", stock: 50, sku: "OGG-001",
    categorySlug: "oil-ghee", subcategorySlug: "pure-ghee",
    images: ["https://images.pexels.com/photos/531334/pexels-photo-531334.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Premium"],
  },

  // ── Spices & Condiments ───────────────────────────────────────────────────
  {
    name: "BD Pure Turmeric Powder 200g", nameBn: "বিডি বিশুদ্ধ হলুদ গুঁড়া ২০০ গ্রাম",
    slug: "bd-turmeric-powder-200g",
    description: "Freshly ground pure turmeric powder. Deep yellow color, strong aroma, and high curcumin content.",
    price: 65, discountPrice: 58, unit: "200g pack", stock: 150, sku: "SPC-001",
    categorySlug: "spices-condiments", subcategorySlug: "turmeric",
    images: ["https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Pure"],
  },
  {
    name: "Chilli Powder 200g", nameBn: "মরিচের গুঁড়া ২০০ গ্রাম",
    slug: "chilli-powder-200g",
    description: "Fiery hot and flavorful red chilli powder. Adds the perfect heat to every dish.",
    price: 75, discountPrice: 65, unit: "200g", stock: 130, sku: "SPC-002",
    categorySlug: "spices-condiments", subcategorySlug: "chilli-powder",
    images: ["https://images.pexels.com/photos/4137857/pexels-photo-4137857.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },
  {
    name: "Pran Tomato Ketchup 340g", nameBn: "প্রাণ টমেটো কেচাপ ৩৪০ গ্রাম",
    slug: "pran-tomato-ketchup-340g",
    description: "Sweet and tangy tomato ketchup. Perfect dip for snacks, fries, and fast food.",
    price: 90, discountPrice: 82, unit: "340g bottle", stock: 100, sku: "SPK-001",
    categorySlug: "spices-condiments", subcategorySlug: "sauces-pickles",
    images: ["https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },
  {
    name: "Molla Salt 1kg", nameBn: "মোল্লা লবণ ১ কেজি",
    slug: "molla-salt-1kg",
    description: "Fine iodized salt for everyday cooking. Helps prevent iodine deficiency.",
    price: 35, discountPrice: null, unit: "1kg pack", stock: 250, sku: "SPS-001",
    categorySlug: "spices-condiments", subcategorySlug: "salt-sugar",
    images: ["https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },

  // ── Bakery ────────────────────────────────────────────────────────────────
  {
    name: "Western Bread (Sliced) 400g", nameBn: "ওয়েস্টার্ন ব্রেড (স্লাইসড) ৪০০ গ্রাম",
    slug: "western-bread-sliced-400g",
    description: "Soft and fluffy white sliced bread. Perfect for sandwiches, toast, and breakfast.",
    price: 75, discountPrice: 68, unit: "400g loaf", stock: 80, sku: "BKB-001",
    categorySlug: "bakery-biscuits", subcategorySlug: "bread-bun",
    images: ["https://images.pexels.com/photos/1387070/pexels-photo-1387070.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },
  {
    name: "Parle G Biscuit 200g", nameBn: "পার্লে জি বিস্কুট ২০০ গ্রাম",
    slug: "parle-g-biscuit-200g",
    description: "India's most beloved glucose biscuit. Perfect with tea. Sweet, light, and delicious.",
    price: 45, discountPrice: 40, unit: "200g pack", stock: 180, sku: "BKB-002",
    categorySlug: "bakery-biscuits", subcategorySlug: "cookies",
    images: ["https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Popular"],
  },

  // ── Beauty & Health ───────────────────────────────────────────────────────
  {
    name: "Dove Body Lotion 250ml", nameBn: "ডাভ বডি লোশন ২৫০ মিলি",
    slug: "dove-body-lotion-250ml",
    description: "Moisturizing body lotion with 1/4 moisturizing cream. Leaves skin feeling soft and smooth all day.",
    price: 280, discountPrice: 255, unit: "250ml", stock: 60, sku: "BHB-001",
    categorySlug: "beauty-health", subcategorySlug: "body-wash",
    images: ["https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },
  {
    name: "Head & Shoulders Shampoo 340ml", nameBn: "হেড অ্যান্ড শোল্ডারস শ্যাম্পু ৩৪০ মিলি",
    slug: "head-shoulders-shampoo-340ml",
    description: "Anti-dandruff shampoo for clean, healthy hair. Clinically proven formula.",
    price: 340, discountPrice: 310, unit: "340ml", stock: 50, sku: "BHH-001",
    categorySlug: "beauty-health", subcategorySlug: "haircare",
    images: ["https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },
  {
    name: "Colgate Strong Teeth Toothpaste 200g", nameBn: "কোলগেট স্ট্রং টিথ টুথপেস্ট ২০০ গ্রাম",
    slug: "colgate-strong-teeth-200g",
    description: "Strengthens teeth with Active Calcium and prevents cavities. Fresh mint flavor.",
    price: 165, discountPrice: 150, unit: "200g tube", stock: 80, sku: "BHO-001",
    categorySlug: "beauty-health", subcategorySlug: "oral-care",
    images: ["https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },
  {
    name: "Ponds Face Cream 50g", nameBn: "পন্ডস ফেস ক্রিম ৫০ গ্রাম",
    slug: "ponds-face-cream-50g",
    description: "Classic Pond's cold cream with moisturizing formula. Removes makeup, cleanses deep pores.",
    price: 145, discountPrice: 130, unit: "50g jar", stock: 70, sku: "BHS-001",
    categorySlug: "beauty-health", subcategorySlug: "skincare",
    images: ["https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },

  // ── Home Cleaning ─────────────────────────────────────────────────────────
  {
    name: "Surf Excel Washing Powder 1kg", nameBn: "সার্ফ এক্সেল ওয়াশিং পাউডার ১ কেজি",
    slug: "surf-excel-washing-powder-1kg",
    description: "Powerful cleaning action for tough stains. Removes even the most stubborn dirt and grime.",
    price: 180, discountPrice: 165, unit: "1kg pack", stock: 100, sku: "HCL-001",
    categorySlug: "home-cleaning", subcategorySlug: "laundry",
    images: ["https://images.pexels.com/photos/4099469/pexels-photo-4099469.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Best Seller"],
  },
  {
    name: "Vim Dishwash Bar 250g", nameBn: "ভিম ডিশওয়াশ বার ২৫০ গ্রাম",
    slug: "vim-dishwash-bar-250g",
    description: "Tough on grease, gentle on hands. Removes tough dried food stains from utensils effortlessly.",
    price: 45, discountPrice: 40, unit: "250g bar", stock: 150, sku: "HCD-001",
    categorySlug: "home-cleaning", subcategorySlug: "dishwash",
    images: ["https://images.pexels.com/photos/4099469/pexels-photo-4099469.jpeg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: [],
  },

  // ── Baby Care ─────────────────────────────────────────────────────────────
  {
    name: "Pampers Baby Diapers Large (22 pcs)", nameBn: "প্যাম্পার্স বেবি ডায়াপার লার্জ (২২ পিস)",
    slug: "pampers-baby-diapers-large-22pcs",
    description: "Soft and absorbent baby diapers. Up to 12 hours of dryness protection. With wetness indicator.",
    price: 680, discountPrice: 620, unit: "22 pcs pack", stock: 40, sku: "BCB-001",
    categorySlug: "baby-care", subcategorySlug: "diapers",
    images: ["https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: true, badges: ["Premium"],
  },
  {
    name: "Cerelac Wheat & Milk 400g", nameBn: "সেরেলাক গম ও দুধ ৪০০ গ্রাম",
    slug: "cerelac-wheat-milk-400g",
    description: "Nestle Cerelac first foods for babies 6 months+. Fortified with 18 essential nutrients.",
    price: 420, discountPrice: 395, unit: "400g tin", stock: 30, sku: "BCF-001",
    categorySlug: "baby-care", subcategorySlug: "baby-food",
    images: ["https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=500"],
    isFeatured: false, badges: ["Trusted Brand"],
  },
];

async function clearDatabase() {
  console.log("🗑️  Clearing all existing data...");
  // Delete in reverse dependency order
  await prisma.flashDeal.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productRequest.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customRequest.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.mediaLibrary.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.emailSubscriber.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.address.deleteMany();
  // Keep admin user, delete other users
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  await prisma.riderProfile.deleteMany();
  await prisma.managerProfile.deleteMany();
  if (admin) {
    await prisma.user.deleteMany({ where: { id: { not: admin.id } } });
  } else {
    await prisma.user.deleteMany();
  }
  console.log("✅ Database cleared!");
}

async function main() {
  console.log("🌱 Starting Shwapno-style seed...");

  await clearDatabase();

  // ── Admin User ─────────────────────────────────────────────────────────────
  const adminPassword = await hashPassword("admin123");
  const admin = await prisma.user.upsert({
    where: { email: "admin@bikroymart.com" },
    update: {},
    create: {
      name: "Bikroy Mart Admin",
      email: "admin@bikroymart.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin:", admin.email);

  // ── Categories + Subcategories ─────────────────────────────────────────────
  const categoryMap: Record<string, string> = {};
  const subcategoryMap: Record<string, string> = {};

  for (const cat of groceryCategories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = category.id;
    console.log("📁 Category:", category.name);

    const subs = subcategoryData[cat.slug] || [];
    for (const sub of subs) {
      const subcat = await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: {},
        create: { ...sub, categoryId: category.id },
      });
      subcategoryMap[sub.slug] = subcat.id;
    }
  }

  // ── Products ───────────────────────────────────────────────────────────────
  for (const p of productData) {
    const catId = categoryMap[p.categorySlug];
    const subId = subcategoryMap[p.subcategorySlug];

    if (!catId) {
      console.warn(`⚠️  Category not found: ${p.categorySlug}`);
      continue;
    }

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        nameBn: p.nameBn,
        slug: p.slug,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        unit: p.unit,
        stock: p.stock,
        sku: p.sku,
        images: p.images,
        categoryId: catId,
        subcategoryId: subId || null,
        isFeatured: p.isFeatured,
        isActive: true,
        badges: p.badges,
        deliveryTime: "1-2 hours",
      },
    });
    console.log("📦 Product:", p.name);
  }

  // ── Banners (Shwapno-style hero banners) ──────────────────────────────────
  await prisma.banner.createMany({
    data: [
      {
        title: "Fresh Grocery Delivered in 60 Minutes",
        subtitle: "Order now and get fresh vegetables, meat & more at your doorstep",
        image: "https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=1200",
        mobileImage: "https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=600",
        position: "hero",
        bgColor: "#00215B",
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "Fresh Meat & Fish Every Day",
        subtitle: "Sourced fresh daily from trusted farms and rivers",
        image: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=1200",
        mobileImage: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=600",
        position: "hero",
        bgColor: "#1a3a5c",
        sortOrder: 2,
        isActive: true,
      },
      {
        title: "Big Savings on Essentials",
        subtitle: "Up to 20% off on rice, oil, flour and daily staples",
        image: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200",
        mobileImage: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=600",
        position: "hero",
        bgColor: "#0a2d5c",
        sortOrder: 3,
        isActive: true,
      },
      {
        title: "60-Minute Delivery",
        subtitle: "We deliver to your doorstep within 60 minutes",
        image: "https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=800",
        position: "center",
        sortOrder: 1,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log("🖼️  Banners created");

  // ── Coupons ────────────────────────────────────────────────────────────────
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: 10,
        minPurchase: 500,
        maxDiscount: 200,
        isActive: true,
        expiresAt: new Date("2026-12-31"),
      },
      {
        code: "SAVE50",
        discountType: "fixed",
        discountValue: 50,
        minPurchase: 400,
        isActive: true,
        expiresAt: new Date("2026-12-31"),
      },
      {
        code: "FRESH20",
        discountType: "percentage",
        discountValue: 20,
        minPurchase: 800,
        maxDiscount: 300,
        isActive: true,
        expiresAt: new Date("2026-09-30"),
      },
    ],
    skipDuplicates: true,
  });
  console.log("🎟️  Coupons created");

  // ── Flash Deals ─────────────────────────────────────────────────────────────
  const chickenProduct = await prisma.product.findUnique({ where: { slug: "broiler-chicken-whole-1kg" } });
  const hilsaProduct = await prisma.product.findUnique({ where: { slug: "hilsa-fish-1kg" } });
  const appleProduct = await prisma.product.findUnique({ where: { slug: "apple-royal-gala-1kg" } });

  const now = new Date();
  const flashDealsData = [
    chickenProduct && { productId: chickenProduct.id, dealPrice: 150, quantity: 50, startsAt: now, endsAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), isActive: true },
    hilsaProduct && { productId: hilsaProduct.id, dealPrice: 980, quantity: 20, startsAt: now, endsAt: new Date(now.getTime() + 12 * 60 * 60 * 1000), isActive: true },
    appleProduct && { productId: appleProduct.id, dealPrice: 190, quantity: 30, startsAt: now, endsAt: new Date(now.getTime() + 6 * 60 * 60 * 1000), isActive: true },
  ].filter(Boolean) as any[];

  if (flashDealsData.length > 0) {
    await prisma.flashDeal.createMany({ data: flashDealsData, skipDuplicates: true });
    console.log("⚡ Flash deals created");
  }

  // ── Stock Clearance & Executive Flash Deals ──────────────────────────────────
  const allProducts = await prisma.product.findMany({ where: { isActive: true }, take: 10 });
  if (allProducts.length >= 4) {
    const offerFlashDeals = [
      { productId: allProducts[0].id, type: "STOCK_CLEARANCE", dealPrice: Math.round(allProducts[0].price * 0.6), quantity: 25, startsAt: now, endsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), isActive: true },
      { productId: allProducts[1].id, type: "STOCK_CLEARANCE", dealPrice: Math.round(allProducts[1].price * 0.5), quantity: 15, startsAt: now, endsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), isActive: true },
      { productId: allProducts[2].id, type: "EXECUTIVE", dealPrice: Math.round(allProducts[2].price * 0.75), quantity: 30, startsAt: now, endsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), isActive: true },
      { productId: allProducts[3].id, type: "EXECUTIVE", dealPrice: Math.round(allProducts[3].price * 0.7), quantity: 20, startsAt: now, endsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), isActive: true },
    ];
    await prisma.flashDeal.createMany({ data: offerFlashDeals, skipDuplicates: true });
    console.log("🏷️ Stock clearance & executive deals created");
  }

  // ── Combo & BOGO Promo Offers ───────────────────────────────────────────────
  if (allProducts.length >= 6) {
    const comboItems = [
      allProducts[4], allProducts[5],
    ];
    const comboOffer = await prisma.promoOffer.create({
      data: {
        title: "Combo: " + comboItems.map((p) => p.name).join(" + "),
        description: "Buy this combo and save big!",
        type: "COMBO",
        offerPrice: Math.round(comboItems.reduce((s, p) => s + p.price, 0) * 0.8),
        startsAt: now,
        endsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        items: {
          create: comboItems.map((p) => ({ productId: p.id, quantity: 1 })),
        },
      },
    });
    console.log("🛒 Combo offer created:", comboOffer.title);

    const bogoProduct = allProducts[0];
    const bogoOffer = await prisma.promoOffer.create({
      data: {
        title: `Buy 1 Get 1 Free: ${bogoProduct.name}`,
        description: `Buy one ${bogoProduct.name} and get another free!`,
        type: "BOGO",
        buyQuantity: 1,
        getQuantity: 1,
        getDiscount: 100,
        offerPrice: bogoProduct.price,
        startsAt: now,
        endsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        isActive: true,
        items: {
          create: [{ productId: bogoProduct.id, quantity: 2 }],
        },
      },
    });
    console.log("🎁 BOGO offer created:", bogoOffer.title);
  }

  // ── Site Settings ─────────────────────────────────────────────────────────
  const settings = [
    { key: "storeName", value: "Bikroy-Mart-BD" },
    { key: "storeEmail", value: "info@bikroymart.com" },
    { key: "storePhone", value: "16469" },
    { key: "storeAddress", value: "Gulshan-1, Dhaka, Bangladesh" },
    { key: "currency", value: "BDT" },
    { key: "freeDeliveryMinimum", value: "1500" },
    { key: "deliveryWithinDistrict", value: "60" },
    { key: "deliveryOutsideDistrict", value: "120" },
    { key: "timezone", value: "Asia/Dhaka" },
    { key: "sslcommerzSandbox", value: "true" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("⚙️  Settings saved");

  console.log("\n🎉 Shwapno-style seed completed!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ ${groceryCategories.length} Categories`);
  console.log(`✅ ${productData.length} Products`);
  console.log("✅ 4 Banners");
  console.log("✅ 3 Coupons");
  console.log("✅ 3 Flash Deals");
  console.log("✅ Admin: admin@bikroymart.com / admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
