import { readStore } from "./store";
import { defaultDocumentMeta, defaultSite } from "./defaults";

const publicSlugs = [
  "",
  "photography",
  "videography",
  "printing",
  "gifts",
  "live",
  "about",
  "booking",
  "contact",
  "portfolio",
];

export function publishedPublicPaths() {
  const store = readStore();
  const pagePaths = Object.values(store.pages)
    .filter((page) => !page.deletedAt && page.published)
    .map((page) => (page.slug === "home" ? "/" : `/${page.slug}`));
  const albumPaths = store.albums
    .filter((album) => !album.deletedAt && album.isVisible)
    .map((album) => `/photography/${album.slug}`);
  const productPaths = store.products
    .filter((product) => !product.deletedAt && product.isAvailable)
    .map((product) => {
      const category = store.productCategories.find((item) => item.id === product.categoryId);
      const base = category?.catalogue === "gifts" ? "gifts" : "printing";
      return `/${base}/${product.slug}`;
    });
  const set = new Set<string>([...pagePaths, ...albumPaths, ...productPaths]);
  for (const slug of publicSlugs) {
    set.add(slug ? `/${slug}` : "/");
  }
  return Array.from(set).sort();
}

export function robotsTxt() {
  const base = (process.env.PUBLIC_SITE_URL || "http://localhost:4000").replace(/\/$/, "");
  return [`User-agent: *`, `Allow: /`, `Disallow: /admin`, `Disallow: /api/`, `Sitemap: ${base}/sitemap.xml`, ``].join(
    "\n",
  );
}

export function sitemapXml() {
  const base = (process.env.PUBLIC_SITE_URL || "http://localhost:4000").replace(/\/$/, "");
  const urls = publishedPublicPaths()
    .map(
      (path) => `  <url>
    <loc>${base}${path === "/" ? "/" : path}</loc>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function pageDocumentMeta(pathname: string) {
  const store = readStore();
  const slug = pathname === "/" || pathname === "" ? "home" : pathname.replace(/^\//, "").split("/")[0];
  const page = Object.values(store.pages).find((item) => item.slug === slug && !item.deletedAt && item.published);
  const settings = { ...defaultSite, ...store.siteSettings } as typeof defaultSite;
  const title = page?.seo.en.title || defaultDocumentMeta.title;
  const description = page?.seo.en.description || defaultDocumentMeta.description;
  const ogMediaId = typeof store.siteSettings.ogMediaId === "string" ? store.siteSettings.ogMediaId : null;
  const ogMedia = ogMediaId
    ? store.media.find((item) => item.id === ogMediaId && !item.deletedAt)
    : null;
  return {
    title: title.includes("Oliyaruvi") ? title : `${title} · ${settings.businessName}`,
    description,
    ogImage: ogMedia?.url || null,
  };
}

export function businessJsonLdFromSettings() {
  const settings = { ...defaultSite, ...readStore().siteSettings } as typeof defaultSite & {
    addressEn?: string | null;
  };
  const phones = [settings.phonePrimary, settings.phoneSecondary]
    .filter(Boolean)
    .map((phone) => String(phone).replace(/^0/, "+94"));
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.businessName,
    telephone: phones,
  };
  if (settings.addressEn) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: settings.addressEn,
      addressLocality: settings.locationEn || "Nelliady",
      addressRegion: "Jaffna",
      addressCountry: "LK",
    };
  }
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
