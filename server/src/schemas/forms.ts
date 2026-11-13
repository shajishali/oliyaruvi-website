import { z } from "zod";

export const bookingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
  service: z.string().trim().min(2).max(120),
  eventDate: z.union([z.literal(""), z.string().trim()]).optional(),
  location: z.union([z.literal(""), z.string().trim().max(200)]).optional(),
  requirements: z.union([z.literal(""), z.string().trim().max(2000)]).optional(),
  honeypot: z.union([z.literal(""), z.string().max(0)]).optional(),
});

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
  source: z.enum(["contact", "product", "service"]).default("contact"),
  service: z.union([z.literal(""), z.string().trim().max(120)]).optional(),
  details: z.union([z.literal(""), z.string().trim().max(2000)]).optional(),
  productId: z.union([z.literal(""), z.string().uuid()]).optional(),
  honeypot: z.union([z.literal(""), z.string().max(0)]).optional(),
});
