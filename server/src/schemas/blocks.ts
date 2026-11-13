import { z } from "zod";

const localePair = z.object({
  en: z.record(z.string()).default({}),
  ta: z.record(z.string()).default({}),
});

const serviceItem = z
  .object({
    href: z.string().default(""),
    icon: z.string().default(""),
    en: z.object({ title: z.string().default(""), text: z.string().default("") }).default({}),
    ta: z.object({ title: z.string().default(""), text: z.string().default("") }).default({}),
  })
  .passthrough();

const slide = z
  .object({
    mediaId: z.string().nullable().optional(),
    href: z.string().default(""),
    en: z.object({ heading: z.string().default("") }).default({}),
    ta: z.object({ heading: z.string().default("") }).default({}),
  })
  .passthrough();

const statisticItem = z
  .object({
    valueSource: z.enum(["setting", "literal"]).default("setting"),
    settingKey: z.string().optional(),
    literalValue: z.union([z.string(), z.number()]).optional(),
    en: z.object({ label: z.string().default("") }).default({}),
    ta: z.object({ label: z.string().default("") }).default({}),
  })
  .passthrough();

const column = z
  .object({
    mediaId: z.string().nullable().optional(),
    en: z.object({ heading: z.string().default(""), body: z.string().default("") }).default({}),
    ta: z.object({ heading: z.string().default(""), body: z.string().default("") }).default({}),
  })
  .passthrough();

export const heroContentSchema = z
  .object({
    mediaType: z.enum(["image", "video", "slider"]).default("image"),
    mediaIds: z.array(z.string()).default([]),
    autoplay: z.boolean().default(false),
    mute: z.boolean().default(true),
    loop: z.boolean().default(false),
    primaryHref: z.string().default(""),
    secondaryHref: z.string().default(""),
    en: z
      .object({
        heading: z.string().default(""),
        subheading: z.string().default(""),
        body: z.string().default(""),
        primaryLabel: z.string().default(""),
        secondaryLabel: z.string().default(""),
      })
      .default({}),
    ta: z
      .object({
        heading: z.string().default(""),
        subheading: z.string().default(""),
        body: z.string().default(""),
        primaryLabel: z.string().default(""),
        secondaryLabel: z.string().default(""),
      })
      .default({}),
  })
  .passthrough();

export const videoHeroContentSchema = z
  .object({
    sourceType: z.enum(["upload", "youtube"]).default("youtube"),
    mediaId: z.string().nullable().optional(),
    youtubeUrl: z.string().default(""),
    posterId: z.string().nullable().optional(),
    mute: z.boolean().default(true),
    loop: z.boolean().default(false),
    en: z.object({ heading: z.string().default(""), subheading: z.string().default("") }).default({}),
    ta: z.object({ heading: z.string().default(""), subheading: z.string().default("") }).default({}),
  })
  .passthrough();

export const imageSliderContentSchema = z
  .object({
    autoplay: z.boolean().default(false),
    intervalMs: z.number().default(5000),
    slides: z.array(slide).default([]),
  })
  .passthrough();

export const textContentSchema = localePair.extend({
  en: z.object({ heading: z.string().default(""), body: z.string().default("") }).default({}),
  ta: z.object({ heading: z.string().default(""), body: z.string().default("") }).default({}),
});

export const imageContentSchema = z
  .object({
    mediaId: z.string().nullable().optional(),
    href: z.string().default(""),
    en: z.object({ caption: z.string().default("") }).default({}),
    ta: z.object({ caption: z.string().default("") }).default({}),
  })
  .passthrough();

export const galleryContentSchema = z
  .object({
    albumId: z.string().nullable().optional(),
    mediaIds: z.array(z.string()).default([]),
    layout: z.enum(["masonry"]).default("masonry"),
    en: z.object({ heading: z.string().default("") }).default({}),
    ta: z.object({ heading: z.string().default("") }).default({}),
  })
  .passthrough();

export const videoGalleryContentSchema = z
  .object({
    collectionId: z.string().nullable().optional(),
    videoIds: z.array(z.string()).default([]),
    en: z.object({ heading: z.string().default("") }).default({}),
    ta: z.object({ heading: z.string().default("") }).default({}),
  })
  .passthrough();

