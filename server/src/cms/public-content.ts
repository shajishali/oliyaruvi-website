import { z } from "zod";
import { getAnonClient } from "../db/client";
import {
  defaultNavigation,
  defaultSite,
  defaultThemeTokens,
  type NavItem,
} from "./defaults";
import { readStore } from "./store";

const socialSchema = z.array(z.object({ label: z.string(), url: z.string() }));

const siteRowSchema = z.object({
  business_name: z.string(),
  business_name_ta: z.string(),
  location_en: z.string(),
  location_ta: z.string(),
  phone_primary: z.string(),
  phone_secondary: z.string(),
  whatsapp_number: z.string(),
  experience_years: z.number(),
  address_en: z.string().nullable(),
  address_ta: z.string().nullable(),
  map_url: z.string().nullable(),
  hours: z.unknown().nullable(),
  social_links: z.unknown(),
  announcement_en: z.string().nullable(),
  announcement_ta: z.string().nullable(),
  announcement_enabled: z.boolean(),
  content_version: z.number(),
});

const tokensSchema = z.object({
  color: z.object({
    background: z.string(),
    surface: z.string(),
    gold: z.string(),
    lightGold: z.string(),
    maroon: z.string(),
    text: z.string(),
    muted: z.string(),
  }),
  font: z.object({
    heading: z.string(),
    body: z.string(),
    tamil: z.string(),
  }),
  radius: z.string(),
  spacing: z.string(),
});

const navRowSchema = z.object({
  id: z.string(),
  menu_id: z.string(),
  parent_id: z.string().nullable(),
  label_en: z.string(),
  label_ta: z.string(),
  href: z.string(),
  link_type: z.enum(["internal", "external"]),
  sort_order: z.number(),
  open_in_new_tab: z.boolean(),
});

export async function readSite() {
  const storeSettings = readStore().siteSettings;
  if (storeSettings && Object.keys(storeSettings).length > 0) {
    return {
      source: "store" as const,
      settings: {
        ...defaultSite,
        ...storeSettings,
      } as typeof defaultSite,
    };
  }

  const client = getAnonClient();
  if (!client) return { source: "defaults" as const, settings: defaultSite };

  const { data, error } = await client.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (!data) return { source: "defaults" as const, settings: defaultSite };

  const row = siteRowSchema.parse(data);
  const social = socialSchema.safeParse(row.social_links);
  return {
    source: "database" as const,
    settings: {
      businessName: row.business_name,
      businessNameTa: row.business_name_ta,
      locationEn: row.location_en,
      locationTa: row.location_ta,
      phonePrimary: row.phone_primary,
      phoneSecondary: row.phone_secondary,
      whatsappNumber: row.whatsapp_number,
      experienceYears: row.experience_years,
      addressEn: row.address_en,
      addressTa: row.address_ta,
      mapUrl: row.map_url,
      hours: row.hours,
      socialLinks: social.success ? social.data : [],
      announcementEn: row.announcement_en,
      announcementTa: row.announcement_ta,
      announcementEnabled: row.announcement_enabled,
      contentVersion: row.content_version,
    },
  };
}

export async function readTheme() {
  const published = readStore().theme.published;
  if (published?.tokens) {
    const parsed = tokensSchema.safeParse(published.tokens);
    return {
      source: "store" as const,
      tokens: parsed.success ? parsed.data : defaultThemeTokens,
    };
  }

  const client = getAnonClient();
  if (!client) return { source: "defaults" as const, tokens: defaultThemeTokens };

  const { data, error } = await client
    .from("theme_settings")
    .select("tokens")
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data) return { source: "defaults" as const, tokens: defaultThemeTokens };

  const parsed = tokensSchema.safeParse(data.tokens);
  return {
    source: "database" as const,
    tokens: parsed.success ? parsed.data : defaultThemeTokens,
  };
}

export async function readNavigation() {
  const stored = readStore().navigation;
  if (stored?.header?.length) {
    return { source: "store" as const, header: stored.header, footer: stored.footer };
  }

  const client = getAnonClient();
  if (!client) return { source: "defaults" as const, ...defaultNavigation };

  const { data: menus, error: menuError } = await client.from("navigation_menus").select("id, key");
  if (menuError) throw menuError;
  const { data: rows, error } = await client
    .from("navigation_items")
    .select("id, menu_id, parent_id, label_en, label_ta, href, link_type, sort_order, open_in_new_tab")
    .order("sort_order");
  if (error) throw error;

  const parsed = z.array(navRowSchema).parse(rows ?? []);
  const byKey = new Map((menus ?? []).map((menu) => [menu.key as string, menu.id as string]));

  return {
    source: "database" as const,
    header: tree(parsed.filter((row) => row.menu_id === byKey.get("header"))),
    footer: tree(parsed.filter((row) => row.menu_id === byKey.get("footer"))),
  };
}

function tree(rows: z.infer<typeof navRowSchema>[]): NavItem[] {
  return rows
    .filter((row) => row.parent_id === null)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({
      labelEn: row.label_en,
      labelTa: row.label_ta,
      href: row.href,
      linkType: row.link_type,
      sortOrder: row.sort_order,
      openInNewTab: row.open_in_new_tab,
      children: rows
        .filter((child) => child.parent_id === row.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((child) => ({
          labelEn: child.label_en,
          labelTa: child.label_ta,
          href: child.href,
          linkType: child.link_type,
          sortOrder: child.sort_order,
          openInNewTab: child.open_in_new_tab,
          children: [],
        })),
    }));
}
