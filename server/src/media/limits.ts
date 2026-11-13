export const MEDIA_LIMITS = {
  imageBytes: 15 * 1024 * 1024,
  videoBytes: 200 * 1024 * 1024,
  referenceBytes: 10 * 1024 * 1024,
  imageTypes: ["image/jpeg", "image/png", "image/webp"],
  videoTypes: ["video/mp4"],
  referenceTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
} as const;
