import type {
  AdminMe,
  AdminMedia,
  AdminPageDetail,
  AdminPageSummary,
  Album,
  Category,
  Faq,
  LiveChannel,
  LiveEvent,
  NavItem,
  NavResponse,
  PageResponse,
  Photograph,
  Product,
  ProductCategory,
  PublicSection,
  SiteResponse,
  SiteSettings,
  Testimonial,
  ThemeResponse,
  VideoItem,
} from "./types";

const configured = import.meta.env.VITE_API_URL?.trim() ?? "";
const base = configured.replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init?.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  const response = await fetch(`${base}${path}`, { ...init, headers });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new ApiError(response.status, body.error ?? "Request failed");
  return body as T;
}

export function getJson<T>(path: string, token?: string) {
  return request<T>(path, undefined, token);
}

export function getSite() {
  return getJson<SiteResponse>("/api/public/site");
}

export function getNavigation() {
  return getJson<NavResponse>("/api/public/navigation");
}

export function getTheme() {
  return getJson<ThemeResponse>("/api/public/theme");
}

export function getPage(slug: string) {
  return getJson<PageResponse>(`/api/public/pages/${slug}`);
}

export function getPhotoCategories() {
  return getJson<{ categories: Category[] }>("/api/public/photo-categories");
}

export function getAlbums(category?: string) {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return getJson<{ albums: Album[] }>(`/api/public/albums${query}`);
}

export function getAlbum(slug: string) {
  return getJson<{ album: Album & { photographs: Photograph[] } }>(`/api/public/albums/${slug}`);
}

export function getVideoCategories() {
  return getJson<{ categories: Category[] }>("/api/public/video-categories");
}

export function getVideos() {
  return getJson<{ videos: VideoItem[] }>("/api/public/videos");
}

export function getLiveChannels() {
  return getJson<{ channels: LiveChannel[] }>("/api/public/live-channels");
}

export function getLiveEvents() {
  return getJson<{ events: LiveEvent[] }>("/api/public/live-events");
}

export function getProductCategories(catalogue?: "printing" | "gifts") {
  const query = catalogue ? `?catalogue=${catalogue}` : "";
  return getJson<{ categories: ProductCategory[] }>(`/api/public/product-categories${query}`);
}

export function getProducts(options: {
  catalogue?: "printing" | "gifts";
  featured?: boolean;
  categoryId?: string;
  limit?: number;
} = {}) {
  const params = new URLSearchParams();
  if (options.catalogue) params.set("catalogue", options.catalogue);
  if (options.featured) params.set("featured", "1");
  if (options.categoryId) params.set("categoryId", options.categoryId);
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.toString() ? `?${params}` : "";
  return getJson<{ products: Product[] }>(`/api/public/products${query}`);
}

export function getProduct(slug: string) {
  return getJson<{ product: Product }>(`/api/public/products/${slug}`);
}

export function getTestimonials(featured = false, limit = 20) {
  const params = new URLSearchParams();
  if (featured) params.set("featured", "1");
  params.set("limit", String(limit));
  return getJson<{ testimonials: Testimonial[] }>(`/api/public/testimonials?${params}`);
}

export function getFaqs(limit = 20) {
  return getJson<{ faqs: Faq[] }>(`/api/public/faqs?limit=${limit}`);
}

