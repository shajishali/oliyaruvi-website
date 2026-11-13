import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import type { VerifiedAdmin } from "../auth/access";
import {
  createPage,
  publishPage,
  publicPageFromStore,
  reorderSections,
  restoreVersion,
  saveDraft,
} from "./admin-pages";
import { clearStoreCache, resetStoreForTests } from "./store";

const admin: VerifiedAdmin = {
  userId: "editor-1",
  email: "editor@example.com",
  roles: ["content_editor"],
};

describe("CMS page workflows", () => {
  before(() => {
    clearStoreCache();
    resetStoreForTests();
  });

  it("creates a page, adds a hero, saves draft, publishes, edits, and restores", () => {
    const created = createPage(admin, { slug: "phase7-demo", titleEn: "Phase 7 Demo" });
    assert.ok(created);
    assert.equal(created.slug, "phase7-demo");
    assert.equal(created.hasPublished, false);

    const heroId = "hero-section-1";
    const textId = "text-section-1";
    const drafted = saveDraft(admin, created.id, [
      {
        id: heroId,
        blockType: "hero",
        sortOrder: 0,
        isVisible: true,
        content: { en: { heading: "First hero" }, ta: { heading: "" } },
      },
      {
        id: textId,
        blockType: "text",
        sortOrder: 1,
        isVisible: true,
        content: { en: { heading: "Body", body: "Hello" }, ta: {} },
      },
    ]);
    assert.equal(drafted?.hasDraft, true);
    assert.equal(drafted?.draft?.sections.length, 2);

    const published = publishPage(admin, created.id);
    assert.equal(published?.hasPublished, true);
    assert.equal(publicPageFromStore("phase7-demo")?.page.sections[0].blockType, "hero");

    const reordered = reorderSections(admin, created.id, [textId, heroId]);
    assert.deepEqual(
      reordered?.draft?.sections.map((section) => section.id),
      [textId, heroId],
    );

    const publishedOrder = publishPage(admin, created.id);
    assert.deepEqual(
      publishedOrder?.published?.sections.map((section) => section.id),
      [textId, heroId],
    );
    assert.deepEqual(
      publicPageFromStore("phase7-demo")?.page.sections.map((section) => section.id),
      [textId, heroId],
    );

    saveDraft(admin, created.id, [
      {
        id: heroId,
        blockType: "hero",
        sortOrder: 0,
        isVisible: true,
        content: { en: { heading: "Edited hero" }, ta: {} },
      },
    ]);

    const restored = restoreVersion(admin, created.id, 1);
    assert.ok(restored?.draft);
    assert.equal(restored.draft.sections[0].blockType, "hero");
    assert.equal(
      (restored.draft.sections[0].content as { en?: { heading?: string } }).en?.heading,
      "First hero",
    );
  });
});
