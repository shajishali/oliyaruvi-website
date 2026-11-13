import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import type { VerifiedAdmin } from "../auth/access";
import { MEDIA_LIMITS } from "../media/limits";
import { writeAudit } from "./audit";
import { clearPublicCache } from "./cache";
import { mutateStore, readStore, uploadsDir } from "./store";
import type { StoredMedia } from "./store-types";

export function listMedia(folder?: string) {
  return readStore()
    .media.filter((item) => !item.deletedAt)
    .filter((item) => (folder ? item.folder === folder : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMedia(id: string) {
  return readStore().media.find((item) => item.id === id && !item.deletedAt) ?? null;
}

export function saveUploadedMedia(
  admin: VerifiedAdmin,
  file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
  meta: { folder?: string; altEn?: string; altTa?: string; title?: string },
) {
  const kind = file.mimetype.startsWith("video/")
    ? "video"
    : file.mimetype.startsWith("image/")
      ? "image"
      : "file";
  if (kind === "image") {
    if (!(MEDIA_LIMITS.imageTypes as readonly string[]).includes(file.mimetype)) {
      throw new Error("Unsupported image type");
    }
    if (file.size > MEDIA_LIMITS.imageBytes) throw new Error("Image is too large");
  } else if (kind === "video") {
    if (!(MEDIA_LIMITS.videoTypes as readonly string[]).includes(file.mimetype)) {
      throw new Error("Unsupported video type");
    }
    if (file.size > MEDIA_LIMITS.videoBytes) throw new Error("Video is too large");
  } else {
    throw new Error("Unsupported file type");
  }

  const id = randomUUID();
  const ext = extensionFor(file.mimetype, file.originalname);
  const folder = meta.folder?.trim() || "library";
  const storagePath = path.join(folder, `${id}${ext}`);
  const absolute = path.join(uploadsDir(), storagePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, file.buffer);

  const item: StoredMedia = {
    id,
    folder,
    kind,
    mimeType: file.mimetype,
    byteSize: file.size,
    fileName: file.originalname,
    storagePath: storagePath.replace(/\\/g, "/"),
    altEn: meta.altEn || "",
    altTa: meta.altTa || "",
    title: meta.title || file.originalname,
    url: `/media/${storagePath.replace(/\\/g, "/")}`,
    uploadedBy: admin.userId,
    createdAt: new Date().toISOString(),
    deletedAt: null,
  };

  mutateStore((store) => {
    store.media.unshift(item);
  });
  writeAudit(admin, "upload", "media", id, `Uploaded ${item.fileName}`);
  clearPublicCache();
  return item;
}

export function updateMedia(
  admin: VerifiedAdmin,
  id: string,
  patch: { altEn?: string; altTa?: string; title?: string; folder?: string },
) {
  const existing = getMedia(id);
  if (!existing) return null;
  mutateStore((store) => {
    const item = store.media.find((entry) => entry.id === id);
    if (!item) return;
    if (patch.altEn !== undefined) item.altEn = patch.altEn;
    if (patch.altTa !== undefined) item.altTa = patch.altTa;
    if (patch.title !== undefined) item.title = patch.title;
    if (patch.folder !== undefined) item.folder = patch.folder;
  });
  writeAudit(admin, "update", "media", id, `Updated media ${id}`);
  return getMedia(id);
}

export function softDeleteMedia(admin: VerifiedAdmin, id: string) {
  const existing = getMedia(id);
  if (!existing) return null;
  if (isReferenced(id)) {
    throw new Error("This file is still referenced and cannot be deleted.");
  }
  mutateStore((store) => {
    const item = store.media.find((entry) => entry.id === id);
    if (item) item.deletedAt = new Date().toISOString();
  });
  writeAudit(admin, "delete", "media", id, `Soft deleted media ${id}`);
  return { ok: true };
}

function isReferenced(mediaId: string) {
  const store = readStore();
  const haystack = JSON.stringify({
    pages: store.pages,
    testimonials: store.testimonials,
    albums: store.albums,
    videos: store.videos,
    liveEvents: store.liveEvents,
    products: store.products,
  });
  return haystack.includes(mediaId);
}

function extensionFor(mime: string, original: string) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "video/mp4") return ".mp4";
  const fromName = path.extname(original);
  return fromName || ".bin";
}
