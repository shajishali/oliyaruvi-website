import { createHash, randomBytes, timingSafeEqual } from "crypto";
import type { VerifiedAdmin } from "./access";

const sessions = new Map<string, VerifiedAdmin>();

export function localAdminEnabled() {
  return process.env.ALLOW_LOCAL_ADMIN === "1" && Boolean(process.env.LOCAL_ADMIN_PASSWORD?.trim());
}

export function createLocalSession(email: string): string {
  const token = randomBytes(24).toString("hex");
  sessions.set(token, {
    userId: "local-admin",
    email: email.trim() || "local@oliyaruvi.local",
    roles: ["super_admin"],
  });
  return token;
}

export function verifyLocalToken(token: string): VerifiedAdmin | null {
  return sessions.get(token) ?? null;
}

export function destroyLocalSession(token: string) {
  sessions.delete(token);
}

export function passwordMatches(candidate: string) {
  const expected = process.env.LOCAL_ADMIN_PASSWORD?.trim() ?? "";
  if (!expected) return false;
  const left = createHash("sha256").update(candidate).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}
