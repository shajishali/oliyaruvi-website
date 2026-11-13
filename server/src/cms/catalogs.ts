import { z } from "zod";
import { getAnonClient } from "../db/client";
import {
  defaultGiftCategories,
  defaultLiveChannels,
  defaultPhotoCategories,
  defaultPrintingCategories,
  defaultVideoCategories,
} from "./catalog-defaults";
import {
  readAlbumFromStore,
  readAlbumsFromStore,
  readLiveChannelsFromStore,
  readLiveEventsFromStore,
  readProductsFromStore,
  readVideosFromStore,
} from "./store-catalog";
import { readStore } from "./store";

const empty = { source: "defaults" as const };

export {
  defaultGiftCategories,
  defaultLiveChannels,
  defaultPhotoCategories,
  defaultPrintingCategories,
  defaultVideoCategories,
};

export async function readPhotoCategories() {
  const stored = readStore()
    .photoCategories.filter((item) => item.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      sortOrder: item.sortOrder,
      nameEn: item.nameEn,
      nameTa: item.nameTa,
    }));
  if (stored.length > 0) return { source: "store" as const, categories: stored };
  const client = getAnonClient();
  if (!client) return { ...empty, categories: defaultPhotoCategories };
  const { data, error } = await client
    .from("photo_categories")
    .select("id, slug, sort_order, name_en, name_ta")
    .eq("is_visible", true)
    .order("sort_order");
  if (error) throw error;
  return {
    source: "database" as const,
    categories: (data ?? []).map((row) => ({
      id: row.id as string,
      slug: row.slug as string,
      sortOrder: row.sort_order as number,
      nameEn: row.name_en as string,
      nameTa: (row.name_ta as string) || "",
    })),
  };
}

export async function readAlbums(categorySlug?: string) {
  const stored = readAlbumsFromStore(categorySlug);
  if (stored.length > 0) return { source: "store" as const, albums: stored };
  const client = getAnonClient();
  if (!client) return { ...empty, albums: [] as Album[] };
  const { data, error } = await client
    .from("photo_albums")
    .select(
      "id, slug, title_en, title_ta, description_en, description_ta, sort_order, is_featured, cover_media_id, category_id, photo_categories(slug, name_en, name_ta)",
    )
    .eq("is_visible", true)
    .is("deleted_at", null)
    .order("sort_order");
  if (error) throw error;
  let albums = (data ?? []).map(mapAlbum);
  if (categorySlug) albums = albums.filter((album) => album.categorySlug === categorySlug);
  return { source: "database" as const, albums };
}

export async function readAlbum(slug: string) {
  const stored = readAlbumFromStore(slug);
  if (stored) return { source: "store" as const, album: stored };
  const client = getAnonClient();
  if (!client) return null;
  const { data, error } = await client
    .from("photo_albums")
    .select(
      "id, slug, title_en, title_ta, description_en, description_ta, sort_order, is_featured, cover_media_id, category_id, photo_categories(slug, name_en, name_ta)",
    )
    .eq("slug", slug)
    .eq("is_visible", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: photos, error: photoError } = await client
    .from("photographs")
    .select("id, sort_order, caption_en, caption_ta, media_id, media_assets(storage_path, alt_en, alt_ta, width, height)")
    .eq("album_id", data.id)
    .eq("is_visible", true)
    .order("sort_order");
  if (photoError) throw photoError;

  return {
    source: "database" as const,
    album: {
      ...mapAlbum(data),
      photographs: (photos ?? []).map((photo) => {
        const media = firstJoin(photo.media_assets as JoinMedia);
        return {
          id: photo.id as string,
          sortOrder: photo.sort_order as number,
          captionEn: (photo.caption_en as string) || "",
          captionTa: (photo.caption_ta as string) || "",
          mediaId: photo.media_id as string,
          url: media ? publicMediaUrl(media.storage_path) : null,
          altEn: media?.alt_en || "",
          altTa: media?.alt_ta || "",
          width: media?.width ?? null,
          height: media?.height ?? null,
        };
      }),
    },
  };
}

