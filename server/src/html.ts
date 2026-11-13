import { defaultDocumentMeta, defaultSite } from "./cms/defaults";

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function canonicalUrl(pathname: string) {
  const base = process.env.PUBLIC_SITE_URL || "http://localhost:4000";
  return new URL(pathname, base.endsWith("/") ? base : `${base}/`).href;
}

export function applyDocumentMeta(
  html: string,
  meta: { title: string; description: string; canonical: string },
) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const canonical = escapeHtml(meta.canonical);
  let next = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  if (next.includes('name="description"')) {
    next = next.replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${description}" />`,
    );
  }
  if (next.includes('rel="canonical"')) {
    next = next.replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${canonical}" />`,
    );
  } else {
    next = next.replace("</head>", `    <link rel="canonical" href="${canonical}" />\n  </head>`);
  }
  return next;
}

export function businessJsonLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: defaultSite.businessName,
    telephone: ["+94773928215", "+94777241958"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nelliady",
      addressRegion: "Jaffna",
      addressCountry: "LK",
    },
  }).replaceAll("<", "\\u003c");
}

export function documentMeta() {
  return defaultDocumentMeta;
}
