export type SiteSettings = {
  businessName: string;
  businessNameTa: string;
  locationEn: string;
  locationTa: string;
  phonePrimary: string;
  phoneSecondary: string;
  whatsappNumber: string;
  experienceYears: number;
  addressEn: string | null;
  addressTa: string | null;
  mapUrl: string | null;
  hours: unknown;
  socialLinks: { label: string; url: string }[];
  announcementEn: string | null;
  announcementTa: string | null;
  announcementEnabled: boolean;
  contentVersion: number;
};

export type SiteResponse = {
  source: "defaults" | "database";
  settings: SiteSettings;
};

export type NavItem = {
  labelEn: string;
  labelTa: string;
  href: string;
  linkType: "internal" | "external";
  sortOrder: number;
  openInNewTab: boolean;
  children: NavItem[];
};

export type NavResponse = {
  source: "defaults" | "database";
  header: NavItem[];
  footer: NavItem[];
};

export type ThemeTokens = {
  color: {
    background: string;
    surface: string;
    gold: string;
    lightGold: string;
    maroon: string;
    text: string;
    muted: string;
  };
  font: { heading: string; body: string; tamil: string };
  radius: string;
  spacing: string;
};

export type ThemeResponse = {
  source: "defaults" | "database";
  tokens: ThemeTokens;
};

export type AdminMe = {
  id: string;
  email: string | null;
  roles: string[];
  local?: boolean;
  authMode?: "supabase" | "local";
};

export type AdminPageSummary = {
  id: string;
  slug: string;
  deletedAt: string | null;
  seo: {
    en: { title: string; description: string };
    ta: { title: string; description: string };
  };
  hasDraft: boolean;
  hasPublished: boolean;
  draftVersion: number | null;
  publishedVersion: number | null;
};

export type AdminPageDetail = AdminPageSummary & {
  draft: {
    version: number;
    sections: PublicSection[];
    createdAt: string;
    createdBy: string | null;
  } | null;
  published: {
    version: number;
    sections: PublicSection[];
    createdAt: string;
    createdBy: string | null;
  } | null;
  history: {
    version: number;
    sections: PublicSection[];
    createdAt: string;
    createdBy: string | null;
  }[];
};

export type AdminMedia = {
  id: string;
  folder: string;
  kind: "image" | "video" | "file";
  mimeType: string;
  byteSize: number;
  fileName: string;
  storagePath: string;
  altEn: string;
  altTa: string;
  title: string;
  url: string;
  createdAt: string;
};

export type BlockType =
  | "hero"
  | "video_hero"
  | "image_slider"
  | "text"
  | "image"
  | "gallery"
  | "video_gallery"
  | "services"
  | "product_grid"
  | "live_events"
  | "testimonials"
  | "statistics"
  | "faq"
  | "contact_form"
  | "cta"
  | "custom_layout";

export type PublicSection = {
  id: string;
  blockType: BlockType;
  sortOrder: number;
  isVisible: boolean;
  content: Record<string, unknown>;
  style: Record<string, unknown>;
  animation: Record<string, unknown>;
};

export type PublicPage = {
  slug: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  sections: PublicSection[];
};

export type PageResponse = {
  source: "defaults" | "database";
  page: PublicPage;
};

export type Category = {
  id: string;
  slug: string;
  sortOrder: number;
  nameEn: string;
  nameTa: string;
};

export type Album = {
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

export type Photograph = {
  id: string;
  sortOrder: number;
  captionEn: string;
  captionTa: string;
  mediaId: string;
  url: string | null;
  altEn: string;
  altTa: string;
  width: number | null;
  height: number | null;
};

export type VideoItem = {
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

export type LiveChannel = {
  id: string;
  key: string;
  kind: "platform" | "identity";
  nameEn: string;
  nameTa: string;
  descriptionEn: string;
  descriptionTa: string;
  externalUrl: string | null;
  sortOrder: number;
};

export type LiveEvent = {
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

export type ProductCategory = Category & {
  catalogue: "printing" | "gifts";
  descriptionEn: string;
  descriptionTa: string;
};

export type Product = {
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

export type Testimonial = {
  id: string;
  personName: string;
  locationLabel: string;
  quoteEn: string;
  quoteTa: string;
  isFeatured: boolean;
  sortOrder: number;
};

export type Faq = {
  id: string;
  questionEn: string;
  questionTa: string;
  answerEn: string;
  answerTa: string;
  sortOrder: number;
};
