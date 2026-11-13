import { randomUUID } from "crypto";
import { z } from "zod";
import type { VerifiedAdmin } from "../auth/access";
import { clearPublicCache } from "./cache";
import { writeAudit } from "./audit";
import { blockTypeSchema, parseSectionContent, sectionAnimationSchema, sectionStyleSchema } from "../schemas/blocks";
import type { PublicSection } from "./pages";
import { mutateStore, readStore } from "./store";
import type { StoredPage } from "./store-types";

const seoSchema = z.object({
  en: z.object({ title: z.string(), description: z.string() }),
  ta: z.object({ title: z.string(), description: z.string() }),
});

const sectionInputSchema = z.object({
  id: z.string().optional(),
  blockType: blockTypeSchema,
  sortOrder: z.number().int().min(0),
  isVisible: z.boolean().default(true),
  content: z.unknown(),
  style: z.unknown().optional(),
  animation: z.unknown().optional(),
});

function normalizeSections(raw: unknown[]): PublicSection[] {
  return raw.map((item, index) => {
    const parsed = sectionInputSchema.parse(item);
    const content = parseSectionContent(parsed.blockType, parsed.content);
    if (!content) throw new Error(`Invalid content for ${parsed.blockType}`);
    const style = sectionStyleSchema.parse(parsed.style ?? {});
    const animation = sectionAnimationSchema.parse(parsed.animation ?? { type: "fade" });
    return {
      id: parsed.id || randomUUID(),
      blockType: parsed.blockType,
      sortOrder: parsed.sortOrder ?? index,
      isVisible: parsed.isVisible,
      content: content as Record<string, unknown>,
      style,
      animation,
    };
  });
}

