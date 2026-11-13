import { openInboxCounts } from "./forms";
import { readStore } from "./store";

export function getDashboard() {
  const store = readStore();
  const pages = Object.values(store.pages).filter((page) => !page.deletedAt);
  const publishedPages = pages.filter((page) => page.published).length;
  const inbox = openInboxCounts();
  return {
    counts: {
      photos: store.albums.reduce(
        (total, album) => total + (album.deletedAt ? 0 : album.photographs.length),
        0,
      ),
      videos: store.videos.length,
      liveEvents: store.liveEvents.filter((event) => !event.deletedAt).length,
      enquiries: inbox.enquiries,
      orders: inbox.orders,
      media: store.media.filter((item) => !item.deletedAt).length,
      pages: pages.length,
      publishedPages,
      testimonials: store.testimonials.filter((item) => item.isVisible).length,
      faqs: store.faqs.filter((item) => item.isVisible).length,
      albums: store.albums.filter((album) => !album.deletedAt).length,
      products: store.products.filter((product) => !product.deletedAt).length,
      bookings: inbox.bookings,
    },
    recentEnquiries: store.enquiries.slice(0, 5),
    recentBookings: store.bookings.slice(0, 5),
    analytics: { status: "not_connected" as const },
    quickActions: [
      { label: "Edit homepage", href: "/admin/pages/home" },
      { label: "Add media", href: "/admin/media" },
      { label: "Create event", href: "/admin/live" },
      { label: "Add product", href: "/admin/printing" },
      { label: "Photography albums", href: "/admin/photography" },
    ],
  };
}
