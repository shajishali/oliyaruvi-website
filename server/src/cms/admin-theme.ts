import { z } from "zod";
import type { VerifiedAdmin } from "../auth/access";
import { writeAudit } from "./audit";
import { clearPublicCache } from "./cache";
import { mutateStore, readStore } from "./store";
import type { StoredTheme } from "./store-types";

const themeSchema = z.object({
  tokens: z.object({
    color: z.object({
      background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      surface: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      gold: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      lightGold: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      maroon: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      muted: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    }),
    font: z.object({
      heading: z.string().min(2).max(40),
      body: z.string().min(2).max(40),
      tamil: z.string().min(2).max(40),
    }),
    radius: z.string(),
    spacing: z.string(),
  }),
  headerVariant: z.string(),
  footerVariant: z.string(),
  buttonVariant: z.string(),
});

export function getThemeAdmin() {
  const theme = readStore().theme;
  return {
    draft: theme.draft,
    published: theme.published,
  };
}

export function saveThemeDraft(admin: VerifiedAdmin, payload: unknown) {
  const parsed = themeSchema.parse(payload) as StoredTheme;
  mutateStore((store) => {
    store.theme.draft = parsed;
  });
  writeAudit(admin, "save_draft", "theme", null, "Saved theme draft");
  return getThemeAdmin();
}

export function publishTheme(admin: VerifiedAdmin) {
  mutateStore((store) => {
    if (store.theme.draft) {
      store.theme.published = structuredClone(store.theme.draft);
      store.theme.draft = null;
    }
  });
  clearPublicCache();
  writeAudit(admin, "publish", "theme", null, "Published theme");
  return getThemeAdmin();
}
