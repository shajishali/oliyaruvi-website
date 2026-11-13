import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../../components/admin/useAdmin";
import { Card } from "../../components/ui/Card";
import { ApiError, getDashboard } from "../../lib/api";

type Dashboard = {
  counts: Record<string, number>;
  analytics: { status: string };
  quickActions: { label: string; href: string; enabled?: boolean }[];
  recentEnquiries?: { name?: string; status?: string; createdAt?: string }[];
  recentBookings?: { name?: string; status?: string; createdAt?: string }[];
};

export function DashboardPage() {
  const { token } = useAdmin();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getDashboard(token)
      .then((next) => {
        if (active) setData(next);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load dashboard");
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="grid max-w-5xl gap-6">
      <div>
        <h1 className="font-heading text-4xl">Dashboard</h1>
        <p className="mt-2 text-muted">Live counts from the CMS store. No invented analytics.</p>
      </div>
      {error ? (
        <p className="text-light-gold" role="alert">
          {error}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Published pages", data?.counts.publishedPages],
            ["Media files", data?.counts.media],
            ["Open enquiries", data?.counts.enquiries],
            ["Open orders", data?.counts.orders],
            ["Photos", data?.counts.photos],
            ["Videos", data?.counts.videos],
            ["Live events", data?.counts.liveEvents],
            ["Visible FAQs", data?.counts.faqs],
          ] as const
        ).map(([label, value]) => (
          <Card key={label}>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
            <p className="mt-2 font-heading text-3xl text-gold">{data ? (value ?? 0) : "…"}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-xl text-gold">Quick actions</h2>
          <ul className="mt-3 grid gap-2">
            {(data?.quickActions ?? []).map((action) =>
              action.enabled === false ? (
                <li key={action.label} className="text-muted">
                  {action.label} — not built yet
                </li>
              ) : (
                <li key={action.label}>
                  <Link className="text-light-gold underline-offset-4 hover:underline" to={action.href}>
                    {action.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </Card>
        <Card>
          <h2 className="text-xl text-gold">Analytics</h2>
          <p className="mt-2 text-muted">Not connected.</p>
        </Card>
        <Card>
          <h2 className="text-xl text-gold">Recent enquiries</h2>
          {(data?.recentEnquiries?.length ?? 0) === 0 ? (
            <p className="mt-2 text-muted">None yet.</p>
          ) : (
            <ul className="mt-3 grid gap-2 text-sm text-muted">
              {(data?.recentEnquiries as { name?: string; status?: string; createdAt?: string }[]).map((item, index) => (
                <li key={index}>
                  {item.name} · {item.status} · {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="text-xl text-gold">Recent bookings</h2>
          {(data?.recentBookings?.length ?? 0) === 0 ? (
            <p className="mt-2 text-muted">None yet.</p>
          ) : (
            <ul className="mt-3 grid gap-2 text-sm text-muted">
              {(data?.recentBookings as { name?: string; status?: string; createdAt?: string }[]).map((item, index) => (
                <li key={index}>
                  {item.name} · {item.status} · {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
