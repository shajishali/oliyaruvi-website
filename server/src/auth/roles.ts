import type { VerifiedAdmin } from "./access";

export function isSuperAdmin(admin: VerifiedAdmin) {
  return admin.roles.includes("super_admin");
}

export function canEditContent(admin: VerifiedAdmin) {
  return isSuperAdmin(admin) || admin.roles.includes("content_editor");
}

export function canManageMedia(admin: VerifiedAdmin) {
  return isSuperAdmin(admin) || admin.roles.includes("media_manager");
}

export function canManageOrders(admin: VerifiedAdmin) {
  return isSuperAdmin(admin) || admin.roles.includes("order_manager");
}

export function canManageLive(admin: VerifiedAdmin) {
  return isSuperAdmin(admin) || admin.roles.includes("live_event_manager");
}

export function canPickMedia(admin: VerifiedAdmin) {
  return canEditContent(admin) || canManageMedia(admin) || canManageLive(admin);
}

export function canReadAudit(admin: VerifiedAdmin) {
  return isSuperAdmin(admin);
}
