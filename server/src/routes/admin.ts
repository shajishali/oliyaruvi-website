import { Router } from "express";
import multer from "multer";
import { ZodError } from "zod";
import type { VerifiedAdmin } from "../auth/access";
import { destroyLocalSession } from "../auth/local";
import {
  canEditContent,
  canManageLive,
  canManageMedia,
  canManageOrders,
  canPickMedia,
  canReadAudit,
  isSuperAdmin,
} from "../auth/roles";
import { listAudit } from "../cms/audit";
import { getDashboard } from "../cms/admin-dashboard";
import {
  deleteAlbum,
  deleteEvent,
  deleteProduct,
  deleteVideo,
  exportInboxCsv,
  listAlbumsAdmin,
  listBookingsAdmin,
  listChannelsAdmin,
  listCollectionsAdmin,
  listEnquiriesAdmin,
  listEventsAdmin,
  listOrdersAdmin,
  listProductCategoriesAdmin,
  listProductsAdmin,
  listStaffAdmin,
  listVideosAdmin,
  saveAlbum,
  saveChannel,
  saveEvent,
  saveOrder,
  saveProduct,
  saveVideo,
  updateInboxItem,
} from "../cms/admin-business";
import {
  createPage,
  duplicatePage,
  getPageAdmin,
  listPages,
  publishPage,
  reorderSections,
  restorePage,
  restoreVersion,
  saveDraft,
  softDeletePage,
  unpublishPage,
  updatePageMeta,
} from "../cms/admin-pages";
import { getNavigationAdmin, saveNavigation } from "../cms/admin-navigation";
import { getThemeAdmin, publishTheme, saveThemeDraft } from "../cms/admin-theme";
import {
  getMedia,
  listMedia,
  saveUploadedMedia,
  softDeleteMedia,
  updateMedia,
} from "../cms/admin-media";
import {
  deleteFaq,
  deleteTestimonial,
  getSiteSettingsAdmin,
  listFaqsAdmin,
  listTestimonialsAdmin,
  saveFaq,
  saveSiteSettings,
  saveTestimonial,
} from "../cms/admin-content";
import { isAuthConfigured } from "../db/client";

export const adminRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

adminRouter.post("/local-logout", (req, res) => {
  const header = req.header("authorization") ?? "";
  const match = header.match(/^Bearer\s+(\S+)\s*$/i);
  if (match?.[1]) destroyLocalSession(match[1]);
  res.json({ ok: true });
});

adminRouter.get("/me", (_req, res) => {
  const admin = res.locals.admin as VerifiedAdmin;
  res.json({
    id: admin.userId,
    email: admin.email,
    roles: admin.roles,
    local: admin.userId === "local-admin",
    authMode: isAuthConfigured() ? "supabase" : "local",
  });
});

adminRouter.get("/dashboard", (req, res) => {
  requireContent(req, res, () => {
    res.json(getDashboard());
  });
});

adminRouter.get("/pages", (req, res) => {
  requireContent(req, res, () => res.json({ pages: listPages() }));
});

