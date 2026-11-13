import { z } from "zod";
import { getAnonClient } from "../db/client";
import { blockTypeSchema, parseSectionContent, sectionAnimationSchema, sectionStyleSchema } from "../schemas/blocks";
import { publicPageFromStore } from "./admin-pages";
import { defaultPages } from "./default-pages";

export type PublicSection = {
  id: string;
  blockType: z.infer<typeof blockTypeSchema>;
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

const sectionRowSchema = z.object({
  id: z.string(),
  block_type: z.string(),
  sort_order: z.number(),
  is_visible: z.boolean(),
  content: z.unknown(),
  style: z.unknown(),
  animation: z.unknown(),
});

export async function readPage(slug: string) {
  const fromStore = publicPageFromStore(slug);
  if (fromStore) return fromStore;

  const client = getAnonClient();
  if (!client) {
    const page = defaultPages[slug];
    if (!page) return null;
    return { source: "defaults" as const, page: stabilize(page) };
  }

  const { data: pageRow, error: pageError } = await client
    .from("pages")
    .select("id, slug")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (pageError) throw pageError;
  if (!pageRow) return null;

  const { data: revision, error: revisionError } = await client
    .from("page_revisions")
    .select("id")
    .eq("page_id", pageRow.id)
    .eq("state", "published")
    .maybeSingle();
  if (revisionError) throw revisionError;
  if (!revision) return null;

  const { data: sections, error: sectionError } = await client
    .from("page_sections")
    .select("id, block_type, sort_order, is_visible, content, style, animation")
    .eq("revision_id", revision.id)
    .eq("is_visible", true)
    .order("sort_order");
  if (sectionError) throw sectionError;

  const { data: seoRows } = await client
    .from("seo_metadata")
    .select("locale, title, description")
    .eq("page_id", pageRow.id);

  const seoEn = seoRows?.find((row) => row.locale === "en");
  const seoTa = seoRows?.find((row) => row.locale === "ta");

  const parsedSections: PublicSection[] = [];
  for (const raw of sections ?? []) {
    const row = sectionRowSchema.safeParse(raw);
    if (!row.success) {
      console.warn(`Skipping invalid section row on ${slug}`);
      continue;
    }
    const type = blockTypeSchema.safeParse(row.data.block_type);
    if (!type.success) {
      console.warn(`Skipping unknown block ${row.data.block_type} on ${slug}`);
      continue;
    }
    const content = parseSectionContent(type.data, row.data.content);
    if (!content) {
      console.warn(`Skipping invalid content for ${type.data} on ${slug}`);
      continue;
    }
    const style = sectionStyleSchema.safeParse(row.data.style);
    const animation = sectionAnimationSchema.safeParse(row.data.animation);
    parsedSections.push({
      id: row.data.id,
      blockType: type.data,
      sortOrder: row.data.sort_order,
      isVisible: row.data.is_visible,
      content: content as Record<string, unknown>,
      style: style.success ? style.data : {},
      animation: animation.success ? animation.data : { type: "fade" },
    });
  }

  return {
    source: "database" as const,
    page: {
      slug: pageRow.slug as string,
      titleEn: (seoEn?.title as string) || slug,
      titleTa: (seoTa?.title as string) || "",
      descriptionEn: (seoEn?.description as string) || "",
      descriptionTa: (seoTa?.description as string) || "",
      sections: parsedSections,
    },
  };
}

function stabilize(page: PublicPage): PublicPage {
  return {
    ...page,
    sections: page.sections.map((section, index) => ({
      ...section,
      id: `${page.slug}-${section.blockType}-${index}`,
      sortOrder: index,
    })),
  };
}
