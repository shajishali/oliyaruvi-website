export const defaultPhotoCategories = [
  ["wedding", "Weddings"],
  ["engagement", "Engagements"],
  ["pre_wedding", "Pre-weddings"],
  ["birthday", "Birthdays"],
  ["family", "Family events"],
  ["temple", "Temple festivals"],
  ["school", "School events"],
  ["portrait", "Portraits"],
  ["other", "Other events"],
].map(([slug, nameEn], sortOrder) => ({
  id: slug,
  slug,
  sortOrder,
  nameEn,
  nameTa: "",
}));

export const defaultVideoCategories = [
  ["wedding", "Wedding films"],
  ["highlight", "Highlight videos"],
  ["pre_wedding", "Pre-wedding films"],
  ["birthday", "Birthday films"],
  ["temple", "Temple festival videos"],
  ["promotional", "Promotional videos"],
  ["event", "Event coverage"],
].map(([slug, nameEn], sortOrder) => ({
  id: slug,
  slug,
  sortOrder,
  nameEn,
  nameTa: "",
}));

export const defaultPrintingCategories = [
  ["photo_prints", "Photo printing"],
  ["passport_id", "Passport and ID photos"],
  ["wedding_albums", "Wedding albums"],
  ["banners", "Banner printing"],
  ["flex", "Flex printing"],
  ["cloth_banners", "Cloth banners"],
  ["stickers", "Stickers"],
  ["large_format", "Large-format printing"],
  ["frames", "Frames"],
  ["name_boards", "Name boards"],
  ["other", "Other printing services"],
].map(([slug, nameEn], sortOrder) => ({
  id: `printing-${slug}`,
  catalogue: "printing" as const,
  slug,
  sortOrder,
  nameEn,
  nameTa: "",
  descriptionEn: "",
  descriptionTa: "",
}));

export const defaultGiftCategories = [
  ["mugs", "Printed mugs"],
  ["phone_covers", "Phone covers"],
  ["medals", "Medals"],
  ["trophies", "Trophies"],
  ["mementos", "Mementos"],
  ["crystal", "Crystal gifts"],
  ["frames", "Photo frames"],
  ["keychains", "Keychains"],
  ["other", "Personalized gifts"],
].map(([slug, nameEn], sortOrder) => ({
  id: `gifts-${slug}`,
  catalogue: "gifts" as const,
  slug,
  sortOrder,
  nameEn,
  nameTa: "",
  descriptionEn: "",
  descriptionTa: "",
}));

export const defaultLiveChannels = [
  ["facebook_live", "platform", "Facebook Live"],
  ["youtube_live", "platform", "YouTube Live"],
  ["yarl_rip_book", "identity", "Yarl Rip Book"],
  ["yarl_events", "identity", "Yarl Events"],
  ["yarl_tharisanam", "identity", "Yarl Tharisanam"],
].map(([key, kind, nameEn], sortOrder) => ({
  id: key,
  key,
  kind: kind as "platform" | "identity",
  nameEn,
  nameTa: "",
  descriptionEn: "",
  descriptionTa: "",
  externalUrl: null as string | null,
  sortOrder,
}));
