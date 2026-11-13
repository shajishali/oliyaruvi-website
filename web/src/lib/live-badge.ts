export type LiveBadgeEvent = {
  status: string;
  links: unknown[];
  statusSource?: string | null;
};

export function liveEventBadgeLabel(event: LiveBadgeEvent) {
  if (event.status === "live") {
    return event.links.length === 0 || event.statusSource === "manual" ? "Live · set by studio" : "Live";
  }
  return event.status;
}

export function matchesLiveMode(status: string, mode: "featured" | "upcoming" | "past", isFeatured: boolean) {
  if (mode === "featured") return isFeatured;
  if (mode === "past") return status === "ended";
  return status === "upcoming" || status === "live";
}
