import { randomUUID } from "crypto";
import type { VerifiedAdmin } from "../auth/access";
import {
  albumSchema,
  channelSchema,
  inboxStatusSchema,
  liveEventSchema,
  orderSchema,
  productSchema,
  videoSchema,
} from "../schemas/business";
import { writeAudit } from "./audit";
import { clearPublicCache } from "./cache";
import { mutateStore, readStore } from "./store";
import type {
  InboxStatus,
  StoredLiveEvent,
  StoredOrder,
  StoredPhotoAlbum,
  StoredProduct,
  StoredVideo,
} from "./business-types";

export function listAlbumsAdmin() {
  return readStore()
    .albums.filter((item) => !item.deletedAt)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function saveAlbum(admin: VerifiedAdmin, payload: unknown, id?: string) {
  const parsed = albumSchema.parse(payload);
  const slug = parsed.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  let savedId = id;
  mutateStore((store) => {
    if (
      store.albums.some(
        (album) => album.slug === slug && album.id !== id && !album.deletedAt,
      )
    ) {
      throw new Error("Album slug already exists");
    }
    const photographs = parsed.photographs.map((photo, index) => ({
      id: photo.id || randomUUID(),
      mediaId: photo.mediaId,
      captionEn: photo.captionEn,
      captionTa: photo.captionTa,
      sortOrder: photo.sortOrder ?? index,
      isVisible: photo.isVisible,
    }));
    if (id) {
      const index = store.albums.findIndex((album) => album.id === id);
      if (index < 0) throw new Error("Album not found");
      store.albums[index] = {
        ...store.albums[index],
        ...parsed,
        slug,
        coverMediaId: parsed.coverMediaId ?? null,
        photographs,
      };
    } else {
      savedId = randomUUID();
      const album: StoredPhotoAlbum = {
        id: savedId,
        ...parsed,
        slug,
        coverMediaId: parsed.coverMediaId ?? null,
        deletedAt: null,
        photographs,
      };
      store.albums.push(album);
    }
  });
  clearPublicCache();
  writeAudit(admin, id ? "update" : "create", "album", savedId || null, `Saved album ${slug}`);
  return listAlbumsAdmin().find((album) => album.id === savedId) ?? null;
}

export function deleteAlbum(admin: VerifiedAdmin, id: string) {
  mutateStore((store) => {
    const album = store.albums.find((item) => item.id === id);
    if (album) album.deletedAt = new Date().toISOString();
  });
  clearPublicCache();
  writeAudit(admin, "delete", "album", id, "Soft deleted album");
  return { ok: true };
}

export function listVideosAdmin() {
  return readStore().videos.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function listCollectionsAdmin() {
  return readStore().videoCollections.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function saveVideo(admin: VerifiedAdmin, payload: unknown, id?: string) {
  const parsed = videoSchema.parse(payload);
  let savedId = id;
  mutateStore((store) => {
    const next: StoredVideo = {
      id: id || randomUUID(),
      collectionId: parsed.collectionId,
      titleEn: parsed.titleEn,
      titleTa: parsed.titleTa,
      descriptionEn: parsed.descriptionEn,
      descriptionTa: parsed.descriptionTa,
      sourceType: parsed.sourceType,
      youtubeUrl: parsed.youtubeUrl ?? null,
      mediaId: parsed.mediaId ?? null,
      thumbnailMediaId: parsed.thumbnailMediaId ?? null,
      durationSeconds: parsed.durationSeconds ?? null,
      sortOrder: parsed.sortOrder,
      isFeatured: parsed.isFeatured,
      isVisible: parsed.isVisible,
    };
    savedId = next.id;
    if (id) {
      const index = store.videos.findIndex((video) => video.id === id);
      if (index < 0) throw new Error("Video not found");
      store.videos[index] = next;
    } else {
      store.videos.push(next);
    }
  });
  clearPublicCache();
  writeAudit(admin, id ? "update" : "create", "video", savedId || null, `Saved video ${parsed.titleEn}`);
  return listVideosAdmin().find((video) => video.id === savedId) ?? null;
}

export function deleteVideo(admin: VerifiedAdmin, id: string) {
  mutateStore((store) => {
    store.videos = store.videos.filter((video) => video.id !== id);
  });
  clearPublicCache();
  writeAudit(admin, "delete", "video", id, "Deleted video");
  return { ok: true };
}

export function listChannelsAdmin() {
  return readStore().liveChannels.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function saveChannel(admin: VerifiedAdmin, id: string, payload: unknown) {
  const parsed = channelSchema.parse(payload);
  mutateStore((store) => {
    const channel = store.liveChannels.find((item) => item.id === id);
    if (!channel) throw new Error("Channel not found");
    channel.nameEn = parsed.nameEn;
    channel.nameTa = parsed.nameTa;
    channel.descriptionEn = parsed.descriptionEn;
    channel.descriptionTa = parsed.descriptionTa;
    channel.externalUrl = parsed.externalUrl ?? null;
    channel.isVisible = parsed.isVisible;
    if (parsed.sortOrder !== undefined) channel.sortOrder = parsed.sortOrder;
  });
  clearPublicCache();
  writeAudit(admin, "update", "live_channel", id, `Updated channel ${parsed.nameEn}`);
  return listChannelsAdmin().find((channel) => channel.id === id) ?? null;
}

export function listEventsAdmin(status?: string) {
  return readStore()
    .liveEvents.filter((event) => !event.deletedAt)
    .filter((event) => (status && status !== "all" ? event.status === status : true))
    .sort((a, b) => (a.startsAt || "").localeCompare(b.startsAt || ""));
}

export function saveEvent(admin: VerifiedAdmin, payload: unknown, id?: string) {
  const parsed = liveEventSchema.parse(payload);
  let savedId = id;
  mutateStore((store) => {
    const links = parsed.links.map((link, index) => ({
      id: link.id || randomUUID(),
      platform: link.platform,
      url: link.url,
      labelEn: link.labelEn,
      labelTa: link.labelTa,
      sortOrder: link.sortOrder ?? index,
    }));
    const next: StoredLiveEvent = {
      id: id || randomUUID(),
      titleEn: parsed.titleEn,
      titleTa: parsed.titleTa,
      descriptionEn: parsed.descriptionEn,
      descriptionTa: parsed.descriptionTa,
      thumbnailMediaId: parsed.thumbnailMediaId ?? null,
      startsAt: parsed.startsAt ?? null,
      endsAt: parsed.endsAt ?? null,
      status: parsed.status,
      statusSource: "manual",
      isFeatured: parsed.isFeatured,
      isPublished: parsed.isPublished,
      replayUrl: parsed.replayUrl ?? null,
      channelId: parsed.channelId ?? null,
      deletedAt: null,
      links,
    };
    savedId = next.id;
    if (id) {
      const index = store.liveEvents.findIndex((event) => event.id === id);
      if (index < 0) throw new Error("Event not found");
      store.liveEvents[index] = { ...store.liveEvents[index], ...next, id };
    } else {
      store.liveEvents.push(next);
    }
  });
  clearPublicCache();
  writeAudit(admin, id ? "update" : "create", "live_event", savedId || null, `Saved event ${parsed.titleEn}`);
  return listEventsAdmin().find((event) => event.id === savedId) ?? null;
}

export function deleteEvent(admin: VerifiedAdmin, id: string) {
  mutateStore((store) => {
    const event = store.liveEvents.find((item) => item.id === id);
    if (event) event.deletedAt = new Date().toISOString();
  });
  clearPublicCache();
  writeAudit(admin, "delete", "live_event", id, "Soft deleted live event");
  return { ok: true };
}

export function listProductsAdmin(catalogue?: "printing" | "gifts") {
  const store = readStore();
  return store.products
    .filter((product) => !product.deletedAt)
    .filter((product) => {
      if (!catalogue) return true;
      const category = store.productCategories.find((item) => item.id === product.categoryId);
      return category?.catalogue === catalogue;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function listProductCategoriesAdmin(catalogue?: "printing" | "gifts") {
  return readStore()
    .productCategories.filter((item) => (catalogue ? item.catalogue === catalogue : true))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function saveProduct(admin: VerifiedAdmin, payload: unknown, id?: string) {
  const parsed = productSchema.parse(payload);
  const slug = parsed.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  let savedId = id;
  mutateStore((store) => {
    if (store.products.some((product) => product.slug === slug && product.id !== id && !product.deletedAt)) {
      throw new Error("Product slug already exists");
    }
    const next: StoredProduct = {
      id: id || randomUUID(),
      slug,
      categoryId: parsed.categoryId,
      nameEn: parsed.nameEn,
      nameTa: parsed.nameTa,
      descriptionEn: parsed.descriptionEn,
      descriptionTa: parsed.descriptionTa,
      enquiryLabelEn: parsed.enquiryLabelEn,
      enquiryLabelTa: parsed.enquiryLabelTa,
      sortOrder: parsed.sortOrder,
      isFeatured: parsed.isFeatured,
      isAvailable: parsed.isAvailable,
      showPrice: parsed.showPrice,
      deletedAt: null,
      variants: parsed.variants.map((variant, index) => ({
        id: variant.id || randomUUID(),
        nameEn: variant.nameEn,
        nameTa: variant.nameTa,
        size: variant.size,
        material: variant.material,
        priceLkr: variant.priceLkr ?? null,
        isAvailable: variant.isAvailable,
        sortOrder: variant.sortOrder ?? index,
      })),
      images: parsed.images,
    };
    savedId = next.id;
    if (id) {
      const index = store.products.findIndex((product) => product.id === id);
      if (index < 0) throw new Error("Product not found");
      store.products[index] = next;
    } else {
      store.products.push(next);
    }
  });
  clearPublicCache();
  writeAudit(admin, id ? "update" : "create", "product", savedId || null, `Saved product ${slug}`);
  return listProductsAdmin().find((product) => product.id === savedId) ?? null;
}

export function deleteProduct(admin: VerifiedAdmin, id: string) {
  mutateStore((store) => {
    const product = store.products.find((item) => item.id === id);
    if (product) product.deletedAt = new Date().toISOString();
  });
  clearPublicCache();
  writeAudit(admin, "delete", "product", id, "Soft deleted product");
  return { ok: true };
}

export function listBookingsAdmin() {
  return readStore().bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listEnquiriesAdmin() {
  return readStore().enquiries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateInboxItem(
  admin: VerifiedAdmin,
  kind: "booking" | "enquiry",
  id: string,
  patch: { status?: InboxStatus; assignedTo?: string | null; note?: string },
) {
  mutateStore((store) => {
    const list = kind === "booking" ? store.bookings : store.enquiries;
    const item = list.find((entry) => entry.id === id);
    if (!item) throw new Error("Item not found");
    if (patch.status) item.status = inboxStatusSchema.parse(patch.status);
    if (patch.assignedTo !== undefined) item.assignedTo = patch.assignedTo;
    if (patch.note?.trim()) {
      item.notes.push({
        id: randomUUID(),
        body: patch.note.trim(),
        createdAt: new Date().toISOString(),
        createdBy: admin.userId,
      });
    }
  });
  writeAudit(admin, "update", kind, id, `Updated ${kind} ${id}`);
  return kind === "booking"
    ? listBookingsAdmin().find((item) => item.id === id)
    : listEnquiriesAdmin().find((item) => item.id === id);
}

export function listOrdersAdmin() {
  return readStore().orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveOrder(admin: VerifiedAdmin, payload: unknown, id?: string) {
  const parsed = orderSchema.parse(payload);
  const now = new Date().toISOString();
  let savedId = id;
  mutateStore((store) => {
    const next: StoredOrder = {
      id: id || randomUUID(),
      customerName: parsed.customerName,
      customerPhone: parsed.customerPhone,
      customerEmail: parsed.customerEmail,
      paymentStatus: parsed.paymentStatus,
      productionStatus: parsed.productionStatus,
      deliveryStatus: parsed.deliveryStatus,
      notes: parsed.notes,
      createdAt: id ? store.orders.find((order) => order.id === id)?.createdAt || now : now,
      updatedAt: now,
      lines: parsed.lines.map((line) => ({
        id: line.id || randomUUID(),
        productId: line.productId ?? null,
        label: line.label,
        quantity: line.quantity,
        unitPriceLkr: line.unitPriceLkr ?? null,
      })),
    };
    savedId = next.id;
    if (id) {
      const index = store.orders.findIndex((order) => order.id === id);
      if (index < 0) throw new Error("Order not found");
      store.orders[index] = next;
    } else {
      store.orders.push(next);
    }
  });
  writeAudit(admin, id ? "update" : "create", "order", savedId || null, `Saved order for ${parsed.customerName}`);
  return listOrdersAdmin().find((order) => order.id === savedId) ?? null;
}

export function listStaffAdmin() {
  return readStore().staffUsers;
}

export function exportInboxCsv(kind: "booking" | "enquiry") {
  const header = "id,name,phone,email,status,createdAt,service_or_source,details\n";
  const lines =
    kind === "booking"
      ? listBookingsAdmin().map((row) =>
          [row.id, row.name, row.phone, row.email, row.status, row.createdAt, row.service, row.requirements]
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        )
      : listEnquiriesAdmin().map((row) =>
          [row.id, row.name, row.phone, row.email, row.status, row.createdAt, row.source, row.details]
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        );
  return header + lines.join("\n");
}
