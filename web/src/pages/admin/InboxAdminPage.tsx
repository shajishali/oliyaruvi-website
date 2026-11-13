import { useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field, SelectField, TextAreaField } from "../../components/ui/Fields";
import { ApiError, getAdminBookings, getAdminEnquiries, patchAdminBooking, patchAdminEnquiry } from "../../lib/api";
import { whatsAppHref } from "../../lib/phone";

type InboxItem = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
  service?: string;
  source?: string;
  details?: string;
  requirements?: string;
  notes: { id: string; body: string; createdAt: string }[];
};

const statuses = ["new", "reviewing", "confirmed", "declined", "closed"] as const;

export function BookingsAdminPage() {
  return <InboxPage kind="booking" title="Bookings" />;
}

export function EnquiriesAdminPage() {
  return <InboxPage kind="enquiry" title="Enquiries" />;
}

function InboxPage({ kind, title }: { kind: "booking" | "enquiry"; title: string }) {
  const { token } = useAdmin();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [status, setStatus] = useState("all");
  const [service, setService] = useState("all");
  const [note, setNote] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    if (kind === "booking") {
      const data = await getAdminBookings(token);
      setItems(data.bookings as InboxItem[]);
      return;
    }
    const data = await getAdminEnquiries(token);
    setItems(data.enquiries as InboxItem[]);
  }

  useEffect(() => {
    let active = true;
    refresh()
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load inbox");
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, kind]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (service !== "all") {
        const value = item.service || item.source || "";
        if (value !== service) return false;
      }
      return true;
    });
  }, [items, status, service]);

  const selected = filtered.find((item) => item.id === selectedId) || filtered[0] || null;

  async function updateSelected(patch: { status?: string; note?: string }) {
    if (!selected) return;
    if (kind === "booking") await patchAdminBooking(token, selected.id, patch);
    else await patchAdminEnquiry(token, selected.id, patch);
    setNote("");
    await refresh();
  }

  return (
    <div className="grid max-w-6xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl">{title}</h1>
          <p className="mt-2 text-muted">Status flow, notes, and WhatsApp from the customer phone.</p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            void (async () => {
              const path = kind === "booking" ? "/api/admin/bookings.csv" : "/api/admin/enquiries.csv";
              const apiBase = (import.meta.env.VITE_API_URL?.trim() ?? "").replace(/\/$/, "");
              const response = await fetch(`${apiBase}${path}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const text = await response.text();
              const blob = new Blob([text], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = `${kind}s.csv`;
              anchor.click();
              URL.revokeObjectURL(url);
            })()
          }
        >
          Export CSV
        </Button>
      </div>
      {error ? <p className="text-light-gold" role="alert">{error}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField id="status-filter" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </SelectField>
        <Field id="service-filter" label="Service / source filter" value={service === "all" ? "" : service} onChange={(e) => setService(e.target.value || "all")} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid gap-2">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rounded-2xl border px-4 py-3 text-left ${selected?.id === item.id ? "border-gold" : "border-gold/20"}`}
              onClick={() => setSelectedId(item.id)}
            >
              <span className="block text-gold">{item.name}</span>
              <span className="block text-sm text-muted">
                {item.status} · {new Date(item.createdAt).toLocaleString()}
              </span>
            </button>
          ))}
          {filtered.length === 0 ? <p className="text-muted">No items.</p> : null}
        </div>
        {selected ? (
          <aside className="grid h-fit gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4">
            <h2 className="font-heading text-2xl text-gold">{selected.name}</h2>
            <p className="text-muted">{selected.phone}</p>
            <p className="text-sm text-muted">{selected.service || selected.source}</p>
            <p>{selected.requirements || selected.details}</p>
            <SelectField
              id="item-status"
              label="Status"
              value={selected.status}
              onChange={(e) => void updateSelected({ status: e.target.value })}
            >
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </SelectField>
            <TextAreaField id="note" label="Internal note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void updateSelected({ note })}>Add note</Button>
              <Button variant="whatsapp" href={whatsAppHref(selected.phone)}>
                WhatsApp
              </Button>
            </div>
            <ul className="grid gap-2 text-sm text-muted">
              {selected.notes.map((entry) => (
                <li key={entry.id}>
                  {new Date(entry.createdAt).toLocaleString()}: {entry.body}
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
