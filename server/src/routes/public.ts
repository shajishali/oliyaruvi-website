import { Router } from "express";
import { ZodError } from "zod";
import { readCache, writeCache } from "../cms/cache";
import {
  readAlbum,
  readAlbums,
  readFaqs,
  readLiveChannels,
  readLiveEvents,
  readPhotoCategories,
  readProduct,
  readProductCategories,
  readProducts,
  readTestimonials,
  readVideoCategories,
  readVideos,
} from "../cms/catalogs";
import { submitBooking, submitEnquiry, saveBookingReference } from "../cms/forms";
import { readPage } from "../cms/pages";
import { readNavigation, readSite, readTheme } from "../cms/public-content";
import { readStore } from "../cms/store";
import multer from "multer";
import { MEDIA_LIMITS } from "../media/limits";

export const publicRouter = Router();
const referenceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MEDIA_LIMITS.referenceBytes },
});

function storeVersion() {
  return readStore().version || 1;
}

publicRouter.get("/site", async (_req, res, next) => {
  try {
    const cached = readCache("site");
    if (cached) {
      sendCached(res, cached.body, cached.version);
      return;
    }
    const result = await readSite();
    writeCache("site", result, result.settings.contentVersion);
    sendCached(res, result, result.settings.contentVersion);
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/navigation", async (_req, res, next) => {
  try {
    const cached = readCache("navigation");
    if (cached) {
      sendCached(res, cached.body, cached.version);
      return;
    }
    const result = await readNavigation();
    const version = storeVersion();
    writeCache("navigation", result, version);
    sendCached(res, result, version);
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/theme", async (_req, res, next) => {
  try {
    const cached = readCache("theme");
    if (cached) {
      sendCached(res, cached.body, cached.version);
      return;
    }
    const result = await readTheme();
    const version = storeVersion();
    writeCache("theme", result, version);
    sendCached(res, result, version);
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/pages/:slug", async (req, res, next) => {
  try {
    const key = `page:${req.params.slug}`;
    const cached = readCache(key);
    if (cached) {
      sendCached(res, cached.body, cached.version);
      return;
    }
    const result = await readPage(req.params.slug);
    if (!result) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    const version = storeVersion();
    writeCache(key, result, version);
    sendCached(res, result, version);
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/media", async (req, res, next) => {
  try {
    const ids = String(req.query.ids || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const store = readStore();
    const media = ids
      .map((id) => store.media.find((item) => item.id === id && !item.deletedAt))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        id: item.id,
        url: item.url,
        altEn: item.altEn,
        altTa: item.altTa,
        kind: item.kind,
        mimeType: item.mimeType,
      }));
    res.set("Cache-Control", "public, max-age=60");
    res.json({ media });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/photo-categories", async (_req, res, next) => {
  try {
    res.json(await readPhotoCategories());
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/albums", async (req, res, next) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    res.json(await readAlbums(category));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/albums/:slug", async (req, res, next) => {
  try {
    const result = await readAlbum(req.params.slug);
    if (!result) {
      res.status(404).json({ error: "Album not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/video-categories", async (_req, res, next) => {
  try {
    res.json(await readVideoCategories());
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/videos", async (_req, res, next) => {
  try {
    res.json(await readVideos());
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/live-channels", async (_req, res, next) => {
  try {
    res.json(await readLiveChannels());
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/live-events", async (_req, res, next) => {
  try {
    res.json(await readLiveEvents());
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/product-categories", async (req, res, next) => {
  try {
    const catalogue =
      req.query.catalogue === "printing" || req.query.catalogue === "gifts"
        ? req.query.catalogue
        : undefined;
    res.json(await readProductCategories(catalogue));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/products", async (req, res, next) => {
  try {
    const catalogue =
      req.query.catalogue === "printing" || req.query.catalogue === "gifts"
        ? req.query.catalogue
        : undefined;
    const featuredOnly = req.query.featured === "1" || req.query.featured === "true";
    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
    res.json(await readProducts({ catalogue, featuredOnly, categoryId, limit }));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/products/:slug", async (req, res, next) => {
  try {
    const result = await readProduct(req.params.slug);
    if (!result) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/testimonials", async (req, res, next) => {
  try {
    const featuredOnly = req.query.featured === "1" || req.query.featured === "true";
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 20;
    res.json(await readTestimonials(featuredOnly, limit));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/faqs", async (req, res, next) => {
  try {
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 20;
    res.json(await readFaqs(limit));
  } catch (error) {
    next(error);
  }
});

publicRouter.post("/bookings", async (req, res, next) => {
  try {
    const result = await submitBooking(req);
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(201).json({
      id: result.id,
      message: "Thank you. The studio will review your booking request.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Please check the form and try again." });
      return;
    }
    next(error);
  }
});

publicRouter.post("/enquiries", async (req, res, next) => {
  try {
    const result = await submitEnquiry(req);
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(201).json({
      id: result.id,
      message: "Thank you. The studio will review your enquiry.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Please check the form and try again." });
      return;
    }
    next(error);
  }
});

publicRouter.post("/bookings/:id/files", referenceUpload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "A reference file is required." });
      return;
    }
    if (!(MEDIA_LIMITS.referenceTypes as readonly string[]).includes(req.file.mimetype)) {
      res.status(400).json({ error: "Unsupported reference file type." });
      return;
    }
    const saved = saveBookingReference(req.params.id, {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer,
    });
    if (!saved) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

function sendCached(res: import("express").Response, body: unknown, version: number) {
  res.set("Cache-Control", "public, max-age=60");
  res.set("X-Content-Version", String(version));
  res.json(body);
}