adminRouter.post("/pages", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      const admin = res.locals.admin as VerifiedAdmin;
      res.status(201).json(createPage(admin, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.get("/pages/:id", (req, res) => {
  requireContent(req, res, () => {
    const page = getPageAdmin(req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    res.json(page);
  });
});

adminRouter.get("/pages/:id/preview", (req, res) => {
  requireContent(req, res, () => {
    const page = getPageAdmin(req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    const sections = page.draft?.sections ?? page.published?.sections ?? [];
    res.set("Cache-Control", "no-store");
    res.json({
      source: "draft",
      page: {
        slug: page.slug,
        titleEn: page.seo.en.title,
        titleTa: page.seo.ta.title,
        descriptionEn: page.seo.en.description,
        descriptionTa: page.seo.ta.description,
        sections: sections.filter((section) => section.isVisible),
      },
    });
  });
});

adminRouter.patch("/pages/:id", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      const admin = res.locals.admin as VerifiedAdmin;
      const page = updatePageMeta(admin, req.params.id, req.body);
      if (!page) {
        res.status(404).json({ error: "Page not found" });
        return;
      }
      res.json(page);
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.post("/pages/:id/duplicate", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      const admin = res.locals.admin as VerifiedAdmin;
      const page = duplicatePage(admin, req.params.id);
      if (!page) {
        res.status(404).json({ error: "Page not found" });
        return;
      }
      res.status(201).json(page);
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.put("/pages/:id/draft", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      const admin = res.locals.admin as VerifiedAdmin;
      const page = saveDraft(admin, req.params.id, req.body.sections);
      if (!page) {
        res.status(404).json({ error: "Page not found" });
        return;
      }
      res.json(page);
    } catch (error) {
      if (error instanceof ZodError || error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  });
});

adminRouter.post("/pages/:id/sections/reorder", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      const admin = res.locals.admin as VerifiedAdmin;
      const page = reorderSections(admin, req.params.id, req.body.orderedIds || []);
      if (!page) {
        res.status(404).json({ error: "Page not found" });
        return;
      }
      res.json(page);
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.post("/pages/:id/publish", (req, res) => {
  requireContent(req, res, () => {
    const admin = res.locals.admin as VerifiedAdmin;
    const page = publishPage(admin, req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    res.json(page);
  });
});

adminRouter.post("/pages/:id/unpublish", (req, res) => {
  requireContent(req, res, () => {
    const admin = res.locals.admin as VerifiedAdmin;
    const page = unpublishPage(admin, req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    res.json(page);
  });
});

adminRouter.post("/pages/:id/restore", (req, res) => {
  requireContent(req, res, () => {
    const admin = res.locals.admin as VerifiedAdmin;
    const version = Number(req.body.version);
    const page = Number.isFinite(version)
      ? restoreVersion(admin, req.params.id, version)
      : restorePage(admin, req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page or version not found" });
      return;
    }
    res.json(page);
  });
});

adminRouter.delete("/pages/:id", (req, res) => {
  requireContent(req, res, () => {
    const admin = res.locals.admin as VerifiedAdmin;
    const result = softDeletePage(admin, req.params.id);
    if (!result) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    res.json(result);
  });
});

adminRouter.get("/navigation", (req, res) => {
  requireContent(req, res, () => res.json(getNavigationAdmin()));
});

adminRouter.put("/navigation", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      const admin = res.locals.admin as VerifiedAdmin;
      res.json(saveNavigation(admin, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.get("/theme", (req, res) => {
  requireContent(req, res, () => res.json(getThemeAdmin()));
});

adminRouter.put("/theme/draft", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      const admin = res.locals.admin as VerifiedAdmin;
      res.json(saveThemeDraft(admin, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.post("/theme/publish", (req, res) => {
  requireContent(req, res, () => {
    const admin = res.locals.admin as VerifiedAdmin;
    res.json(publishTheme(admin));
  });
});

adminRouter.get("/media", (req, res) => {
  const admin = res.locals.admin as VerifiedAdmin;
  if (!canPickMedia(admin)) {
    res.status(403).json({ error: "Media access denied." });
    return;
  }
  const folder = typeof req.query.folder === "string" ? req.query.folder : undefined;
  res.json({ media: listMedia(folder) });
});

adminRouter.post("/media", upload.single("file"), (req, res, next) => {
  try {
    const admin = res.locals.admin as VerifiedAdmin;
    if (!canManageMedia(admin)) {
      res.status(403).json({ error: "Media upload denied." });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "File is required." });
      return;
    }
    const item = saveUploadedMedia(admin, req.file, {
      folder: String(req.body.folder || "library"),
      altEn: String(req.body.altEn || ""),
      altTa: String(req.body.altTa || ""),
      title: String(req.body.title || ""),
    });
    res.status(201).json(item);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
});

adminRouter.patch("/media/:id", (req, res, next) => {
  try {
    const admin = res.locals.admin as VerifiedAdmin;
    if (!canManageMedia(admin)) {
      res.status(403).json({ error: "Media update denied." });
      return;
    }
    const item = updateMedia(admin, req.params.id, req.body);
    if (!item) {
      res.status(404).json({ error: "Media not found" });
      return;
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
});

adminRouter.delete("/media/:id", (req, res) => {
  try {
    const admin = res.locals.admin as VerifiedAdmin;
    if (!canManageMedia(admin)) {
      res.status(403).json({ error: "Media delete denied." });
      return;
    }
    if (!getMedia(req.params.id)) {
      res.status(404).json({ error: "Media not found" });
      return;
    }
    res.json(softDeleteMedia(admin, req.params.id));
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    throw error;
  }
});

adminRouter.get("/settings", (req, res) => {
  requireContent(req, res, () => res.json(getSiteSettingsAdmin()));
});

adminRouter.put("/settings", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      const admin = res.locals.admin as VerifiedAdmin;
      res.json(saveSiteSettings(admin, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.get("/testimonials", (req, res) => {
  requireContent(req, res, () => res.json({ testimonials: listTestimonialsAdmin() }));
});

adminRouter.post("/testimonials", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      const admin = res.locals.admin as VerifiedAdmin;
      res.status(201).json(saveTestimonial(admin, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.put("/testimonials/:id", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      const admin = res.locals.admin as VerifiedAdmin;
      const item = saveTestimonial(admin, req.body, req.params.id);
      if (!item) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.delete("/testimonials/:id", (req, res) => {
  requireContent(req, res, () => {
    const admin = res.locals.admin as VerifiedAdmin;
    res.json(deleteTestimonial(admin, req.params.id));
  });
});

adminRouter.get("/faqs", (req, res) => {
  requireContent(req, res, () => res.json({ faqs: listFaqsAdmin() }));
});

adminRouter.post("/faqs", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      const admin = res.locals.admin as VerifiedAdmin;
      res.status(201).json(saveFaq(admin, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.put("/faqs/:id", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      const admin = res.locals.admin as VerifiedAdmin;
      const item = saveFaq(admin, req.body, req.params.id);
      if (!item) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.delete("/faqs/:id", (req, res) => {
  requireContent(req, res, () => {
    const admin = res.locals.admin as VerifiedAdmin;
    res.json(deleteFaq(admin, req.params.id));
  });
});

adminRouter.get("/audit", (_req, res) => {
  const admin = res.locals.admin as VerifiedAdmin;
  if (!canReadAudit(admin)) {
    res.status(403).json({ error: "Audit log is restricted to Super Admin." });
    return;
  }
  res.json({ entries: listAudit() });
});

adminRouter.get("/albums", (req, res) => {
  requireContent(req, res, () => res.json({ albums: listAlbumsAdmin() }));
});

adminRouter.post("/albums", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      res.status(201).json(saveAlbum(res.locals.admin as VerifiedAdmin, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.put("/albums/:id", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      res.json(saveAlbum(res.locals.admin as VerifiedAdmin, req.body, req.params.id));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.delete("/albums/:id", (req, res) => {
  requireContent(req, res, () => res.json(deleteAlbum(res.locals.admin as VerifiedAdmin, req.params.id)));
});

adminRouter.get("/videos", (req, res) => {
  requireContent(req, res, () =>
    res.json({ videos: listVideosAdmin(), collections: listCollectionsAdmin() }),
  );
});

adminRouter.post("/videos", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      res.status(201).json(saveVideo(res.locals.admin as VerifiedAdmin, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.put("/videos/:id", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      res.json(saveVideo(res.locals.admin as VerifiedAdmin, req.body, req.params.id));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.delete("/videos/:id", (req, res) => {
  requireContent(req, res, () => res.json(deleteVideo(res.locals.admin as VerifiedAdmin, req.params.id)));
});

adminRouter.get("/live/channels", (req, res) => {
  requireLive(req, res, () => res.json({ channels: listChannelsAdmin() }));
});

adminRouter.put("/live/channels/:id", (req, res, next) => {
  requireLive(req, res, () => {
    try {
      res.json(saveChannel(res.locals.admin as VerifiedAdmin, req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.get("/live/events", (req, res) => {
  requireLive(req, res, () => res.json({ events: listEventsAdmin(String(req.query.status || "all")) }));
});

adminRouter.post("/live/events", (req, res, next) => {
  requireLive(req, res, () => {
    try {
      res.status(201).json(saveEvent(res.locals.admin as VerifiedAdmin, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.put("/live/events/:id", (req, res, next) => {
  requireLive(req, res, () => {
    try {
      res.json(saveEvent(res.locals.admin as VerifiedAdmin, req.body, req.params.id));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.delete("/live/events/:id", (req, res) => {
  requireLive(req, res, () => res.json(deleteEvent(res.locals.admin as VerifiedAdmin, req.params.id)));
});

adminRouter.get("/products", (req, res) => {
  requireContent(req, res, () => {
    const catalogue = req.query.catalogue === "gifts" || req.query.catalogue === "printing" ? req.query.catalogue : undefined;
    res.json({
      products: listProductsAdmin(catalogue),
      categories: listProductCategoriesAdmin(catalogue),
    });
  });
});

adminRouter.post("/products", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      res.status(201).json(saveProduct(res.locals.admin as VerifiedAdmin, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.put("/products/:id", (req, res, next) => {
  requireContent(req, res, () => {
    try {
      res.json(saveProduct(res.locals.admin as VerifiedAdmin, req.body, req.params.id));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.delete("/products/:id", (req, res) => {
  requireContent(req, res, () => res.json(deleteProduct(res.locals.admin as VerifiedAdmin, req.params.id)));
});

adminRouter.get("/bookings", (req, res) => {
  requireOrders(req, res, () => res.json({ bookings: listBookingsAdmin() }));
});

adminRouter.patch("/bookings/:id", (req, res, next) => {
  requireOrders(req, res, () => {
    try {
      res.json(updateInboxItem(res.locals.admin as VerifiedAdmin, "booking", req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.get("/bookings.csv", (req, res) => {
  requireOrders(req, res, () => {
    res.setHeader("Content-Type", "text/csv");
    res.send(exportInboxCsv("booking"));
  });
});

adminRouter.get("/enquiries", (req, res) => {
  requireOrders(req, res, () => res.json({ enquiries: listEnquiriesAdmin() }));
});

adminRouter.patch("/enquiries/:id", (req, res, next) => {
  requireOrders(req, res, () => {
    try {
      res.json(updateInboxItem(res.locals.admin as VerifiedAdmin, "enquiry", req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.get("/enquiries.csv", (req, res) => {
  requireOrders(req, res, () => {
    res.setHeader("Content-Type", "text/csv");
    res.send(exportInboxCsv("enquiry"));
  });
});

adminRouter.get("/orders", (req, res) => {
  requireOrders(req, res, () => res.json({ orders: listOrdersAdmin() }));
});

adminRouter.post("/orders", (req, res, next) => {
  requireOrders(req, res, () => {
    try {
      res.status(201).json(saveOrder(res.locals.admin as VerifiedAdmin, req.body));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.put("/orders/:id", (req, res, next) => {
  requireOrders(req, res, () => {
    try {
      res.json(saveOrder(res.locals.admin as VerifiedAdmin, req.body, req.params.id));
    } catch (error) {
      next(error);
    }
  });
});

adminRouter.get("/users", (_req, res) => {
  const admin = res.locals.admin as VerifiedAdmin;
  if (!isSuperAdmin(admin)) {
    res.status(403).json({ error: "Only Super Admin can manage users." });
    return;
  }
  res.json({
    users: listStaffAdmin(),
    inviteAvailable: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    note: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "Invite flow uses Supabase Auth."
      : "Local mode lists the local admin only. Connect Supabase to invite staff.",
  });
});

function requireContent(_req: unknown, res: import("express").Response, run: () => void) {
  const admin = res.locals.admin as VerifiedAdmin;
  if (!canEditContent(admin)) {
    res.status(403).json({ error: "Content editing denied." });
    return;
  }
  run();
}

function requireLive(_req: unknown, res: import("express").Response, run: () => void) {
  const admin = res.locals.admin as VerifiedAdmin;
  if (!canManageLive(admin) && !canEditContent(admin)) {
    res.status(403).json({ error: "Live management denied." });
    return;
  }
  run();
}

function requireOrders(_req: unknown, res: import("express").Response, run: () => void) {
  const admin = res.locals.admin as VerifiedAdmin;
  if (!canManageOrders(admin) && !isSuperAdmin(admin)) {
    res.status(403).json({ error: "Order management denied." });
    return;
  }
  run();
}
