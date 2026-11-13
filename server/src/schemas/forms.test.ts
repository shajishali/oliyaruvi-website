import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MEDIA_LIMITS } from "../media/limits";
import { bookingSchema, enquirySchema } from "./forms";

describe("booking and enquiry schemas", () => {
  it("accepts a valid booking", () => {
    const parsed = bookingSchema.parse({
      name: "Amina",
      phone: "0773928215",
      email: "amina@example.com",
      service: "Photography",
      eventDate: "2026-12-01",
      location: "Jaffna",
      requirements: "Outdoor",
      honeypot: "",
    });
    assert.equal(parsed.name, "Amina");
  });

  it("rejects a short booking name", () => {
    assert.equal(
      bookingSchema.safeParse({ name: "A", phone: "0773928215", service: "Photography" }).success,
      false,
    );
  });

  it("rejects honeypot spam on booking", () => {
    assert.equal(
      bookingSchema.safeParse({
        name: "Amina",
        phone: "0773928215",
        service: "Photography",
        honeypot: "bot",
      }).success,
      false,
    );
  });

  it("accepts a valid enquiry", () => {
    const parsed = enquirySchema.parse({
      name: "Nimal",
      phone: "0777241958",
      source: "product",
      details: "Need prints",
    });
    assert.equal(parsed.source, "product");
  });

  it("rejects an unknown enquiry source", () => {
    assert.equal(
      enquirySchema.safeParse({
        name: "Nimal",
        phone: "0777241958",
        source: "twitter",
      }).success,
      false,
    );
  });

  it("rejects invalid product uuid", () => {
    assert.equal(
      enquirySchema.safeParse({
        name: "Nimal",
        phone: "0777241958",
        productId: "not-a-uuid",
      }).success,
      false,
    );
  });
});

describe("media and reference limits", () => {
  it("rejects oversized reference payloads by limit", () => {
    assert.ok(MEDIA_LIMITS.referenceBytes <= 10 * 1024 * 1024);
    assert.ok(!(MEDIA_LIMITS.referenceTypes as readonly string[]).includes("application/zip"));
    assert.ok(!(MEDIA_LIMITS.imageTypes as readonly string[]).includes("image/gif"));
  });

  it("keeps image and video ceilings explicit", () => {
    assert.equal(MEDIA_LIMITS.imageBytes, 15 * 1024 * 1024);
    assert.equal(MEDIA_LIMITS.videoBytes, 200 * 1024 * 1024);
  });
});
