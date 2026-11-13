import { randomUUID } from "crypto";
import { z } from "zod";
import type { VerifiedAdmin } from "../auth/access";
import { writeAudit } from "./audit";
import { clearPublicCache } from "./cache";
import { defaultSite } from "./defaults";
import { mutateStore, readStore } from "./store";

const settingsSchema = z.object({
  businessName: z.string().min(2),
  businessNameTa: z.string(),
  locationEn: z.string().min(2),
  locationTa: z.string(),
  phonePrimary: z.string().min(8),
  phoneSecondary: z.string().min(8),
  whatsappNumber: z.string().min(8),
  experienceYears: z.number().int().min(0),
  addressEn: z.string().nullable(),
  addressTa: z.string().nullable(),
  mapUrl: z.string().nullable(),
  hours: z.unknown().nullable(),
  socialLinks: z.array(z.object({ label: z.string(), url: z.string() })),
  announcementEn: z.string().nullable(),
  announcementTa: z.string().nullable(),
  announcementEnabled: z.boolean(),
});

const testimonialSchema = z.object({
  personName: z.string().min(1),
  locationLabel: z.string().default(""),
  quoteEn: z.string().min(1),
  quoteTa: z.string().default(""),
  isVisible: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

const faqSchema = z.object({
  questionEn: z.string().min(1),
  questionTa: z.string().default(""),
  answerEn: z.string().min(1),
  answerTa: z.string().default(""),
  isVisible: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

export function getSiteSettingsAdmin() {
  return { ...defaultSite, ...readStore().siteSettings };
}

export function saveSiteSettings(admin: VerifiedAdmin, payload: unknown) {
  const parsed = settingsSchema.parse(payload);
  mutateStore((store) => {
    store.siteSettings = {
      ...parsed,
      contentVersion: Number(store.siteSettings.contentVersion || 1) + 1,
    };
  });
  clearPublicCache();
  writeAudit(admin, "update", "site_settings", "1", "Updated site settings");
  return getSiteSettingsAdmin();
}

export function listTestimonialsAdmin() {
  return readStore().testimonials.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function saveTestimonial(admin: VerifiedAdmin, payload: unknown, id?: string) {
  const parsed = testimonialSchema.parse(payload);
  let savedId = id;
  mutateStore((store) => {
    if (id) {
      const index = store.testimonials.findIndex((item) => item.id === id);
      if (index >= 0) store.testimonials[index] = { id, ...parsed };
    } else {
      savedId = randomUUID();
      store.testimonials.push({ id: savedId, ...parsed });
    }
  });
  clearPublicCache();
  writeAudit(admin, id ? "update" : "create", "testimonial", savedId || null, "Saved testimonial");
  return listTestimonialsAdmin().find((item) => item.id === savedId) ?? null;
}

export function deleteTestimonial(admin: VerifiedAdmin, id: string) {
  mutateStore((store) => {
    store.testimonials = store.testimonials.filter((item) => item.id !== id);
  });
  clearPublicCache();
  writeAudit(admin, "delete", "testimonial", id, "Deleted testimonial");
  return { ok: true };
}

export function listFaqsAdmin() {
  return readStore().faqs.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function saveFaq(admin: VerifiedAdmin, payload: unknown, id?: string) {
  const parsed = faqSchema.parse(payload);
  let savedId = id;
  mutateStore((store) => {
    if (id) {
      const index = store.faqs.findIndex((item) => item.id === id);
      if (index >= 0) store.faqs[index] = { id, ...parsed };
    } else {
      savedId = randomUUID();
      store.faqs.push({ id: savedId, ...parsed });
    }
  });
  clearPublicCache();
  writeAudit(admin, id ? "update" : "create", "faq", savedId || null, "Saved FAQ");
  return listFaqsAdmin().find((item) => item.id === savedId) ?? null;
}

export function deleteFaq(admin: VerifiedAdmin, id: string) {
  mutateStore((store) => {
    store.faqs = store.faqs.filter((item) => item.id !== id);
  });
  clearPublicCache();
  writeAudit(admin, "delete", "faq", id, "Deleted FAQ");
  return { ok: true };
}