export async function readVideoCategories() {
  const stored = readStore()
    .videoCategories.filter((item) => item.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      sortOrder: item.sortOrder,
      nameEn: item.nameEn,
      nameTa: item.nameTa,
    }));
  if (stored.length > 0) return { source: "store" as const, categories: stored };
  const client = getAnonClient();
  if (!client) return { ...empty, categories: defaultVideoCategories };
  const { data, error } = await client
    .from("video_categories")
    .select("id, slug, sort_order, name_en, name_ta")
    .eq("is_visible", true)
    .order("sort_order");
  if (error) throw error;
  return {
    source: "database" as const,
    categories: (data ?? []).map((row) => ({
      id: row.id as string,
      slug: row.slug as string,
      sortOrder: row.sort_order as number,
      nameEn: row.name_en as string,
      nameTa: (row.name_ta as string) || "",
    })),
  };
}

export async function readVideos() {
  const stored = readVideosFromStore();
  if (stored.length > 0) return { source: "store" as const, videos: stored };
  const client = getAnonClient();
  if (!client) return { ...empty, videos: [] as Video[] };
  const { data, error } = await client
    .from("videos")
    .select(
      "id, title_en, title_ta, description_en, description_ta, source_type, youtube_url, duration_seconds, sort_order, is_featured, collection_id, video_collections!inner(is_visible, slug, title_en, category_id, video_categories(slug, name_en))",
    )
    .eq("is_visible", true)
    .order("sort_order");
  if (error) throw error;
  return {
    source: "database" as const,
    videos: (data ?? [])
      .filter((row) => Boolean((row.video_collections as { is_visible?: boolean })?.is_visible))
      .map(mapVideo),
  };
}

export async function readLiveChannels() {
  const stored = readLiveChannelsFromStore();
  if (stored.length > 0) return { source: "store" as const, channels: stored };
  const client = getAnonClient();
  if (!client) return { ...empty, channels: defaultLiveChannels };
  const { data, error } = await client
    .from("live_channels")
    .select("id, key, kind, name_en, name_ta, description_en, description_ta, external_url, sort_order")
    .eq("is_visible", true)
    .order("sort_order");
  if (error) throw error;
  return {
    source: "database" as const,
    channels: (data ?? []).map((row) => ({
      id: row.id as string,
      key: row.key as string,
      kind: row.kind as "platform" | "identity",
      nameEn: row.name_en as string,
      nameTa: (row.name_ta as string) || "",
      descriptionEn: (row.description_en as string) || "",
      descriptionTa: (row.description_ta as string) || "",
      externalUrl: (row.external_url as string | null) ?? null,
      sortOrder: row.sort_order as number,
    })),
  };
}

export async function readLiveEvents() {
  const stored = readLiveEventsFromStore();
  if (stored.length > 0) return { source: "store" as const, events: stored };
  const client = getAnonClient();
  if (!client) return { ...empty, events: [] as LiveEvent[] };
  const { data, error } = await client
    .from("live_events")
    .select(
      "id, title_en, title_ta, description_en, description_ta, starts_at, ends_at, status, status_source, is_featured, replay_url, channel_id, live_channels(key, name_en, kind), event_broadcast_links(id, platform, url, label_en, label_ta, sort_order)",
    )
    .eq("is_published", true)
    .is("deleted_at", null)
    .neq("status", "draft")
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return {
    source: "database" as const,
    events: (data ?? []).map(mapLiveEvent),
  };
}

export async function readProductCategories(catalogue?: "printing" | "gifts") {
  const stored = readStore()
    .productCategories.filter((item) => item.isVisible)
    .filter((item) => (catalogue ? item.catalogue === catalogue : true))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      id: item.id,
      catalogue: item.catalogue,
      slug: item.slug,
      sortOrder: item.sortOrder,
      nameEn: item.nameEn,
      nameTa: item.nameTa,
      descriptionEn: item.descriptionEn,
      descriptionTa: item.descriptionTa,
    }));
  if (stored.length > 0) return { source: "store" as const, categories: stored };
  const client = getAnonClient();
  if (!client) {
    const categories =
      catalogue === "gifts"
        ? defaultGiftCategories
        : catalogue === "printing"
          ? defaultPrintingCategories
          : [...defaultPrintingCategories, ...defaultGiftCategories];
    return { ...empty, categories };
  }
  let query = client
    .from("product_categories")
    .select("id, catalogue, slug, sort_order, name_en, name_ta, description_en, description_ta")
    .eq("is_visible", true)
    .order("sort_order");
  if (catalogue) query = query.eq("catalogue", catalogue);
  const { data, error } = await query;
  if (error) throw error;
  return {
    source: "database" as const,
    categories: (data ?? []).map((row) => ({
      id: row.id as string,
      catalogue: row.catalogue as "printing" | "gifts",
      slug: row.slug as string,
      sortOrder: row.sort_order as number,
      nameEn: row.name_en as string,
      nameTa: (row.name_ta as string) || "",
      descriptionEn: (row.description_en as string) || "",
      descriptionTa: (row.description_ta as string) || "",
    })),
  };
}