export function postBooking(body: Record<string, string>) {
  return request<{ id: string; message: string }>("/api/public/bookings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function postEnquiry(body: Record<string, string>) {
  return request<{ id: string; message: string }>("/api/public/enquiries", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getAdminMe(token: string) {
  return getJson<AdminMe>("/api/admin/me", token);
}

export function localAdminLogin(email: string, password: string) {
  return request<{ token: string; admin: AdminMe }>("/api/admin/local-login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function adminGet<T>(path: string, token: string) {
  return getJson<T>(path, token);
}

export function adminSend<T>(path: string, token: string, init: RequestInit) {
  return request<T>(path, init, token);
}

export function getDashboard(token: string) {
  return adminGet<{
    counts: Record<string, number>;
    analytics: { status: string };
    quickActions: { label: string; href: string; enabled?: boolean }[];
  }>("/api/admin/dashboard", token);
}

export function getAdminPages(token: string) {
  return adminGet<{ pages: AdminPageSummary[] }>("/api/admin/pages", token);
}

export function getAdminPage(token: string, id: string) {
  return adminGet<AdminPageDetail>(`/api/admin/pages/${id}`, token);
}

export function saveAdminDraft(token: string, id: string, sections: PublicSection[]) {
  return adminSend<AdminPageDetail>(`/api/admin/pages/${id}/draft`, token, {
    method: "PUT",
    body: JSON.stringify({ sections }),
  });
}

export function publishAdminPage(token: string, id: string) {
  return adminSend<AdminPageDetail>(`/api/admin/pages/${id}/publish`, token, { method: "POST", body: "{}" });
}

export function unpublishAdminPage(token: string, id: string) {
  return adminSend<AdminPageDetail>(`/api/admin/pages/${id}/unpublish`, token, { method: "POST", body: "{}" });
}

export function restoreAdminPage(token: string, id: string, version?: number) {
  return adminSend<AdminPageDetail>(`/api/admin/pages/${id}/restore`, token, {
    method: "POST",
    body: JSON.stringify(version ? { version } : {}),
  });
}

export function createAdminPage(token: string, body: { slug: string; titleEn?: string }) {
  return adminSend<AdminPageDetail>("/api/admin/pages", token, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminPageMeta(
  token: string,
  id: string,
  body: { slug?: string; seo?: AdminPageSummary["seo"] },
) {
  return adminSend<AdminPageDetail>(`/api/admin/pages/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function updateAdminMedia(
  token: string,
  id: string,
  body: { altEn?: string; altTa?: string; title?: string; folder?: string },
) {
  return adminSend<AdminMedia>(`/api/admin/media/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function duplicateAdminPage(token: string, id: string) {
  return adminSend<AdminPageDetail>(`/api/admin/pages/${id}/duplicate`, token, { method: "POST", body: "{}" });
}

export function deleteAdminPage(token: string, id: string) {
  return adminSend<{ ok: boolean }>(`/api/admin/pages/${id}`, token, { method: "DELETE" });
}

export function getAdminNavigation(token: string) {
  return adminGet<{ header: NavItem[]; footer: NavItem[] }>("/api/admin/navigation", token);
}

export function saveAdminNavigation(token: string, body: { header: NavItem[]; footer: NavItem[] }) {
  return adminSend<{ header: NavItem[]; footer: NavItem[] }>("/api/admin/navigation", token, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function getAdminTheme(token: string) {
  return adminGet<{ draft: unknown; published: unknown }>("/api/admin/theme", token);
}

export function saveAdminThemeDraft(token: string, body: unknown) {
  return adminSend("/api/admin/theme/draft", token, { method: "PUT", body: JSON.stringify(body) });
}

export function publishAdminTheme(token: string) {
  return adminSend("/api/admin/theme/publish", token, { method: "POST", body: "{}" });
}

export function getAdminMedia(token: string) {
  return adminGet<{ media: AdminMedia[] }>("/api/admin/media", token);
}

export async function uploadAdminMedia(token: string, file: File, folder = "library") {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const response = await fetch(`${base}/api/admin/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const body = (await response.json()) as AdminMedia & { error?: string };
  if (!response.ok) throw new ApiError(response.status, body.error ?? "Upload failed");
  return body;
}

export function deleteAdminMedia(token: string, id: string) {
  return adminSend<{ ok: boolean }>(`/api/admin/media/${id}`, token, { method: "DELETE" });
}

export function getAdminSettings(token: string) {
  return adminGet<SiteSettings>("/api/admin/settings", token);
}

export function saveAdminSettings(token: string, body: SiteSettings) {
  return adminSend<SiteSettings>("/api/admin/settings", token, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function getAdminTestimonials(token: string) {
  return adminGet<{ testimonials: Testimonial[] }>("/api/admin/testimonials", token);
}

export function saveAdminTestimonial(token: string, body: unknown, id?: string) {
  return adminSend(
    id ? `/api/admin/testimonials/${id}` : "/api/admin/testimonials",
    token,
    { method: id ? "PUT" : "POST", body: JSON.stringify(body) },
  );
}

export function deleteAdminTestimonial(token: string, id: string) {
  return adminSend(`/api/admin/testimonials/${id}`, token, { method: "DELETE" });
}

export function getAdminFaqs(token: string) {
  return adminGet<{ faqs: Faq[] }>("/api/admin/faqs", token);
}

export function saveAdminFaq(token: string, body: unknown, id?: string) {
  return adminSend(id ? `/api/admin/faqs/${id}` : "/api/admin/faqs", token, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(body),
  });
}

export function deleteAdminFaq(token: string, id: string) {
  return adminSend(`/api/admin/faqs/${id}`, token, { method: "DELETE" });
}

export function getAdminAudit(token: string) {
  return adminGet<{ entries: { id: string; summary: string; createdAt: string; actorEmail: string | null }[] }>(
    "/api/admin/audit",
    token,
  );
}

export function getAdminAlbums(token: string) {
  return adminGet<{ albums: Record<string, unknown>[] }>("/api/admin/albums", token);
}

export function saveAdminAlbum(token: string, body: unknown, id?: string) {
  return adminSend(id ? `/api/admin/albums/${id}` : "/api/admin/albums", token, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(body),
  });
}

export function deleteAdminAlbum(token: string, id: string) {
  return adminSend(`/api/admin/albums/${id}`, token, { method: "DELETE" });
}

export function getAdminVideos(token: string) {
  return adminGet<{ videos: Record<string, unknown>[]; collections: Record<string, unknown>[] }>(
    "/api/admin/videos",
    token,
  );
}

export function saveAdminVideo(token: string, body: unknown, id?: string) {
  return adminSend(id ? `/api/admin/videos/${id}` : "/api/admin/videos", token, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(body),
  });
}

export function deleteAdminVideo(token: string, id: string) {
  return adminSend(`/api/admin/videos/${id}`, token, { method: "DELETE" });
}

export function getAdminLiveChannels(token: string) {
  return adminGet<{ channels: Record<string, unknown>[] }>("/api/admin/live/channels", token);
}

export function saveAdminLiveChannel(token: string, id: string, body: unknown) {
  return adminSend(`/api/admin/live/channels/${id}`, token, { method: "PUT", body: JSON.stringify(body) });
}

export function getAdminLiveEvents(token: string, status = "all") {
  return adminGet<{ events: Record<string, unknown>[] }>(`/api/admin/live/events?status=${status}`, token);
}

export function saveAdminLiveEvent(token: string, body: unknown, id?: string) {
  return adminSend(id ? `/api/admin/live/events/${id}` : "/api/admin/live/events", token, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(body),
  });
}

export function deleteAdminLiveEvent(token: string, id: string) {
  return adminSend(`/api/admin/live/events/${id}`, token, { method: "DELETE" });
}

export function getAdminProducts(token: string, catalogue?: "printing" | "gifts") {
  const query = catalogue ? `?catalogue=${catalogue}` : "";
  return adminGet<{ products: Record<string, unknown>[]; categories: Record<string, unknown>[] }>(
    `/api/admin/products${query}`,
    token,
  );
}

export function saveAdminProduct(token: string, body: unknown, id?: string) {
  return adminSend(id ? `/api/admin/products/${id}` : "/api/admin/products", token, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(body),
  });
}

export function deleteAdminProduct(token: string, id: string) {
  return adminSend(`/api/admin/products/${id}`, token, { method: "DELETE" });
}

export function getAdminBookings(token: string) {
  return adminGet<{ bookings: Record<string, unknown>[] }>("/api/admin/bookings", token);
}

export function patchAdminBooking(token: string, id: string, body: unknown) {
  return adminSend(`/api/admin/bookings/${id}`, token, { method: "PATCH", body: JSON.stringify(body) });
}

export function getAdminEnquiries(token: string) {
  return adminGet<{ enquiries: Record<string, unknown>[] }>("/api/admin/enquiries", token);
}

export function patchAdminEnquiry(token: string, id: string, body: unknown) {
  return adminSend(`/api/admin/enquiries/${id}`, token, { method: "PATCH", body: JSON.stringify(body) });
}

export function getAdminOrders(token: string) {
  return adminGet<{ orders: Record<string, unknown>[] }>("/api/admin/orders", token);
}

export function saveAdminOrder(token: string, body: unknown, id?: string) {
  return adminSend(id ? `/api/admin/orders/${id}` : "/api/admin/orders", token, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(body),
  });
}

export function getAdminUsers(token: string) {
  return adminGet<{ users: Record<string, unknown>[]; inviteAvailable: boolean; note: string }>(
    "/api/admin/users",
    token,
  );
}

