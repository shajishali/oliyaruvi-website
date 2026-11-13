export const BLOCK_TYPES = [
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
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];
