export const defaultSite = {
  businessName: "Oliyaruvi Digital Colour Lab",
  businessNameTa: "ஒளியருவி டிஜிட்டல் கலர் லேப்",
  locationEn: "Nelliady, Jaffna, Sri Lanka",
  locationTa: "",
  phonePrimary: "0773928215",
  phoneSecondary: "0777241958",
  whatsappNumber: "0773928215",
  experienceYears: 32,
  addressEn: null as string | null,
  addressTa: null as string | null,
  mapUrl: null as string | null,
  hours: null as unknown,
  socialLinks: [] as { label: string; url: string }[],
  announcementEn: null as string | null,
  announcementTa: null as string | null,
  announcementEnabled: false,
  contentVersion: 1,
};

export const defaultThemeTokens = {
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
};

export type NavItem = {
  labelEn: string;
  labelTa: string;
  href: string;
  linkType: "internal" | "external";
  sortOrder: number;
  openInNewTab: boolean;
  children: NavItem[];
};

const headerLabels = [
  ["Home", "/"],
  ["About", "/about"],
  ["Photography", "/photography"],
  ["Videography", "/videography"],
  ["Printing", "/printing"],
  ["Custom Gifts", "/gifts"],
  ["Live", "/live"],
  ["Portfolio", "/portfolio"],
  ["Contact", "/contact"],
] as const;

const footerLabels = [
  ["Photography", "/photography"],
  ["Videography", "/videography"],
  ["Printing", "/printing"],
  ["Custom Gifts", "/gifts"],
  ["Live", "/live"],
] as const;

function items(labels: readonly (readonly [string, string])[]): NavItem[] {
  return labels.map(([labelEn, href], sortOrder) => ({
    labelEn,
    labelTa: "",
    href,
    linkType: "internal" as const,
    sortOrder,
    openInNewTab: false,
    children: [],
  }));
}

export const defaultNavigation = {
  header: items(headerLabels),
  footer: items(footerLabels),
};

export const defaultDocumentMeta = {
  title: defaultSite.businessName,
  description:
    "Photography, videography, printing, custom gifts, and live streaming in Nelliady, Jaffna.",
};
