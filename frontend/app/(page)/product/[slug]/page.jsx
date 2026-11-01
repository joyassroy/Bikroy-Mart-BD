import ProductDetailClient from "./ProductDetailClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bmaart.com";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api";

async function fetchProductData(slug) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE_URL}/products/slug/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

function formatSlugTitle(slug) {
  if (!slug) return "Product";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await fetchProductData(slug);

  if (!product) {
    const fallbackTitle = formatSlugTitle(slug);
    return {
      title: `${fallbackTitle} | Bikroymart BD`,
      description: `Buy ${fallbackTitle} online at the best price in Bangladesh with 60-minute express delivery on Bikroymart BD.`,
      alternates: {
        canonical: `/product/${slug}`,
      },
      openGraph: {
        title: `${fallbackTitle} | Bikroymart BD`,
        description: `Order fresh groceries & daily essentials with fast 60-minute delivery.`,
        url: `${SITE_URL}/product/${slug}`,
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: fallbackTitle }],
      },
    };
  }

  const title = `${product.name} | Best Price in Bangladesh`;
  const cleanDescription = product.description
    ? product.description.replace(/\s+/g, " ").trim().slice(0, 160)
    : `Buy ${product.name} online at Bikroymart BD for ৳${product.price}. Fresh quality, best market price & 60-minute fast delivery in Bangladesh.`;

  const primaryImage = product.images?.[0] || "/og-image.png";
  const ogImages = product.images?.length
    ? product.images.map((img) => ({
        url: img,
        width: 800,
        height: 800,
        alt: product.name,
      }))
    : [{ url: "/og-image.png", width: 1200, height: 630, alt: product.name }];

  const keywords = [
    product.name,
    product.nameBn,
    product.category?.name,
    product.category?.nameBn,
    product.subcategory?.name,
    "online grocery",
    "bikroymart",
    "bmaart",
    "bangladesh grocery delivery",
  ].filter(Boolean);

  return {
    title,
    description: cleanDescription,
    keywords,
    alternates: {
      canonical: `/product/${slug}`,
    },
    openGraph: {
      title: `${product.name} - ৳${product.discountPrice || product.price} | Bikroymart BD`,
      description: cleanDescription,
      url: `${SITE_URL}/product/${slug}`,
      siteName: "Bikroymart BD",
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - ৳${product.discountPrice || product.price} | Bikroymart BD`,
      description: cleanDescription,
      images: [primaryImage],
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const product = await fetchProductData(slug);

  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.images?.length ? product.images : [`${SITE_URL}/og-image.png`],
        description: product.description || product.name,
        sku: product.id || slug,
        category: product.category?.name || "Grocery",
        brand: {
          "@type": "Brand",
          name: "Bikroymart BD",
        },
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/product/${slug}`,
          priceCurrency: "BDT",
          price: product.discountPrice || product.price,
          itemCondition: "https://schema.org/NewCondition",
          availability:
            product.stock === 0
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: "Bikroymart BD",
          },
        },
        ...(product.reviews?.length
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: (
                  product.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) /
                  product.reviews.length
                ).toFixed(1),
                reviewCount: product.reviews.length,
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <ProductDetailClient slug={slug} initialProduct={product} />
    </>
  );
}
