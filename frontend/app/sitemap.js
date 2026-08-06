const BASE_URL = "https://bmaart.com";

const staticPages = [
  "",
  "/about",
  "/contact",
  "/products",
  "/categories",
  "/cart",
  "/checkout",
  "/track",
];

export default function sitemap() {
  const staticEntries = staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1.0 : 0.8,
  }));

  return [...staticEntries];
}
