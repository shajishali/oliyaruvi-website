import type { BlockType, PublicSection } from "../../lib/types";

export function createEmptySection(blockType: BlockType, sortOrder: number): PublicSection {
  return {
    id: crypto.randomUUID(),
    blockType,
    sortOrder,
    isVisible: true,
    content: emptyContent(blockType),
    style: {},
    animation: { type: "fade" },
  };
}

function emptyContent(blockType: BlockType): Record<string, unknown> {
  switch (blockType) {
    case "hero":
      return {
        mediaType: "image",
        mediaIds: [],
        autoplay: false,
        mute: true,
        loop: false,
        primaryHref: "",
        secondaryHref: "",
        en: { heading: "New hero", subheading: "", body: "", primaryLabel: "", secondaryLabel: "" },
        ta: { heading: "", subheading: "", body: "", primaryLabel: "", secondaryLabel: "" },
      };
    case "video_hero":
      return {
        sourceType: "youtube",
        mediaId: null,
        youtubeUrl: "",
        posterId: null,
        mute: true,
        loop: false,
        en: { heading: "", subheading: "" },
        ta: { heading: "", subheading: "" },
      };
    case "image_slider":
      return { autoplay: false, intervalMs: 5000, slides: [] };
    case "text":
      return { en: { heading: "Heading", body: "" }, ta: { heading: "", body: "" } };
    case "image":
      return { mediaId: null, href: "", en: { caption: "" }, ta: { caption: "" } };
    case "gallery":
      return { albumId: null, mediaIds: [], layout: "masonry", en: { heading: "" }, ta: { heading: "" } };
    case "video_gallery":
      return { collectionId: null, videoIds: [], en: { heading: "" }, ta: { heading: "" } };
    case "services":
      return { items: [], en: { heading: "Services" }, ta: { heading: "" } };
    case "product_grid":
      return {
        catalogue: "printing",
        categoryId: null,
        featuredOnly: false,
        limit: 12,
        en: { heading: "" },
        ta: { heading: "" },
      };
    case "live_events":
      return { mode: "upcoming", limit: 6, en: { heading: "" }, ta: { heading: "" } };
    case "testimonials":
      return { featuredOnly: false, limit: 3, en: { heading: "" }, ta: { heading: "" } };
    case "statistics":
      return { items: [] };
    case "faq":
      return { limit: 20, en: { heading: "" }, ta: { heading: "" } };
    case "contact_form":
      return {
        purpose: "contact",
        showPhone: true,
        showWhatsapp: true,
        showMap: true,
        showHours: true,
        en: { heading: "", intro: "" },
        ta: { heading: "", intro: "" },
      };
    case "cta":
      return {
        href: "/contact",
        en: { heading: "Get in touch", body: "", buttonLabel: "Contact" },
        ta: { heading: "", body: "", buttonLabel: "" },
      };
    case "custom_layout":
      return { columns: 1, columnContent: [] };
  }
}