export async function readProducts(options: {
  catalogue?: "printing" | "gifts";
  featuredOnly?: boolean;
  categoryId?: string;
  limit?: number;
}) {
  const stored = readProductsFromStore(options);
  if (stored.length > 0) return { source: "store" as const, products: stored };
  const client = getAnonClient();
  if (!client) return { ...empty, products: [] as Product[] };
  let query = client
    .from("products")
    .select(
      "id, slug, name_en, name_ta, description_en, description_ta, enquiry_label_en, enquiry_label_ta, sort_order, is_featured, show_price, category_id, product_categories!inner(catalogue, slug, name_en, is_visible), product_variants(id, name_en, name_ta, size, material, price_lkr, is_available, sort_order), product_media(sort_order, media_id, media_assets(storage_path, alt_en, alt_ta))",
    )
    .eq("is_available", true)
    .is("deleted_at", null)
    .order("sort_order");
  if (options.featuredOnly) query = query.eq("is_featured", true);
  if (options.categoryId) query = query.eq("category_id", options.categoryId);
  const { data, error } = await query;
  if (error) throw error;
  let products = (data ?? [])
    .filter((row) => Boolean((row.product_categories as { is_visible?: boolean })?.is_visible))
    .map(mapProduct);
  if (options.catalogue) products = products.filter((product) => product.catalogue === options.catalogue);
  if (options.limit) products = products.slice(0, options.limit);
  return { source: "database" as const, products };
}

export async function readProduct(slug: string) {
  const result = await readProducts({});
  const product = result.products.find((item) => item.slug === slug);
  if (!product) return null;
  return { source: result.source, product };
}

export async function readTestimonials(featuredOnly = false, limit = 20) {
  const { readStore } = await import("./store");
  const stored = readStore()
    .testimonials.filter((item) => item.isVisible)
    .filter((item) => (featuredOnly ? item.isFeatured : true))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      personName: item.personName,
      locationLabel: item.locationLabel,
      quoteEn: item.quoteEn,
      quoteTa: item.quoteTa,
      isFeatured: item.isFeatured,
      sortOrder: item.sortOrder,
    }));
  if (stored.length > 0) return { source: "store" as const, testimonials: stored };

  const client = getAnonClient();
  if (!client) return { ...empty, testimonials: [] as Testimonial[] };
  let query = client
    .from("testimonials")
    .select("id, person_name, location_label, quote_en, quote_ta, is_featured, sort_order")
    .eq("is_visible", true)
    .order("sort_order");
  if (featuredOnly) query = query.eq("is_featured", true);
  const { data, error } = await query.limit(limit);
  if (error) throw error;
  return {
    source: "database" as const,
    testimonials: (data ?? []).map((row) => ({
      id: row.id as string,
      personName: row.person_name as string,
      locationLabel: (row.location_label as string) || "",
      quoteEn: row.quote_en as string,
      quoteTa: (row.quote_ta as string) || "",
      isFeatured: row.is_featured as boolean,
      sortOrder: row.sort_order as number,
    })),
  };
}

export async function readFaqs(limit = 20) {
  const { readStore } = await import("./store");
  const stored = readStore()
    .faqs.filter((item) => item.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      questionEn: item.questionEn,
      questionTa: item.questionTa,
      answerEn: item.answerEn,
      answerTa: item.answerTa,
      sortOrder: item.sortOrder,
    }));
  if (stored.length > 0) return { source: "store" as const, faqs: stored };

  const client = getAnonClient();
  if (!client) return { ...empty, faqs: [] as Faq[] };
  const { data, error } = await client
    .from("faqs")
    .select("id, question_en, question_ta, answer_en, answer_ta, sort_order")
    .eq("is_visible", true)
    .order("sort_order")
    .limit(limit);
  if (error) throw error;
  return {
    source: "database" as const,
    faqs: (data ?? []).map((row) => ({
      id: row.id as string,
      questionEn: row.question_en as string,
      questionTa: (row.question_ta as string) || "",
      answerEn: row.answer_en as string,
      answerTa: (row.answer_ta as string) || "",
      sortOrder: row.sort_order as number,
    })),
  };
}

