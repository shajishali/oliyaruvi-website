import {
  defaultGiftCategories,
  defaultLiveChannels,
  defaultPhotoCategories,
  defaultPrintingCategories,
  defaultVideoCategories,
} from "./catalog-defaults";
import type { BusinessStoreSlice } from "./business-types";

export function emptyBusinessSlice(): BusinessStoreSlice {
  return {
    photoCategories: defaultPhotoCategories.map((item) => ({ ...item, isVisible: true })),
    albums: [],
    videoCategories: defaultVideoCategories.map((item) => ({ ...item, isVisible: true })),
    videoCollections: defaultVideoCategories.map((item) => ({
      id: `collection-${item.slug}`,
      slug: item.slug,
      categoryId: item.id,
      titleEn: item.nameEn,
      titleTa: "",
      isVisible: true,
      sortOrder: item.sortOrder,
    })),
    videos: [],
    liveChannels: defaultLiveChannels.map((item) => ({ ...item, isVisible: true })),
    liveEvents: [],
    productCategories: [...defaultPrintingCategories, ...defaultGiftCategories].map((item) => ({
      ...item,
      isVisible: true,
    })),
    products: [],
    bookings: [],
    enquiries: [],
    orders: [],
    staffUsers: [
      {
        id: "local-admin",
        email: "local@oliyaruvi.local",
        roles: ["super_admin"],
        invitedAt: new Date().toISOString(),
        status: "local",
      },
    ],
  };
}

export function ensureBusinessSlice<T extends Partial<BusinessStoreSlice>>(store: T): T & BusinessStoreSlice {
  const seed = emptyBusinessSlice();
  return {
    ...store,
    photoCategories: store.photoCategories ?? seed.photoCategories,
    albums: store.albums ?? seed.albums,
    videoCategories: store.videoCategories ?? seed.videoCategories,
    videoCollections: store.videoCollections ?? seed.videoCollections,
    videos: store.videos ?? seed.videos,
    liveChannels: store.liveChannels ?? seed.liveChannels,
    liveEvents: store.liveEvents ?? seed.liveEvents,
    productCategories: store.productCategories ?? seed.productCategories,
    products: store.products ?? seed.products,
    bookings: store.bookings ?? seed.bookings,
    enquiries: store.enquiries ?? seed.enquiries,
    orders: store.orders ?? seed.orders,
    staffUsers: store.staffUsers ?? seed.staffUsers,
  };
}
