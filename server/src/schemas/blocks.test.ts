import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { blockSchemas, blockTypeSchema, parseSectionContent } from "./blocks";

describe("block schemas", () => {
  for (const blockType of blockTypeSchema.options) {
    it(`accepts a minimal ${blockType} payload`, () => {
      const parsed = parseSectionContent(blockType, {});
      assert.ok(parsed);
      assert.equal(blockSchemas[blockType].safeParse({}).success, true);
    });
  }

  it("rejects an unknown block type", () => {
    assert.equal(parseSectionContent("unknown_block", {}), null);
  });

  it("rejects invalid hero mediaType", () => {
    assert.equal(blockSchemas.hero.safeParse({ mediaType: "gif" }).success, false);
  });

  it("rejects invalid product_grid catalogue", () => {
    assert.equal(blockSchemas.product_grid.safeParse({ catalogue: "food" }).success, false);
  });

  it("rejects invalid contact_form purpose", () => {
    assert.equal(blockSchemas.contact_form.safeParse({ purpose: "newsletter" }).success, false);
  });

  it("rejects invalid custom_layout columns", () => {
    assert.equal(blockSchemas.custom_layout.safeParse({ columns: 4 }).success, false);
  });

  it("rejects invalid animation type", () => {
    const result = parseSectionContent("text", { en: { heading: "Hi" } });
    assert.ok(result);
    assert.equal(blockSchemas.video_hero.safeParse({ sourceType: "vimeo" }).success, false);
  });
});
