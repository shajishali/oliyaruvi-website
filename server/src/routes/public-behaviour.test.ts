import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app";
import { MEDIA_LIMITS } from "../media/limits";
import { clearStoreCache, readStore, resetStoreForTests } from "../cms/store";

const app = createApp({
  authConfigured: true,
  webDist: null,
  verifyToken: async () => null,
});

describe("public behaviour", () => {
  before(() => {
    clearStoreCache();
    resetStoreForTests();
  });

  it("inserts a booking and returns the review message", async () => {
    const response = await request(app).post("/api/public/bookings").send({
      name: "Amina Devi",
      phone: "0773928215",
      email: "",
      service: "Photography",
      eventDate: "2026-12-20",
      location: "Jaffna",
      requirements: "Outdoor session",
      honeypot: "",
    });
    assert.equal(response.status, 201);
    assert.equal(response.body.message, "Thank you. The studio will review your booking request.");
    assert.ok(response.body.id);
    assert.ok(readStore().bookings.some((item) => item.id === response.body.id));
  });

  it("inserts an enquiry and returns the review message", async () => {
    const response = await request(app).post("/api/public/enquiries").send({
      name: "Nimal Perera",
      phone: "0777241958",
      source: "contact",
      service: "Printing",
      details: "Need wedding prints",
      honeypot: "",
    });
    assert.equal(response.status, 201);
    assert.equal(response.body.message, "Thank you. The studio will review your enquiry.");
    assert.ok(readStore().enquiries.some((item) => item.id === response.body.id));
  });

  it("rejects unsupported reference file types", async () => {
    const booking = await request(app).post("/api/public/bookings").send({
      name: "File Tester",
      phone: "0773928215",
      service: "Printing",
      honeypot: "",
    });
    const response = await request(app)
      .post(`/api/public/bookings/${booking.body.id}/files`)
      .attach("file", Buffer.from("%PDF-1.4"), {
        filename: "brief.zip",
        contentType: "application/zip",
      });
    assert.equal(response.status, 400);
  });

  it("rejects oversized reference uploads", async () => {
    const booking = await request(app).post("/api/public/bookings").send({
      name: "Size Tester",
      phone: "0773928215",
      service: "Printing",
      honeypot: "",
    });
    const oversized = Buffer.alloc(MEDIA_LIMITS.referenceBytes + 1024, 1);
    const response = await request(app)
      .post(`/api/public/bookings/${booking.body.id}/files`)
      .attach("file", oversized, {
        filename: "big.jpg",
        contentType: "image/jpeg",
      });
    assert.equal(response.status, 413);
    assert.match(String(response.body.error || ""), /too large/i);
  });

  it("keeps reduced-motion CSS that disables large transitions", () => {
    const cssPath = path.resolve(__dirname, "../../../web/src/index.css");
    const css = fs.readFileSync(cssPath, "utf8");
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(css, /\.reveal[\s\S]*transition:\s*none/);
  });
});
