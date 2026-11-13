import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { ApiError, getAdminAudit } from "../../lib/api";

type Entry = {
  id: string;
  summary: string;
  createdAt: string;
  actorEmail: string | null;
};

export function AuditPage() {
  const { token, me } = useAdmin();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminAudit(token)
      .then((data) => {
        if (active) setEntries(data.entries);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        if (caught instanceof ApiError && caught.status === 403) {
          setError("Only Super Admin can read the audit log.");
          return;
        }
        setError(caught instanceof ApiError ? caught.message : "Could not load audit log");
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="grid max-w-4xl gap-6">
      <div>
        <h1 className="font-heading text-4xl">Audit log</h1>
        <p className="mt-2 text-muted">
          Changes to pages, theme, navigation, media, and settings.
          {me.roles.includes("super_admin") ? "" : " Restricted to Super Admin."}
        </p>
      </div>
      {error ? (
        <p className="text-light-gold" role="alert">
          {error}
        </p>
      ) : null}
      <div className="grid gap-2">
        {entries.map((entry) => (
          <article key={entry.id} className="rounded-2xl border border-gold/15 bg-surface/30 px-4 py-3">
            <p className="text-sm text-muted">
              {new Date(entry.createdAt).toLocaleString()} · {entry.actorEmail || "unknown"}
            </p>
            <p className="mt-1 text-ink">{entry.summary}</p>
          </article>
        ))}
        {!error && entries.length === 0 ? <p className="text-muted">No entries yet.</p> : null}
      </div>
    </div>
  );
}