type JoinMedia = { storage_path: string; alt_en?: string; alt_ta?: string; width?: number | null; height?: number | null } | { storage_path: string; alt_en?: string; alt_ta?: string; width?: number | null; height?: number | null }[] | null;

type Album = {
  id: string;
  slug: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  sortOrder: number;
  isFeatured: boolean;
  coverMediaId: string | null;
  categoryId: string;
  categorySlug: string;
  categoryNameEn: string;
  categoryNameTa: string;
};

type Video = {
  id: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  sourceType: "youtube" | "upload";
  youtubeUrl: string | null;
  durationSeconds: number | null;
  sortOrder: number;
  isFeatured: boolean;
  collectionSlug: string;
  categorySlug: string;
  categoryNameEn: string;
};

type LiveEvent = {
  id: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  startsAt: string | null;
  endsAt: string | null;
  status: "upcoming" | "live" | "ended";
  statusSource: "manual" | "provider";
  isFeatured: boolean;
  replayUrl: string | null;
  channelKey: string | null;
  channelNameEn: string | null;
  channelKind: "platform" | "identity" | null;
  links: { id: string; platform: string; url: string; labelEn: string; labelTa: string }[];
};

type Product = {
  id: string;
  slug: string;
  nameEn: string;
  nameTa: string;
  descriptionEn: string;
  descriptionTa: string;
  enquiryLabelEn: string;
  enquiryLabelTa: string;
  sortOrder: number;
  isFeatured: boolean;
  showPrice: boolean;
  catalogue: "printing" | "gifts";
  categorySlug: string;
  categoryNameEn: string;
  variants: {
    id: string;
    nameEn: string;
    nameTa: string;
    size: string;
    material: string;
    priceLkr: number | null;
  }[];
  images: { mediaId: string; url: string | null; altEn: string; altTa: string }[];
};

type Testimonial = {
  id: string;
  personName: string;
  locationLabel: string;
  quoteEn: string;
  quoteTa: string;
  isFeatured: boolean;
  sortOrder: number;
};

type Faq = {
  id: string;
  questionEn: string;
  questionTa: string;
  answerEn: string;
  answerTa: string;
  sortOrder: number;
};

function mapAlbum(row: Record<string, unknown>): Album {
  const category = firstJoin(row.photo_categories as { slug: string; name_en: string; name_ta?: string } | { slug: string; name_en: string; name_ta?: string }[] | null);
  return {
    id: row.id as string,
    slug: row.slug as string,
    titleEn: row.title_en as string,
    titleTa: (row.title_ta as string) || "",
    descriptionEn: (row.description_en as string) || "",
    descriptionTa: (row.description_ta as string) || "",
    sortOrder: row.sort_order as number,
    isFeatured: row.is_featured as boolean,
    coverMediaId: (row.cover_media_id as string | null) ?? null,
    categoryId: row.category_id as string,
    categorySlug: category?.slug || "",
    categoryNameEn: category?.name_en || "",
    categoryNameTa: category?.name_ta || "",
  };
}

function mapVideo(row: Record<string, unknown>): Video {
  const collection = firstJoin(
    row.video_collections as
      | { slug: string; title_en: string; video_categories?: { slug: string; name_en: string } | { slug: string; name_en: string }[] }
      | { slug: string; title_en: string; video_categories?: { slug: string; name_en: string } | { slug: string; name_en: string }[] }[]
      | null,
  );
  const category = firstJoin(collection?.video_categories ?? null);
  return {
    id: row.id as string,
    titleEn: row.title_en as string,
    titleTa: (row.title_ta as string) || "",
    descriptionEn: (row.description_en as string) || "",
    descriptionTa: (row.description_ta as string) || "",
    sourceType: row.source_type as "youtube" | "upload",
    youtubeUrl: (row.youtube_url as string | null) ?? null,
    durationSeconds: (row.duration_seconds as number | null) ?? null,
    sortOrder: row.sort_order as number,
    isFeatured: row.is_featured as boolean,
    collectionSlug: collection?.slug || "",
    categorySlug: category?.slug || "",
    categoryNameEn: category?.name_en || "",
  };
}

