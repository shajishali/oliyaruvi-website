import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app";

const app = createApp({
  authConfigured: true,
  webDist: null,
  verifyToken: async (token) => {
    if (token === "super") return { userId: "admin-1", email: "owner@example.com", roles: ["super_admin"] };
    if (token === "editor") {
      return { userId: "editor-1", email: "editor@example.com", roles: ["content_editor"] };
    }
    if (token === "live") {
      return { userId: "live-1", email: "live@example.com", roles: ["live_event_manager"] };
    }
    if (token === "orders") {
      return { userId: "orders-1", email: "orders@example.com", roles: ["order_manager"] };
    }
    if (token === "media") {
      return { userId: "media-1", email: "media@example.com", roles: ["media_manager"] };
    }
    return null;
  },
});

describe("authorization routes", () => {
  it("blocks anonymous writes to admin CMS routes", async () => {
    const response = await request(app).post("/api/admin/pages").send({ slug: "hack" });
    assert.equal(response.status, 401);
  });

  it("blocks anonymous theme updates", async () => {
    const response = await request(app).put("/api/admin/theme/draft").send({ tokens: {} });
    assert.equal(response.status, 401);
  });

  it("prevents content editors from exporting orders", async () => {
    const csv = await request(app).get("/api/admin/bookings.csv").set("Authorization", "Bearer editor");
    const orders = await request(app).get("/api/admin/orders").set("Authorization", "Bearer editor");
    assert.equal(csv.status, 403);
    assert.equal(orders.status, 403);
  });

  it("prevents live event managers from changing theme", async () => {
    const getTheme = await request(app).get("/api/admin/theme").set("Authorization", "Bearer live");
    const saveTheme = await request(app)
      .put("/api/admin/theme/draft")
      .set("Authorization", "Bearer live")
      .send({ tokens: { accent: "#000" } });
    assert.equal(getTheme.status, 403);
    assert.equal(saveTheme.status, 403);
  });

  it("prevents live managers from editing pages", async () => {
    const response = await request(app).get("/api/admin/pages").set("Authorization", "Bearer live");
    assert.equal(response.status, 403);
  });

  it("lets order managers read bookings and live managers read events", async () => {
    const bookings = await request(app).get("/api/admin/bookings").set("Authorization", "Bearer orders");
    const events = await request(app).get("/api/admin/live/events").set("Authorization", "Bearer live");
    assert.equal(bookings.status, 200);
    assert.equal(events.status, 200);
  });

  it("prevents media managers from editing site settings", async () => {
    const response = await request(app).get("/api/admin/settings").set("Authorization", "Bearer media");
    assert.equal(response.status, 403);
  });

  it("lets content editors reach pages but not users", async () => {
    const pages = await request(app).get("/api/admin/pages").set("Authorization", "Bearer editor");
    const users = await request(app).get("/api/admin/users").set("Authorization", "Bearer editor");
    assert.equal(pages.status, 200);
    assert.equal(users.status, 403);
  });

  it("lets super admin reach theme and users", async () => {
    const theme = await request(app).get("/api/admin/theme").set("Authorization", "Bearer super");
    const users = await request(app).get("/api/admin/users").set("Authorization", "Bearer super");
    assert.equal(theme.status, 200);
    assert.equal(users.status, 200);
  });
});
