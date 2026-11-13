export type StoredCategory = {
  id: string;
  slug: string;
  sortOrder: number;
  nameEn: string;
  nameTa: string;
  isVisible: boolean;
};

export type StoredPhotoAlbum = {
  id: string;
  slug: string;
  categoryId: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  coverMediaId: string | null;
  sortOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
  deletedAt: string | null;
  photographs: {
    id: string;
    mediaId: string;
    captionEn: string;
    captionTa: string;
    sortOrder: number;
    isVisible: boolean;
  }[];
};

export type StoredVideoCollection = {
  id: string;
  slug: string;
  categoryId: string;
  titleEn: string;
  titleTa: string;
  isVisible: boolean;
  sortOrder: number;
};

export type StoredVideo = {
  id: string;
  collectionId: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  sourceType: "youtube" | "upload";
  youtubeUrl: string | null;
  mediaId: string | null;
  thumbnailMediaId: string | null;
  durationSeconds: number | null;
  sortOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
};

export type StoredLiveChannel = {
  id: string;
  key: string;
  kind: "platform" | "identity";
  nameEn: string;
  nameTa: string;
  descriptionEn: string;
  descriptionTa: string;
  externalUrl: string | null;
  sortOrder: number;
  isVisible: boolean;
};

export type StoredLiveEvent = {
  id: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  thumbnailMediaId: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: "draft" | "upcoming" | "live" | "ended";
  statusSource: "manual" | "provider";
  isFeatured: boolean;
  isPublished: boolean;
  replayUrl: string | null;
  channelId: string | null;
  deletedAt: string | null;
  links: {
    id: string;
    platform: string;
    url: string;
    labelEn: string;
    labelTa: string;
    sortOrder: number;
  }[];
};

export type StoredProductCategory = StoredCategory & {
  catalogue: "printing" | "gifts";
  descriptionEn: string;
  descriptionTa: string;
};

export type StoredProduct = {
  id: string;
  slug: string;
  categoryId: string;
  nameEn: string;
  nameTa: string;
  descriptionEn: string;
  descriptionTa: string;
  enquiryLabelEn: string;
  enquiryLabelTa: string;
  sortOrder: number;
  isFeatured: boolean;
  isAvailable: boolean;
  showPrice: boolean;
  deletedAt: string | null;
  variants: {
    id: string;
    nameEn: string;
    nameTa: string;
    size: string;
    material: string;
    priceLkr: number | null;
    isAvailable: boolean;
    sortOrder: number;
  }[];
  images: { mediaId: string; sortOrder: number }[];
};

export type InboxStatus = "new" | "reviewing" | "confirmed" | "declined" | "closed";

export type StoredBooking = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  eventDate: string | null;
  location: string;
  requirements: string;
  status: InboxStatus;
  assignedTo: string | null;
  notes: { id: string; body: string; createdAt: string; createdBy: string | null }[];
  references?: {
    id: string;
    fileName: string;
    mimeType: string;
    byteSize: number;
    storagePath: string;
    createdAt: string;
  }[];
  createdAt: string;
};

export type StoredEnquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: "contact" | "product" | "service";
  service: string;
  details: string;
  productId: string | null;
  status: InboxStatus;
  assignedTo: string | null;
  notes: { id: string; body: string; createdAt: string; createdBy: string | null }[];
  createdAt: string;
};

export type StoredOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentStatus: "unpaid" | "partial" | "paid";
  productionStatus: "queued" | "in_progress" | "ready" | "done";
  deliveryStatus: "none" | "pickup" | "out_for_delivery" | "delivered";
  notes: string;
  createdAt: string;
  updatedAt: string;
  lines: {
    id: string;
    productId: string | null;
    label: string;
    quantity: number;
    unitPriceLkr: number | null;
  }[];
};

export type StoredStaffUser = {
  id: string;
  email: string;
  roles: string[];
  invitedAt: string;
  status: "local" | "invited" | "active";
};

export type BusinessStoreSlice = {
  photoCategories: StoredCategory[];
  albums: StoredPhotoAlbum[];
  videoCategories: StoredCategory[];
  videoCollections: StoredVideoCollection[];
  videos: StoredVideo[];
  liveChannels: StoredLiveChannel[];
  liveEvents: StoredLiveEvent[];
  productCategories: StoredProductCategory[];
  products: StoredProduct[];
  bookings: StoredBooking[];
  enquiries: StoredEnquiry[];
  orders: StoredOrder[];
  staffUsers: StoredStaffUser[];
};
