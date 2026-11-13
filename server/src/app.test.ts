import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "./app";
import { decideAdminAccess } from "./auth/access";
import { applyDocumentMeta, escapeHtml } from "./html";

describe("admin access", () => {
  it("rejects a missing configuration", () => {
    assert.equal(decideAdminAccess({ configured: false, token: "x", user: null }).kind, "unconfigured");
  });

  it("rejects a missing or unknown token", () => {
    assert.equal(decideAdminAccess({ configured: true, token: null, user: null }).kind, "unauthenticated");
    assert.equal(
      decideAdminAccess({
        configured: true,
        token: "bad",
        user: null,
      }).kind,
      "unauthenticated",
    );
  });

  it("rejects a signed-in user with no role", () => {
    assert.equal(
      decideAdminAccess({
        configured: true,
        token: "token",
        user: { userId: "user-1", email: "person@example.com", roles: [] },
      }).kind,
      "forbidden",
    );
  });

  it("allows a super admin", () => {
    const decision = decideAdminAccess({
      configured: true,
      token: "token",
      user: { userId: "admin-1", email: "owner@example.com", roles: ["super_admin"] },
    });
    assert.equal(decision.kind, "ok");
    if (decision.kind === "ok") assert.deepEqual(decision.admin.roles, ["super_admin"]);
  });
});

describe("http", () => {
  const app = createApp({
    authConfigured: true,
    webDist: null,
    verifyToken: async (token) => {
      if (token === "super") return { userId: "admin-1", email: "owner@example.com", roles: ["super_admin"] };
      if (token === "norole") return { userId: "user-1", email: "person@example.com", roles: [] };
      return null;
    },
  });

  it("returns the verified studio facts", async () => {
    const response = await request(app).get("/api/public/site");
    assert.equal(response.status, 200);
    assert.equal(response.body.settings.businessNameTa, "ஒளியருவி டிஜிட்டல் கலர் லேப்");
    assert.equal(response.body.settings.phonePrimary, "0773928215");
    assert.equal(response.body.settings.phoneSecondary, "0777241958");
    assert.equal(response.body.settings.hours, null);
  });

  it("returns the homepage sections from defaults", async () => {
    const response = await request(app).get("/api/public/pages/home");
    assert.equal(response.status, 200);
    assert.equal(response.body.page.slug, "home");
    assert.ok(response.body.page.sections.length >= 5);
    assert.equal(response.body.page.sections[0].blockType, "hero");
  });

  it("rejects an invalid booking payload", async () => {
    const response = await request(app).post("/api/public/bookings").send({ name: "A" });
    assert.equal(response.status, 400);
  });

  it("blocks admin routes without a token", async () => {
    const response = await request(app).get("/api/admin/me");
    assert.equal(response.status, 401);
  });

  it("blocks a valid user who has no role", async () => {
    const response = await request(app).get("/api/admin/me").set("Authorization", "Bearer norole");
    assert.equal(response.status, 403);
  });

  it("lets a super admin read their account", async () => {
    const response = await request(app).get("/api/admin/me").set("Authorization", "Bearer super");
    assert.equal(response.status, 200);
    assert.equal(response.body.email, "owner@example.com");
    assert.deepEqual(response.body.roles, ["super_admin"]);
  });

  it("reports that Supabase is not configured", async () => {
    const unconfigured = createApp({ authConfigured: false, webDist: null });
    const response = await request(unconfigured).get("/api/admin/me").set("Authorization", "Bearer super");
    assert.equal(response.status, 503);
  });
});

describe("html", () => {
  it("escapes document text", () => {
    const html = applyDocumentMeta("<html><head><title>Old</title></head><body></body></html>", {
      title: "A <b>name</b>",
      description: 'Say "hello"',
      canonical: "http://localhost:4000/",
    });
    assert.equal(escapeHtml("A <b>"), "A &lt;b&gt;");
    assert.match(html, /<title>A &lt;b&gt;name&lt;\/b&gt;<\/title>/);
    assert.match(html, /rel="canonical" href="http:\/\/localhost:4000\/"/);
  });
});
