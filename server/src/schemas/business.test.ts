import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  inboxStatusSchema,
  liveEventSchema,
  orderSchema,
  productSchema,
} from "./business";

describe("product schema", () => {
  it("accepts a valid product", () => {
    const parsed = productSchema.parse({
      slug: "photo-print",
      categoryId: "cat-1",
      nameEn: "Photo print",
      showPrice: true,
      variants: [{ nameEn: "A4", priceLkr: 500, quantity: 1 }],
    });
    assert.equal(parsed.slug, "photo-print");
  });

  it("rejects a product without a name", () => {
    assert.equal(productSchema.safeParse({ slug: "x", categoryId: "c" }).success, false);
  });
});

describe("live event schema", () => {
  it("accepts known statuses", () => {
    for (const status of ["draft", "upcoming", "live", "ended"] as const) {
      assert.equal(
        liveEventSchema.safeParse({ titleEn: "Temple feast", status }).success,
        true,
      );
    }
  });

  it("rejects unknown live status values", () => {
    assert.equal(
      liveEventSchema.safeParse({ titleEn: "Temple feast", status: "streaming" }).success,
      false,
    );
  });
});

describe("order and inbox status schemas", () => {
  it("accepts a valid order", () => {
    const parsed = orderSchema.parse({
      customerName: "Customer",
      customerPhone: "0773928215",
      lines: [{ label: "Prints", quantity: 2 }],
    });
    assert.equal(parsed.paymentStatus, "unpaid");
  });

  it("rejects unknown payment status", () => {
    assert.equal(
      orderSchema.safeParse({
        customerName: "Customer",
        customerPhone: "0773928215",
        paymentStatus: "refunded",
        lines: [{ label: "Prints", quantity: 1 }],
      }).success,
      false,
    );
  });

  it("rejects unknown inbox status", () => {
    assert.equal(inboxStatusSchema.safeParse("spam").success, false);
    assert.equal(inboxStatusSchema.safeParse("reviewing").success, true);
  });
});
