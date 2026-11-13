export type RailItem = {
  label: string;
  href?: string;
  enabled: boolean;
  children?: { label: string; href?: string; enabled?: boolean }[];
};

export const adminRail: RailItem[] = [
  { label: "Dashboard", href: "/admin", enabled: true },
  { label: "Page Builder", href: "/admin/pages", enabled: true },
  { label: "Homepage", href: "/admin/pages/home", enabled: true },
  { label: "Navigation", href: "/admin/navigation", enabled: true },
  { label: "All Pages", href: "/admin/pages", enabled: true },
  { label: "Media Library", href: "/admin/media", enabled: true },
  { label: "Photography", href: "/admin/photography", enabled: true },
  { label: "Videography", href: "/admin/videography", enabled: true },
  {
    label: "Live Manager",
    href: "/admin/live",
    enabled: true,
    children: [
      { label: "Channels & events", href: "/admin/live", enabled: true },
      { label: "Facebook Live", href: "/admin/live", enabled: true },
      { label: "YouTube Live", href: "/admin/live", enabled: true },
      { label: "Yarl Rip Book", href: "/admin/live", enabled: true },
      { label: "Yarl Events", href: "/admin/live", enabled: true },
      { label: "Yarl Tharisanam", href: "/admin/live", enabled: true },
    ],
  },
  { label: "Printing Products", href: "/admin/printing", enabled: true },
  { label: "Custom Gifts", href: "/admin/gifts", enabled: true },
  { label: "Bookings", href: "/admin/bookings", enabled: true },
  { label: "Enquiries", href: "/admin/enquiries", enabled: true },
  { label: "Orders", href: "/admin/orders", enabled: true },
  { label: "Testimonials", href: "/admin/testimonials", enabled: true },
  { label: "FAQs", href: "/admin/faqs", enabled: true },
  { label: "Contact Details", href: "/admin/contact", enabled: true },
  { label: "SEO", href: "/admin/seo", enabled: true },
  { label: "Theme", href: "/admin/theme", enabled: true },
  { label: "Analytics", enabled: false },
  { label: "Users and Roles", href: "/admin/users", enabled: true },
  { label: "Site Settings", href: "/admin/settings", enabled: true },
  { label: "Audit Log", href: "/admin/audit", enabled: true },
];
