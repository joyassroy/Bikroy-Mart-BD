const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bmaart.com";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/manager/",
          "/rider/",
          "/api/",
          "/cart",
          "/checkout",
          "/account",
          "/track-order",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}

