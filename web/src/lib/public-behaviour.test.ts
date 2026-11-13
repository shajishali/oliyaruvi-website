import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lightboxKeyAction } from "./lightbox-keys";
import { liveEventBadgeLabel, matchesLiveMode } from "./live-badge";

describe("live event badges", () => {
  it("labels live, upcoming, and ended from stored status", () => {
    assert.equal(liveEventBadgeLabel({ status: "upcoming", links: [] }), "upcoming");
    assert.equal(liveEventBadgeLabel({ status: "ended", links: [] }), "ended");
    assert.equal(
      liveEventBadgeLabel({ status: "live", links: [], statusSource: "manual" }),
      "Live · set by studio",
    );
    assert.equal(
      liveEventBadgeLabel({
        status: "live",
        links: [{ platform: "facebook" }],
        statusSource: "auto",
      }),
      "Live",
    );
  });

  it("filters modes against stored status", () => {
    assert.equal(matchesLiveMode("live", "upcoming", false), true);
    assert.equal(matchesLiveMode("upcoming", "upcoming", false), true);
    assert.equal(matchesLiveMode("ended", "upcoming", false), false);
    assert.equal(matchesLiveMode("ended", "past", false), true);
    assert.equal(matchesLiveMode("live", "featured", true), true);
  });
});

describe("lightbox keyboard behaviour", () => {
  it("opens close/prev/next actions from keys", () => {
    assert.equal(lightboxKeyAction("Escape"), "close");
    assert.equal(lightboxKeyAction("ArrowLeft"), "prev");
    assert.equal(lightboxKeyAction("ArrowRight"), "next");
    assert.equal(lightboxKeyAction("Enter"), null);
  });
});
