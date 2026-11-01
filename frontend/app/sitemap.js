const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bmaart.com";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api";

export default async function sitemap() {
  const staticRoutes = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/product-request`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/return-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  let productRoutes = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE_URL}/products?limit=200`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const products = json?.data || [];
      productRoutes = products
        .filter((p) => p?.slug)
        .map((p) => ({
          url: `${BASE_URL}/product/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        }));
    }
  } catch {
    // If backend is offline during build/regeneration, gracefully fall back to static routes
  }

  return [...staticRoutes, ...productRoutes];
}
