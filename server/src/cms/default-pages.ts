import type { PublicPage } from "./pages";

function hero(
  heading: string,
  headingTa: string,
  primaryHref: string,
  primaryLabel: string,
  secondaryHref = "",
  secondaryLabel = "",
  subheading = "",
) {
  return {
    id: "hero",
    blockType: "hero" as const,
    sortOrder: 0,
    isVisible: true,
    content: {
      mediaType: "image",
      mediaIds: [],
      autoplay: false,
      mute: true,
      loop: false,
      primaryHref,
      secondaryHref,
      en: {
        heading,
        subheading,
        body: "",
        primaryLabel,
        secondaryLabel,
      },
      ta: {
        heading: headingTa,
        subheading: "",
        body: "",
        primaryLabel: "",
        secondaryLabel: "",
      },
    },
    style: {},
    animation: { type: "fade" as const },
  };
}

function section(
  blockType: PublicPage["sections"][number]["blockType"],
  sortOrder: number,
  content: Record<string, unknown>,
) {
  return {
    id: `${blockType}-${sortOrder}`,
    blockType,
    sortOrder,
    isVisible: true,
    content,
    style: {},
    animation: { type: "rise" as const },
  };
}

const serviceItems = [
  { href: "/photography", icon: "camera", title: "Photography" },
  { href: "/videography", icon: "video", title: "Videography" },
  { href: "/printing", icon: "print", title: "Printing" },
  { href: "/gifts", icon: "gift", title: "Custom Gifts" },
  { href: "/live", icon: "live", title: "Live Streaming" },
].map((item) => ({
  href: item.href,
  icon: item.icon,
  en: { title: item.title, text: "" },
  ta: { title: "", text: "" },
}));

