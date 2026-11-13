import type { NavResponse, SiteResponse, ThemeResponse } from "./types";

export const fallbackSite: SiteResponse = {
  source: "defaults",
  settings: {
    businessName: "Oliyaruvi Digital Colour Lab",
    businessNameTa: "ஒளியருவி டிஜிட்டல் கலர் லேப்",
    locationEn: "Nelliady, Jaffna, Sri Lanka",
    locationTa: "",
    phonePrimary: "0773928215",
    phoneSecondary: "0777241958",
    whatsappNumber: "0773928215",
    experienceYears: 32,
    addressEn: null,
    addressTa: null,
    mapUrl: null,
    hours: null,
    socialLinks: [],
    announcementEn: null,
    announcementTa: null,
    announcementEnabled: false,
    contentVersion: 1,
  },
};

export const fallbackNav: NavResponse = {
  source: "defaults",
  header: [
    ["Home", "/"],
    ["About", "/about"],
    ["Photography", "/photography"],
    ["Videography", "/videography"],
    ["Printing", "/printing"],
    ["Custom Gifts", "/gifts"],
    ["Live", "/live"],
    ["Portfolio", "/portfolio"],
    ["Contact", "/contact"],
  ].map(([labelEn, href], sortOrder) => ({
    labelEn,
    labelTa: "",
    href,
    linkType: "internal" as const,
    sortOrder,
    openInNewTab: false,
    children: [],
  })),
  footer: [
    ["Photography", "/photography"],
    ["Videography", "/videography"],
    ["Printing", "/printing"],
    ["Custom Gifts", "/gifts"],
    ["Live", "/live"],
  ].map(([labelEn, href], sortOrder) => ({
    labelEn,
    labelTa: "",
    href,
    linkType: "internal" as const,
    sortOrder,
    openInNewTab: false,
    children: [],
  })),
};

export const fallbackTheme: ThemeResponse = {
  source: "defaults",
  tokens: {
    color: {
      background: "#0B0B0D",
      surface: "#17171B",
      gold: "#D6AC57",
      lightGold: "#F3D58C",
      maroon: "#651C2A",
      text: "#F7F3EB",
      muted: "#B8B1A8",
    },
    font: {
      heading: "Playfair Display",
      body: "Inter",
      tamil: "Noto Sans Tamil",
    },
    radius: "999px",
    spacing: "4.5rem",
  },
};
