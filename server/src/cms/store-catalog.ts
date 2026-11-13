import { readStore } from "./store";

export function mediaUrlFromStore(mediaId: string | null | undefined) {
  if (!mediaId) return null;
  const media = readStore().media.find((item) => item.id === mediaId && !item.deletedAt);
  return media?.url ?? null;
}

export function mediaMetaFromStore(mediaId: string | null | undefined) {
  if (!mediaId) return null;
  return readStore().media.find((item) => item.id === mediaId && !item.deletedAt) ?? null;
}

export function readAlbumsFromStore(categorySlug?: string) {
  const store = readStore();
  let albums = store.albums
    .filter((album) => !album.deletedAt && album.isVisible)
    .map((album) => {
      const category = store.photoCategories.find((item) => item.id === album.categoryId);
      return {
        id: album.id,
        slug: album.slug,
        titleEn: album.titleEn,
        titleTa: album.titleTa,
        descriptionEn: album.descriptionEn,
        descriptionTa: album.descriptionTa,
        sortOrder: album.sortOrder,
        isFeatured: album.isFeatured,
        coverMediaId: album.coverMediaId,
        categoryId: album.categoryId,
        categorySlug: category?.slug || "",
        categoryNameEn: category?.nameEn || "",
        categoryNameTa: category?.nameTa || "",
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (categorySlug) albums = albums.filter((album) => album.categorySlug === categorySlug);
  return albums;
}

export function readAlbumFromStore(slug: string) {
  const store = readStore();
  const album = store.albums.find((item) => item.slug === slug && !item.deletedAt && item.isVisible);
  if (!album) return null;
  const category = store.photoCategories.find((item) => item.id === album.categoryId);
  return {
    id: album.id,
    slug: album.slug,
    titleEn: album.titleEn,
    titleTa: album.titleTa,
    descriptionEn: album.descriptionEn,
    descriptionTa: album.descriptionTa,
    sortOrder: album.sortOrder,
    isFeatured: album.isFeatured,
    coverMediaId: album.coverMediaId,
    categoryId: album.categoryId,
    categorySlug: category?.slug || "",
    categoryNameEn: category?.nameEn || "",
    categoryNameTa: category?.nameTa || "",
    photographs: album.photographs
      .filter((photo) => photo.isVisible)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((photo) => {
        const media = mediaMetaFromStore(photo.mediaId);
        return {
          id: photo.id,
          sortOrder: photo.sortOrder,
          captionEn: photo.captionEn,
          captionTa: photo.captionTa,
          mediaId: photo.mediaId,
          url: media?.url ?? null,
          altEn: media?.altEn || "",
          altTa: media?.altTa || "",
          width: null as number | null,
          height: null as number | null,
        };
      }),
  };
}

export function readVideosFromStore() {
  const store = readStore();
  return store.videos
    .filter((video) => video.isVisible)
    .map((video) => {
      const collection = store.videoCollections.find((item) => item.id === video.collectionId);
      if (!collection?.isVisible) return null;
      const category = store.videoCategories.find((item) => item.id === collection.categoryId);
      return {
        id: video.id,
        titleEn: video.titleEn,
        titleTa: video.titleTa,
        descriptionEn: video.descriptionEn,
        descriptionTa: video.descriptionTa,
        sourceType: video.sourceType,
        youtubeUrl: video.youtubeUrl,
        durationSeconds: video.durationSeconds,
        sortOrder: video.sortOrder,
        isFeatured: video.isFeatured,
        collectionSlug: collection.slug,
        categorySlug: category?.slug || "",
        categoryNameEn: category?.nameEn || "",
      };
    })
    .filter((video): video is NonNullable<typeof video> => Boolean(video))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function readLiveChannelsFromStore() {
  return readStore()
    .liveChannels.filter((channel) => channel.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((channel) => ({
      id: channel.id,
      key: channel.key,
      kind: channel.kind,
      nameEn: channel.nameEn,
      nameTa: channel.nameTa,
      descriptionEn: channel.descriptionEn,
      descriptionTa: channel.descriptionTa,
      externalUrl: channel.externalUrl,
      sortOrder: channel.sortOrder,
    }));
}

export function readLiveEventsFromStore() {
  const store = readStore();
  return store.liveEvents
    .filter((event) => !event.deletedAt && event.isPublished && event.status !== "draft")
    .map((event) => {
      const channel = store.liveChannels.find((item) => item.id === event.channelId);
      return {
        id: event.id,
        titleEn: event.titleEn,
        titleTa: event.titleTa,
        descriptionEn: event.descriptionEn,
        descriptionTa: event.descriptionTa,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        status: event.status === "draft" ? "upcoming" : event.status,
        statusSource: event.statusSource,
        isFeatured: event.isFeatured,
        replayUrl: event.replayUrl,
        channelKey: channel?.key ?? null,
        channelNameEn: channel?.nameEn ?? null,
        channelKind: channel?.kind ?? null,
        links: event.links
          .filter((link) => Boolean(link.url?.trim()))
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((link) => ({
            id: link.id,
            platform: link.platform,
            url: link.url,
            labelEn: link.labelEn,
            labelTa: link.labelTa,
          })),
      };
    })
    .sort((a, b) => (a.startsAt || "").localeCompare(b.startsAt || ""));
}

export function readProductsFromStore(options: {
  catalogue?: "printing" | "gifts";
  featuredOnly?: boolean;
  categoryId?: string;
  limit?: number;
}) {
  const store = readStore();
  let products = store.products
    .filter((product) => !product.deletedAt && product.isAvailable)
    .map((product) => {
      const category = store.productCategories.find((item) => item.id === product.categoryId);
      if (!category?.isVisible) return null;
      return {
        id: product.id,
        slug: product.slug,
        nameEn: product.nameEn,
        nameTa: product.nameTa,
        descriptionEn: product.descriptionEn,
        descriptionTa: product.descriptionTa,
        enquiryLabelEn: product.enquiryLabelEn,
        enquiryLabelTa: product.enquiryLabelTa,
        sortOrder: product.sortOrder,
        isFeatured: product.isFeatured,
        showPrice: product.showPrice,
        catalogue: category.catalogue,
        categorySlug: category.slug,
        categoryNameEn: category.nameEn,
        variants: product.variants
          .filter((variant) => variant.isAvailable)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((variant) => ({
            id: variant.id,
            nameEn: variant.nameEn,
            nameTa: variant.nameTa,
            size: variant.size,
            material: variant.material,
            priceLkr: product.showPrice ? variant.priceLkr : null,
          })),
        images: product.images
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((image) => {
            const media = mediaMetaFromStore(image.mediaId);
            return {
              mediaId: image.mediaId,
              url: media?.url ?? null,
              altEn: media?.altEn || "",
              altTa: media?.altTa || "",
            };
          }),
      };
    })
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (options.catalogue) products = products.filter((product) => product.catalogue === options.catalogue);
  if (options.featuredOnly) products = products.filter((product) => product.isFeatured);
  if (options.categoryId) products = products.filter((product) => {
    const raw = store.products.find((item) => item.id === product.id);
    return raw?.categoryId === options.categoryId;
  });
  if (options.limit) products = products.slice(0, options.limit);
  return products;
}
