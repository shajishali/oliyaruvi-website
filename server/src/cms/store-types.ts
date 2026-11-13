import type { BusinessStoreSlice } from "./business-types";
import type { PublicSection } from "./pages";
import type { NavItem } from "./defaults";

export type SeoLocale = {
  title: string;
  description: string;
};

export type PageRevisionSnapshot = {
  version: number;
  sections: PublicSection[];
  createdAt: string;
  createdBy: string | null;
};

export type StoredPage = {
  id: string;
  slug: string;
  deletedAt: string | null;
  seo: { en: SeoLocale; ta: SeoLocale };
  draft: PageRevisionSnapshot | null;
  published: PageRevisionSnapshot | null;
  history: PageRevisionSnapshot[];
};

export type StoredTheme = {
  tokens: Record<string, unknown>;
  headerVariant: string;
  footerVariant: string;
  buttonVariant: string;
};

export type StoredMedia = {
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
  uploadedBy: string | null;
  createdAt: string;
  deletedAt: string | null;
};

export type StoredTestimonial = {
  id: string;
  personName: string;
  locationLabel: string;
  quoteEn: string;
  quoteTa: string;
  isVisible: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

export type StoredFaq = {
  id: string;
  questionEn: string;
  questionTa: string;
  answerEn: string;
  answerTa: string;
  isVisible: boolean;
  sortOrder: number;
};

export type AuditEntry = {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  createdAt: string;
};

export type CmsStore = {
  version: number;
  siteSettings: Record<string, unknown>;
  navigation: { header: NavItem[]; footer: NavItem[] };
  theme: { draft: StoredTheme | null; published: StoredTheme };
  pages: Record<string, StoredPage>;
  media: StoredMedia[];
  testimonials: StoredTestimonial[];
  faqs: StoredFaq[];
  audit: AuditEntry[];
} & BusinessStoreSlice;
