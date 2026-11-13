import { z } from "zod";
import type { VerifiedAdmin } from "../auth/access";
import { writeAudit } from "./audit";
import { clearPublicCache } from "./cache";
import type { NavItem } from "./defaults";
import { mutateStore, readStore } from "./store";

const navItemSchema: z.ZodType<NavItem> = z.lazy(() =>
  z.object({
    labelEn: z.string(),
    labelTa: z.string(),
    href: z.string(),
    linkType: z.enum(["internal", "external"]),
    sortOrder: z.number(),
    openInNewTab: z.boolean(),
    children: z.array(navItemSchema),
  }),
);

const payloadSchema = z.object({
  header: z.array(navItemSchema),
  footer: z.array(navItemSchema),
});

export function getNavigationAdmin() {
  return readStore().navigation;
}

export function saveNavigation(admin: VerifiedAdmin, payload: unknown) {
  const parsed = payloadSchema.parse(payload);
  mutateStore((store) => {
    store.navigation = parsed;
  });
  clearPublicCache();
  writeAudit(admin, "update", "navigation", null, "Updated navigation menus");
  return getNavigationAdmin();
}