export const servicesContentSchema = z
  .object({
    items: z.array(serviceItem).default([]),
    en: z.object({ heading: z.string().default("") }).default({}),
    ta: z.object({ heading: z.string().default("") }).default({}),
  })
  .passthrough();

export const productGridContentSchema = z
  .object({
    catalogue: z.enum(["printing", "gifts"]).default("printing"),
    categoryId: z.string().nullable().optional(),
    featuredOnly: z.boolean().default(false),
    limit: z.number().default(12),
    en: z.object({ heading: z.string().default("") }).default({}),
    ta: z.object({ heading: z.string().default("") }).default({}),
  })
  .passthrough();

export const liveEventsContentSchema = z
  .object({
    mode: z.enum(["featured", "upcoming", "past"]).default("upcoming"),
    limit: z.number().default(6),
    en: z.object({ heading: z.string().default("") }).default({}),
    ta: z.object({ heading: z.string().default("") }).default({}),
  })
  .passthrough();

export const testimonialsContentSchema = z
  .object({
    featuredOnly: z.boolean().default(false),
    limit: z.number().default(3),
    en: z.object({ heading: z.string().default("") }).default({}),
    ta: z.object({ heading: z.string().default("") }).default({}),
  })
  .passthrough();

export const statisticsContentSchema = z
  .object({
    items: z.array(statisticItem).default([]),
  })
  .passthrough();

export const faqContentSchema = z
  .object({
    limit: z.number().default(20),
    en: z.object({ heading: z.string().default("") }).default({}),
    ta: z.object({ heading: z.string().default("") }).default({}),
  })
  .passthrough();

export const contactFormContentSchema = z
  .object({
    purpose: z.enum(["contact", "booking"]).default("contact"),
    showPhone: z.boolean().default(true),
    showWhatsapp: z.boolean().default(true),
    showMap: z.boolean().default(true),
    showHours: z.boolean().default(true),
    en: z.object({ heading: z.string().default(""), intro: z.string().default("") }).default({}),
    ta: z.object({ heading: z.string().default(""), intro: z.string().default("") }).default({}),
  })
  .passthrough();

export const ctaContentSchema = z
  .object({
    href: z.string().default(""),
    en: z
      .object({ heading: z.string().default(""), body: z.string().default(""), buttonLabel: z.string().default("") })
      .default({}),
    ta: z
      .object({ heading: z.string().default(""), body: z.string().default(""), buttonLabel: z.string().default("") })
      .default({}),
  })
  .passthrough();

export const customLayoutContentSchema = z
  .object({
    columns: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
    columnContent: z.array(column).default([]),
  })
  .passthrough();

export const blockSchemas = {
  hero: heroContentSchema,
  video_hero: videoHeroContentSchema,
  image_slider: imageSliderContentSchema,
  text: textContentSchema,
  image: imageContentSchema,
  gallery: galleryContentSchema,
  video_gallery: videoGalleryContentSchema,
  services: servicesContentSchema,
  product_grid: productGridContentSchema,
  live_events: liveEventsContentSchema,
  testimonials: testimonialsContentSchema,
  statistics: statisticsContentSchema,
  faq: faqContentSchema,
  contact_form: contactFormContentSchema,
  cta: ctaContentSchema,
  custom_layout: customLayoutContentSchema,
} as const;

export type BlockType = keyof typeof blockSchemas;

export const blockTypeSchema = z.enum([
  "hero",
  "video_hero",
  "image_slider",
  "text",
  "image",
  "gallery",
  "video_gallery",
  "services",
  "product_grid",
  "live_events",
  "testimonials",
  "statistics",
  "faq",
  "contact_form",
  "cta",
  "custom_layout",
]);

export const sectionStyleSchema = z
  .object({
    background: z.string().optional(),
    spacing: z.string().optional(),
    alignment: z.enum(["left", "center", "right"]).optional(),
  })
  .passthrough()
  .default({});

export const sectionAnimationSchema = z
  .object({
    type: z.enum(["none", "fade", "rise"]).default("fade"),
  })
  .passthrough()
  .default({});

export function parseSectionContent(blockType: string, content: unknown) {
  if (!(blockType in blockSchemas)) return null;
  const schema = blockSchemas[blockType as BlockType];
  const parsed = schema.safeParse(content ?? {});
  if (!parsed.success) return null;
  return parsed.data;
}