export const defaultPages: Record<string, PublicPage> = {
  home: {
    slug: "home",
    titleEn: "Oliyaruvi Digital Colour Lab",
    titleTa: "ஒளியருவி டிஜிட்டல் கலர் லேப்",
    descriptionEn:
      "Photography, videography, printing, custom gifts, and live streaming in Nelliady, Jaffna.",
    descriptionTa: "",
    sections: [
      hero(
        "Oliyaruvi Digital Colour Lab",
        "ஒளியருவி டிஜிட்டல் கலர் லேப்",
        "/photography",
        "View portfolio",
        "https://wa.me/94773928215",
        "WhatsApp",
        "Photography, videography, printing, and custom gifts in Nelliady.",
      ),
      section("services", 1, {
        en: { heading: "Services" },
        ta: { heading: "" },
        items: serviceItems,
      }),
      section("statistics", 2, {
        items: [
          {
            valueSource: "setting",
            settingKey: "experience_years",
            en: { label: "Years" },
            ta: { label: "" },
          },
        ],
      }),
      section("gallery", 3, {
        mediaIds: [],
        layout: "masonry",
        en: { heading: "Photographs" },
        ta: { heading: "" },
      }),
      section("video_gallery", 4, {
        en: { heading: "Films" },
        ta: { heading: "" },
      }),
      section("live_events", 5, {
        mode: "upcoming",
        limit: 3,
        en: { heading: "Live" },
        ta: { heading: "" },
      }),
      section("product_grid", 6, {
        catalogue: "printing",
        featuredOnly: true,
        limit: 4,
        en: { heading: "Printing" },
        ta: { heading: "" },
      }),
      section("product_grid", 7, {
        catalogue: "gifts",
        featuredOnly: true,
        limit: 4,
        en: { heading: "Custom gifts" },
        ta: { heading: "" },
      }),
      section("testimonials", 8, {
        featuredOnly: true,
        limit: 3,
        en: { heading: "Testimonials" },
        ta: { heading: "" },
      }),
      section("contact_form", 9, {
        purpose: "contact",
        showPhone: true,
        showWhatsapp: true,
        showMap: true,
        showHours: true,
        en: { heading: "Contact", intro: "" },
        ta: { heading: "", intro: "" },
      }),
    ],
  },
  photography: {
    slug: "photography",
    titleEn: "Photography",
    titleTa: "",
    descriptionEn: "",
    descriptionTa: "",
    sections: [
      hero("Photography", "", "/contact", "Enquire"),
      section("gallery", 1, {
        mediaIds: [],
        layout: "masonry",
        en: { heading: "Photographs" },
        ta: { heading: "" },
      }),
    ],
  },
  videography: {
    slug: "videography",
    titleEn: "Videography",
    titleTa: "",
    descriptionEn: "",
    descriptionTa: "",
    sections: [
      hero("Videography", "", "/contact", "Enquire"),
      section("video_gallery", 1, {
        en: { heading: "Films" },
        ta: { heading: "" },
      }),
    ],
  },
  printing: {
    slug: "printing",
    titleEn: "Printing",
    titleTa: "",
    descriptionEn: "",
    descriptionTa: "",
    sections: [
      hero("Printing", "", "/contact", "Request a quote"),
      section("text", 1, {
        en: {
          heading: "High quality prints",
          body: "Photo prints, albums, banners, stickers, and large-format work.",
        },
        ta: { heading: "", body: "" },
      }),
      section("statistics", 2, {
        items: [
          { valueSource: "literal", literalValue: "Premium", en: { label: "Print quality" }, ta: { label: "" } },
          { valueSource: "literal", literalValue: "Wide", en: { label: "Materials" }, ta: { label: "" } },
          { valueSource: "literal", literalValue: "Fast", en: { label: "Delivery" }, ta: { label: "" } },
          { valueSource: "literal", literalValue: "Durable", en: { label: "Finish" }, ta: { label: "" } },
        ],
      }),
      section("product_grid", 3, {
        catalogue: "printing",
        featuredOnly: false,
        limit: 12,
        en: { heading: "Printing services" },
        ta: { heading: "" },
      }),
      section("cta", 4, {
        href: "/contact?service=Printing",
        en: { heading: "Need a quote?", body: "", buttonLabel: "Request a quote" },
        ta: { heading: "", body: "", buttonLabel: "" },
      }),
    ],
  },
  gifts: {
    slug: "gifts",
    titleEn: "Custom gifts",
    titleTa: "",
    descriptionEn: "",
    descriptionTa: "",
    sections: [
      hero("Custom gifts", "", "/contact", "Enquire"),
      section("product_grid", 1, {
        catalogue: "gifts",
        featuredOnly: false,
        limit: 12,
        en: { heading: "Gifts" },
        ta: { heading: "" },
      }),
    ],
  },
  live: {
    slug: "live",
    titleEn: "Live streaming",
    titleTa: "",
    descriptionEn: "",
    descriptionTa: "",
    sections: [
      hero("Live streaming", "", "/contact", "Enquire"),
      section("live_events", 1, {
        mode: "featured",
        limit: 1,
        en: { heading: "Featured" },
        ta: { heading: "" },
      }),
      section("live_events", 2, {
        mode: "upcoming",
        limit: 6,
        en: { heading: "Upcoming" },
        ta: { heading: "" },
      }),
      section("live_events", 3, {
        mode: "past",
        limit: 6,
        en: { heading: "Past broadcasts" },
        ta: { heading: "" },
      }),
    ],
  },
  about: {
    slug: "about",
    titleEn: "About us",
    titleTa: "",
    descriptionEn: "",
    descriptionTa: "",
    sections: [
      hero("About us", "", "/contact", "Contact"),
      section("text", 1, {
        en: {
          heading: "The studio",
          body: "Oliyaruvi Digital Colour Lab is a photography and digital printing studio in Nelliady, Jaffna.",
        },
        ta: { heading: "", body: "" },
      }),
      section("services", 2, {
        en: { heading: "What we do" },
        ta: { heading: "" },
        items: serviceItems,
      }),
      section("custom_layout", 3, {
        columns: 1,
        columnContent: [
          {
            en: { heading: "Our story", body: "" },
            ta: { heading: "", body: "" },
          },
        ],
      }),
      section("custom_layout", 4, {
        columns: 2,
        columnContent: [
          { en: { heading: "Team", body: "Team details will appear here after the studio adds them." }, ta: { heading: "", body: "" } },
          { en: { heading: "Milestones", body: "Milestones will appear here after the studio adds them." }, ta: { heading: "", body: "" } },
        ],
      }),
      section("gallery", 5, {
        mediaIds: [],
        layout: "masonry",
        en: { heading: "Studio gallery" },
        ta: { heading: "" },
      }),
      section("cta", 6, {
        href: "/contact",
        en: { heading: "Visit us in Nelliady", body: "", buttonLabel: "Contact" },
        ta: { heading: "", body: "", buttonLabel: "" },
      }),
    ],
  },
  booking: {
    slug: "booking",
    titleEn: "Book a service",
    titleTa: "",
    descriptionEn: "",
    descriptionTa: "",
    sections: [
      hero("Book a service", "", "/contact", "Contact"),
      section("contact_form", 1, {
        purpose: "booking",
        showPhone: true,
        showWhatsapp: true,
        showMap: false,
        showHours: false,
        en: { heading: "Booking enquiry", intro: "The studio will review your request. This does not confirm a booking." },
        ta: { heading: "", intro: "" },
      }),
    ],
  },
  contact: {
    slug: "contact",
    titleEn: "Contact",
    titleTa: "",
    descriptionEn: "",
    descriptionTa: "",
    sections: [
      hero("Contact", "", "/booking", "Book a service"),
      section("contact_form", 1, {
        purpose: "contact",
        showPhone: true,
        showWhatsapp: true,
        showMap: true,
        showHours: true,
        en: { heading: "Enquiry", intro: "" },
        ta: { heading: "", intro: "" },
      }),
    ],
  },
  portfolio: {
    slug: "portfolio",
    titleEn: "Portfolio",
    titleTa: "",
    descriptionEn: "",
    descriptionTa: "",
    sections: [
      hero("Portfolio", "", "/photography", "Photography"),
      section("text", 1, {
        en: {
          heading: "Selected work",
          body: "Start with photography. This page can later hold a curated mix.",
        },
        ta: { heading: "", body: "" },
      }),
      section("cta", 2, {
        href: "/photography",
        en: { heading: "Browse photography", body: "", buttonLabel: "Photography" },
        ta: { heading: "", body: "", buttonLabel: "" },
      }),
    ],
  },
};