export function listPages() {
  return Object.values(readStore().pages)
    .filter((page) => !page.deletedAt)
    .map((page) => summarize(page))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getPageAdmin(idOrSlug: string) {
  const page = findPage(idOrSlug);
  if (!page || page.deletedAt) return null;
  return {
    ...summarize(page),
    draft: page.draft,
    published: page.published,
    history: page.history,
  };
}

export function createPage(admin: VerifiedAdmin, input: { slug: string; titleEn?: string; titleTa?: string }) {
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (!slug) throw new Error("Slug is required");
  const store = readStore();
  if (Object.values(store.pages).some((page) => page.slug === slug && !page.deletedAt)) {
    throw new Error("Slug already exists");
  }
  const now = new Date().toISOString();
  const page: StoredPage = {
    id: randomUUID(),
    slug,
    deletedAt: null,
    seo: {
      en: { title: input.titleEn || slug, description: "" },
      ta: { title: input.titleTa || "", description: "" },
    },
    draft: {
      version: 1,
      sections: [],
      createdAt: now,
      createdBy: admin.userId,
    },
    published: null,
    history: [],
  };
  mutateStore((next) => {
    next.pages[page.id] = page;
  });
  writeAudit(admin, "create", "page", page.id, `Created page ${slug}`);
  return getPageAdmin(page.id);
}

export function duplicatePage(admin: VerifiedAdmin, idOrSlug: string) {
  const source = findPage(idOrSlug);
  if (!source || source.deletedAt) return null;
  const slug = uniqueSlug(`${source.slug}-copy`);
  const now = new Date().toISOString();
  const page: StoredPage = {
    id: randomUUID(),
    slug,
    deletedAt: null,
    seo: structuredClone(source.seo),
    draft: {
      version: 1,
      sections: structuredClone(source.draft?.sections ?? source.published?.sections ?? []),
      createdAt: now,
      createdBy: admin.userId,
    },
    published: null,
    history: [],
  };
  mutateStore((next) => {
    next.pages[page.id] = page;
  });
  writeAudit(admin, "duplicate", "page", page.id, `Duplicated page ${source.slug} as ${slug}`);
  return getPageAdmin(page.id);
}

export function updatePageMeta(
  admin: VerifiedAdmin,
  idOrSlug: string,
  input: { slug?: string; seo?: unknown },
) {
  const page = findPage(idOrSlug);
  if (!page || page.deletedAt) return null;
  mutateStore((store) => {
    const target = store.pages[page.id];
    if (input.slug) {
      const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
      if (
        Object.values(store.pages).some(
          (candidate) => candidate.id !== page.id && candidate.slug === slug && !candidate.deletedAt,
        )
      ) {
        throw new Error("Slug already exists");
      }
      target.slug = slug;
    }
    if (input.seo) target.seo = seoSchema.parse(input.seo);
  });
  writeAudit(admin, "update", "page", page.id, `Updated page meta ${page.slug}`);
  clearPublicCache();
  return getPageAdmin(page.id);
}

export function saveDraft(admin: VerifiedAdmin, idOrSlug: string, sectionsRaw: unknown) {
  const page = findPage(idOrSlug);
  if (!page || page.deletedAt) return null;
  const sections = normalizeSections(z.array(z.unknown()).parse(sectionsRaw));
  mutateStore((store) => {
    const target = store.pages[page.id];
    const version = (target.draft?.version ?? target.published?.version ?? 0) + (target.draft ? 0 : 1);
    target.draft = {
      version: target.draft?.version ?? version,
      sections,
      createdAt: new Date().toISOString(),
      createdBy: admin.userId,
    };
  });
  writeAudit(admin, "save_draft", "page", page.id, `Saved draft for ${page.slug}`);
  return getPageAdmin(page.id);
}

export function reorderSections(admin: VerifiedAdmin, idOrSlug: string, orderedIds: string[]) {
  const page = findPage(idOrSlug);
  if (!page || page.deletedAt || !page.draft) return null;
  mutateStore((store) => {
    const target = store.pages[page.id];
    if (!target.draft) return;
    const byId = new Map(target.draft.sections.map((section) => [section.id, section]));
    target.draft.sections = orderedIds
      .map((id, index) => {
        const section = byId.get(id);
        if (!section) return null;
        return { ...section, sortOrder: index };
      })
      .filter((section): section is PublicSection => Boolean(section));
  });
  writeAudit(admin, "reorder", "page", page.id, `Reordered sections on ${page.slug}`);
  return getPageAdmin(page.id);
}

export function publishPage(admin: VerifiedAdmin, idOrSlug: string) {
  const page = findPage(idOrSlug);
  if (!page || page.deletedAt || !page.draft) return null;
  mutateStore((store) => {
    const target = store.pages[page.id];
    if (!target.draft) return;
    if (target.published) {
      target.history.unshift({
        ...target.published,
        createdAt: new Date().toISOString(),
        createdBy: admin.userId,
      });
      target.history = target.history.slice(0, 50);
    }
    const publishedVersion = (target.published?.version ?? 0) + 1;
    target.published = {
      version: publishedVersion,
      sections: structuredClone(target.draft.sections),
      createdAt: new Date().toISOString(),
      createdBy: admin.userId,
    };
    target.draft = {
      version: publishedVersion + 1,
      sections: structuredClone(target.published.sections),
      createdAt: new Date().toISOString(),
      createdBy: admin.userId,
    };
  });
  clearPublicCache();
  writeAudit(admin, "publish", "page", page.id, `Published ${page.slug}`);
  return getPageAdmin(page.id);
}

export function unpublishPage(admin: VerifiedAdmin, idOrSlug: string) {
  const page = findPage(idOrSlug);
  if (!page || page.deletedAt) return null;
  mutateStore((store) => {
    const target = store.pages[page.id];
    if (target.published) {
      target.history.unshift({
        ...target.published,
        createdAt: new Date().toISOString(),
        createdBy: admin.userId,
      });
    }
    target.published = null;
  });
  clearPublicCache();
  writeAudit(admin, "unpublish", "page", page.id, `Unpublished ${page.slug}`);
  return getPageAdmin(page.id);
}

export function restoreVersion(admin: VerifiedAdmin, idOrSlug: string, version: number) {
  const page = findPage(idOrSlug);
  if (!page || page.deletedAt) return null;
  const snapshot =
    page.history.find((item) => item.version === version) ||
    (page.published?.version === version ? page.published : null);
  if (!snapshot) return null;
  mutateStore((store) => {
    const target = store.pages[page.id];
    const draftVersion = (target.draft?.version ?? target.published?.version ?? version) + 1;
    target.draft = {
      version: draftVersion,
      sections: structuredClone(snapshot.sections),
      createdAt: new Date().toISOString(),
      createdBy: admin.userId,
    };
  });
  writeAudit(admin, "restore", "page", page.id, `Restored ${page.slug} version ${version} into draft`);
  return getPageAdmin(page.id);
}

export function softDeletePage(admin: VerifiedAdmin, idOrSlug: string) {
  const page = findPage(idOrSlug);
  if (!page || page.deletedAt) return null;
  mutateStore((store) => {
    store.pages[page.id].deletedAt = new Date().toISOString();
  });
  clearPublicCache();
  writeAudit(admin, "delete", "page", page.id, `Soft deleted ${page.slug}`);
  return { ok: true };
}

export function restorePage(admin: VerifiedAdmin, idOrSlug: string) {
  const page = findPage(idOrSlug);
  if (!page) return null;
  mutateStore((store) => {
    store.pages[page.id].deletedAt = null;
  });
  clearPublicCache();
  writeAudit(admin, "restore_page", "page", page.id, `Restored page ${page.slug}`);
  return getPageAdmin(page.id);
}

export function publicPageFromStore(slug: string) {
  const page = Object.values(readStore().pages).find((item) => item.slug === slug && !item.deletedAt);
  if (!page?.published) return null;
  return {
    source: "store" as const,
    page: {
      slug: page.slug,
      titleEn: page.seo.en.title,
      titleTa: page.seo.ta.title,
      descriptionEn: page.seo.en.description,
      descriptionTa: page.seo.ta.description,
      sections: page.published.sections.filter((section) => section.isVisible),
    },
  };
}

function findPage(idOrSlug: string) {
  const store = readStore();
  return (
    store.pages[idOrSlug] ||
    Object.values(store.pages).find((page) => page.id === idOrSlug || page.slug === idOrSlug) ||
    null
  );
}

function summarize(page: StoredPage) {
  return {
    id: page.id,
    slug: page.slug,
    deletedAt: page.deletedAt,
    seo: page.seo,
    hasDraft: Boolean(page.draft),
    hasPublished: Boolean(page.published),
    draftVersion: page.draft?.version ?? null,
    publishedVersion: page.published?.version ?? null,
  };
}

function uniqueSlug(base: string) {
  const store = readStore();
  let slug = base;
  let index = 2;
  while (Object.values(store.pages).some((page) => page.slug === slug && !page.deletedAt)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}
