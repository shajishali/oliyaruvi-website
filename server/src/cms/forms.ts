import { createHash, randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import type { Request } from "express";
import { getAnonClient } from "../db/client";
import { bookingSchema, enquirySchema } from "../schemas/forms";
import { mutateStore, readStore, uploadsDir } from "./store";

const rateWindowMs = 60_000;
const rateLimit = 8;
const recentPosts = new Map<string, number[]>();

export async function submitBooking(req: Request) {
  const parsed = bookingSchema.parse(req.body);
  if (parsed.honeypot) return { ok: true as const, id: "ignored" };

  if (!allowLocalRate(req, "booking")) {
    return { ok: false as const, status: 429, error: "Too many requests. Please try again later." };
  }

  const client = getAnonClient();
  if (!client) {
    const id = randomUUID();
    mutateStore((store) => {
      store.bookings.unshift({
        id,
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email || "",
        service: parsed.service,
        eventDate: parsed.eventDate || null,
        location: parsed.location || "",
        requirements: parsed.requirements || "",
        status: "new",
        assignedTo: null,
        notes: [],
        createdAt: new Date().toISOString(),
      });
    });
    return { ok: true as const, id };
  }

  const allowed = await client.rpc("allow_form_post", {
    p_ip_hash: hashIp(req),
    p_form_key: "booking",
  });
  if (allowed.error) throw allowed.error;
  if (!allowed.data) {
    return { ok: false as const, status: 429, error: "Too many requests. Please try again later." };
  }

  const eventDate = parsed.eventDate ? parsed.eventDate : null;
  const { data, error } = await client.rpc("submit_booking", {
    p_name: parsed.name,
    p_phone: parsed.phone,
    p_email: parsed.email || null,
    p_service: parsed.service,
    p_event_date: eventDate,
    p_location: parsed.location || "",
    p_requirements: parsed.requirements || "",
  });
  if (error) throw error;
  return { ok: true as const, id: data as string };
}

export async function submitEnquiry(req: Request) {
  const parsed = enquirySchema.parse(req.body);
  if (parsed.honeypot) return { ok: true as const, id: "ignored" };

  if (!allowLocalRate(req, "enquiry")) {
    return { ok: false as const, status: 429, error: "Too many requests. Please try again later." };
  }

  const client = getAnonClient();
  if (!client) {
    const id = randomUUID();
    mutateStore((store) => {
      store.enquiries.unshift({
        id,
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email || "",
        source: parsed.source,
        service: parsed.service || "",
        details: parsed.details || "",
        productId: parsed.productId || null,
        status: "new",
        assignedTo: null,
        notes: [],
        createdAt: new Date().toISOString(),
      });
    });
    return { ok: true as const, id };
  }

  const allowed = await client.rpc("allow_form_post", {
    p_ip_hash: hashIp(req),
    p_form_key: "enquiry",
  });
  if (allowed.error) throw allowed.error;
  if (!allowed.data) {
    return { ok: false as const, status: 429, error: "Too many requests. Please try again later." };
  }

  const { data, error } = await client.rpc("submit_enquiry", {
    p_name: parsed.name,
    p_phone: parsed.phone,
    p_email: parsed.email || null,
    p_source: parsed.source,
    p_service: parsed.service || "",
    p_details: parsed.details || "",
    p_product_id: parsed.productId || null,
  });
  if (error) throw error;
  return { ok: true as const, id: data as string };
}

function allowLocalRate(req: Request, formKey: string) {
  if (getAnonClient()) return true;
  const key = `${formKey}:${hashIp(req)}`;
  const now = Date.now();
  const recent = (recentPosts.get(key) || []).filter((stamp) => now - stamp < rateWindowMs);
  if (recent.length >= rateLimit) {
    recentPosts.set(key, recent);
    return false;
  }
  recent.push(now);
  recentPosts.set(key, recent);
  return true;
}

function hashIp(req: Request) {
  const forwarded = req.header("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.socket.remoteAddress || "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

export function openInboxCounts() {
  const store = readStore();
  return {
    enquiries: store.enquiries.filter((item) => item.status === "new" || item.status === "reviewing").length,
    bookings: store.bookings.filter((item) => item.status === "new" || item.status === "reviewing").length,
    orders: store.orders.filter((item) => item.productionStatus !== "done").length,
  };
}

export function saveBookingReference(
  bookingId: string,
  file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
) {
  const booking = readStore().bookings.find((item) => item.id === bookingId);
  if (!booking) return null;
  const id = randomUUID();
  const ext = path.extname(file.originalname) || (file.mimetype === "application/pdf" ? ".pdf" : ".bin");
  const storagePath = path.join("private", "bookings", bookingId, `${id}${ext}`);
  const absolute = path.join(uploadsDir(), storagePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, file.buffer);
  const record = {
    id,
    fileName: file.originalname,
    mimeType: file.mimetype,
    byteSize: file.size,
    storagePath: storagePath.replace(/\\/g, "/"),
    createdAt: new Date().toISOString(),
  };
  mutateStore((store) => {
    const target = store.bookings.find((item) => item.id === bookingId);
    if (!target) return;
    const refs = (target as { references?: typeof record[] }).references || [];
    refs.push(record);
    (target as { references?: typeof record[] }).references = refs;
  });
  return { id: record.id, fileName: record.fileName };
}
