import { defaultDocumentMeta } from "./cms/defaults";
import { businessJsonLdFromSettings, pageDocumentMeta } from "./cms/seo";

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
  meta: { title: string; description: string; canonical: string; ogImage?: string | null },
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
  } else {
    next = next.replace("</head>", `    <meta name="description" content="${description}" />\n  </head>`);
  }
  if (next.includes('rel="canonical"')) {
    next = next.replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${canonical}" />`,
    );
  } else {
    next = next.replace("</head>", `    <link rel="canonical" href="${canonical}" />\n  </head>`);
  }
  const ogTags = [
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
  ];
  if (meta.ogImage) {
    const image = escapeHtml(
      meta.ogImage.startsWith("http") ? meta.ogImage : new URL(meta.ogImage, canonicalUrl("/")).href,
    );
    ogTags.push(`<meta property="og:image" content="${image}" />`);
  }
  next = next.replace("</head>", `    ${ogTags.join("\n    ")}\n  </head>`);
  return next;
}

export function businessJsonLd() {
  return businessJsonLdFromSettings();
}

export function documentMeta(pathname = "/") {
  return pageDocumentMeta(pathname);
}

export { defaultDocumentMeta };
