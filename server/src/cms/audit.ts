import { randomUUID } from "crypto";
import type { VerifiedAdmin } from "../auth/access";
import { mutateStore, readStore } from "./store";

export function writeAudit(
  admin: VerifiedAdmin,
  action: string,
  entityType: string,
  entityId: string | null,
  summary: string,
) {
  mutateStore((store) => {
    store.audit.unshift({
      id: randomUUID(),
      actorId: admin.userId,
      actorEmail: admin.email,
      action,
      entityType,
      entityId,
      summary,
      createdAt: new Date().toISOString(),
    });
    store.audit = store.audit.slice(0, 500);
  });
}

export function listAudit(limit = 100) {
  return readStore().audit.slice(0, limit);
}