function mapLiveEvent(row: Record<string, unknown>): LiveEvent {
  const channel = firstJoin(row.live_channels as { key: string; name_en: string; kind: "platform" | "identity" } | { key: string; name_en: string; kind: "platform" | "identity" }[] | null);
  const links = z
    .array(
      z.object({
        id: z.string(),
        platform: z.string(),
        url: z.string(),
        label_en: z.string().optional(),
        label_ta: z.string().optional(),
        sort_order: z.number().optional(),
      }),
    )
    .parse(row.event_broadcast_links ?? [])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((link) => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
      labelEn: link.label_en || "",
      labelTa: link.label_ta || "",
    }));
  return {
    id: row.id as string,
    titleEn: row.title_en as string,
    titleTa: (row.title_ta as string) || "",
    descriptionEn: (row.description_en as string) || "",
    descriptionTa: (row.description_ta as string) || "",
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    status: row.status as "upcoming" | "live" | "ended",
    statusSource: row.status_source as "manual" | "provider",
    isFeatured: row.is_featured as boolean,
    replayUrl: (row.replay_url as string | null) ?? null,
    channelKey: channel?.key ?? null,
    channelNameEn: channel?.name_en ?? null,
    channelKind: channel?.kind ?? null,
    links,
  };
}

function mapProduct(row: Record<string, unknown>): Product {
  const category = firstJoin(
    row.product_categories as { catalogue: "printing" | "gifts"; slug: string; name_en: string } | { catalogue: "printing" | "gifts"; slug: string; name_en: string }[] | null,
  );
  const variants = z
    .array(
      z.object({
        id: z.string(),
        name_en: z.string().optional(),
        name_ta: z.string().optional(),
        size: z.string().optional(),
        material: z.string().optional(),
        price_lkr: z.number().nullable().optional(),
        is_available: z.boolean().optional(),
        sort_order: z.number().optional(),
      }),
    )
    .parse(row.product_variants ?? [])
    .filter((variant) => variant.is_available !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((variant) => ({
      id: variant.id,
      nameEn: variant.name_en || "",
      nameTa: variant.name_ta || "",
      size: variant.size || "",
      material: variant.material || "",
      priceLkr: variant.price_lkr ?? null,
    }));
  const images = z
    .array(
      z.object({
        sort_order: z.number().optional(),
        media_id: z.string(),
        media_assets: z
          .object({
            storage_path: z.string(),
            alt_en: z.string().optional(),
            alt_ta: z.string().optional(),
          })
          .nullable()
          .or(
            z.array(
              z.object({
                storage_path: z.string(),
                alt_en: z.string().optional(),
                alt_ta: z.string().optional(),
              }),
            ),
          )
          .optional(),
      }),
    )
    .parse(row.product_media ?? [])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((item) => {
      const media = firstJoin(item.media_assets ?? null);
      return {
        mediaId: item.media_id,
        url: media ? publicMediaUrl(media.storage_path) : null,
        altEn: media?.alt_en || "",
        altTa: media?.alt_ta || "",
      };
    });
  return {
    id: row.id as string,
    slug: row.slug as string,
    nameEn: row.name_en as string,
    nameTa: (row.name_ta as string) || "",
    descriptionEn: (row.description_en as string) || "",
    descriptionTa: (row.description_ta as string) || "",
    enquiryLabelEn: (row.enquiry_label_en as string) || "",
    enquiryLabelTa: (row.enquiry_label_ta as string) || "",
    sortOrder: row.sort_order as number,
    isFeatured: row.is_featured as boolean,
    showPrice: row.show_price as boolean,
    catalogue: category?.catalogue || "printing",
    categorySlug: category?.slug || "",
    categoryNameEn: category?.name_en || "",
    variants,
    images,
  };
}

function firstJoin<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function publicMediaUrl(storagePath: string) {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/media-public/${storagePath}`;
}
