import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { ensureBusinessSlice, emptyBusinessSlice } from "./business-seed";
import { defaultNavigation, defaultSite, defaultThemeTokens } from "./defaults";
import { defaultPages } from "./default-pages";
import type { PublicPage, PublicSection } from "./pages";
import type { CmsStore, StoredPage, StoredTheme } from "./store-types";

const dataDir = path.resolve(__dirname, "../../../.data");
const storePath = path.join(dataDir, "cms-store.json");

let cache: CmsStore | null = null;

function publishedTheme(): StoredTheme {
  return {
    tokens: defaultThemeTokens as unknown as Record<string, unknown>,
    headerVariant: "studio",
    footerVariant: "studio",
    buttonVariant: "gold",
  };
}

function pageFromDefault(slug: string, page: PublicPage): StoredPage {
  const now = new Date().toISOString();
  const published: PublicSection[] = page.sections.map((section, index) => ({
    ...section,
    id: `${slug}-${section.blockType}-${index}`,
    sortOrder: index,
  }));
  return {
    id: randomUUID(),
    slug,
    deletedAt: null,
    seo: {
      en: { title: page.titleEn, description: page.descriptionEn },
      ta: { title: page.titleTa, description: page.descriptionTa },
    },
    draft: {
      version: 2,
      sections: structuredClone(published),
      createdAt: now,
      createdBy: null,
    },
    published: {
      version: 1,
      sections: structuredClone(published),
      createdAt: now,
      createdBy: null,
    },
    history: [],
  };
}

export function createEmptyStore(): CmsStore {
  const pages: Record<string, StoredPage> = {};
  for (const [slug, page] of Object.entries(defaultPages)) {
    const stored = pageFromDefault(slug, page);
    pages[stored.id] = stored;
  }
  return {
    version: 1,
    siteSettings: { ...defaultSite },
    navigation: structuredClone(defaultNavigation),
    theme: { draft: null, published: publishedTheme() },
    pages,
    media: [],
    testimonials: [],
    faqs: [],
    audit: [],
    ...emptyBusinessSlice(),
  };
}

function normalizePageKeys(store: CmsStore) {
  const next: Record<string, StoredPage> = {};
  for (const page of Object.values(store.pages)) {
    next[page.id] = page;
  }
  store.pages = next;
}

export function readStore(): CmsStore {
  if (cache) return cache;
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(storePath)) {
    cache = createEmptyStore();
    writeStore(cache);
    return cache;
  }
  const raw = fs.readFileSync(storePath, "utf8");
  const parsed = JSON.parse(raw) as CmsStore;
  const needsBusinessMigrate = !Array.isArray((parsed as { albums?: unknown }).albums);
  cache = ensureBusinessSlice(parsed);
  normalizePageKeys(cache);
  if (needsBusinessMigrate) writeStore(cache);
  return cache;
}

export function writeStore(next: CmsStore) {
  fs.mkdirSync(dataDir, { recursive: true });
  cache = next;
  fs.writeFileSync(storePath, JSON.stringify(next, null, 2), "utf8");
}

export function mutateStore(mutator: (store: CmsStore) => void) {
  const store = readStore();
  mutator(store);
  store.version += 1;
  writeStore(store);
  return store;
}

export function uploadsDir() {
  const dir = path.join(dataDir, "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function resetStoreForTests() {
  cache = createEmptyStore();
  writeStore(cache);
}
