import { z } from "zod";

export const albumSchema = z.object({
  slug: z.string().min(1),
  categoryId: z.string().min(1),
  titleEn: z.string().min(1),
  titleTa: z.string().default(""),
  descriptionEn: z.string().default(""),
  descriptionTa: z.string().default(""),
  coverMediaId: z.string().nullable().optional(),
  sortOrder: z.number().default(0),
  isFeatured: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  photographs: z
    .array(
      z.object({
        id: z.string().optional(),
        mediaId: z.string(),
        captionEn: z.string().default(""),
        captionTa: z.string().default(""),
        sortOrder: z.number().default(0),
        isVisible: z.boolean().default(true),
      }),
    )
    .default([]),
});

export const videoSchema = z.object({
  collectionId: z.string().min(1),
  titleEn: z.string().min(1),
  titleTa: z.string().default(""),
  descriptionEn: z.string().default(""),
  descriptionTa: z.string().default(""),
  sourceType: z.enum(["youtube", "upload"]),
  youtubeUrl: z.string().nullable().optional(),
  mediaId: z.string().nullable().optional(),
  thumbnailMediaId: z.string().nullable().optional(),
  durationSeconds: z.number().nullable().optional(),
  sortOrder: z.number().default(0),
  isFeatured: z.boolean().default(false),
  isVisible: z.boolean().default(true),
});

export const channelSchema = z.object({
  nameEn: z.string().min(1),
  nameTa: z.string().default(""),
  descriptionEn: z.string().default(""),
  descriptionTa: z.string().default(""),
  externalUrl: z.string().nullable().optional(),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().optional(),
});

export const liveEventSchema = z.object({
  titleEn: z.string().min(1),
  titleTa: z.string().default(""),
  descriptionEn: z.string().default(""),
  descriptionTa: z.string().default(""),
  thumbnailMediaId: z.string().nullable().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  status: z.enum(["draft", "upcoming", "live", "ended"]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  replayUrl: z.string().nullable().optional(),
  channelId: z.string().nullable().optional(),
  links: z
    .array(
      z.object({
        id: z.string().optional(),
        platform: z.string(),
        url: z.string(),
        labelEn: z.string().default(""),
        labelTa: z.string().default(""),
        sortOrder: z.number().default(0),
      }),
    )
    .default([]),
});

export const productSchema = z.object({
  slug: z.string().min(1),
  categoryId: z.string().min(1),
  nameEn: z.string().min(1),
  nameTa: z.string().default(""),
  descriptionEn: z.string().default(""),
  descriptionTa: z.string().default(""),
  enquiryLabelEn: z.string().default("Enquire"),
  enquiryLabelTa: z.string().default(""),
  sortOrder: z.number().default(0),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  showPrice: z.boolean().default(false),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        nameEn: z.string().default(""),
        nameTa: z.string().default(""),
        size: z.string().default(""),
        material: z.string().default(""),
        priceLkr: z.number().nullable().optional(),
        isAvailable: z.boolean().default(true),
        sortOrder: z.number().default(0),
      }),
    )
    .default([]),
  images: z.array(z.object({ mediaId: z.string(), sortOrder: z.number().default(0) })).default([]),
});

export const orderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(8),
  customerEmail: z.string().default(""),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]).default("unpaid"),
  productionStatus: z.enum(["queued", "in_progress", "ready", "done"]).default("queued"),
  deliveryStatus: z.enum(["none", "pickup", "out_for_delivery", "delivered"]).default("none"),
  notes: z.string().default(""),
  lines: z
    .array(
      z.object({
        id: z.string().optional(),
        productId: z.string().nullable().optional(),
        label: z.string().min(1),
        quantity: z.number().int().min(1),
        unitPriceLkr: z.number().nullable().optional(),
      }),
    )
    .min(1),
});

export const inboxStatusSchema = z.enum(["new", "reviewing", "confirmed", "declined", "closed"]);
