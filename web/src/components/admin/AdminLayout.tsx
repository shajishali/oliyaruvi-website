import { useEffect } from "react";
import { NavLink, Outlet, useNavigate, useOutletContext } from "react-router-dom";
import type { AdminMe } from "../../lib/types";
import { clearLocalAdminToken } from "../../lib/admin-auth";
import { supabase } from "../../lib/supabase";
import { adminRail } from "./rail";

export type AdminContext = {
  me: AdminMe;
  token: string;
};

export function AdminLayout() {
  const ctx = useOutletContext<AdminContext>();
  const { me } = ctx;
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin · Oliyaruvi";
    let tag = document.querySelector('meta[name="robots"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "robots");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", "noindex");
  }, []);

  async function signOut() {
    clearLocalAdminToken();
    await supabase?.auth.signOut();
    navigate("/admin/login");
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[17rem_1fr]">
      <aside className="border-b border-gold/20 bg-surface md:border-b-0 md:border-r">
        <div className="px-4 py-5">
          <p className="font-heading text-2xl italic text-gold">Oliyaruvi</p>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Admin</p>
        </div>
        <nav className="grid gap-1 px-3 pb-6" aria-label="Admin">
          {adminRail.map((item) =>
            item.enabled && item.href ? (
              <NavLink
                key={item.label + item.href}
                to={item.href}
                end={item.href === "/admin"}
                className={({ isActive }) => `rail-button${isActive ? " is-active" : ""}`}
              >
                {item.label}
              </NavLink>
            ) : (
              <div key={item.label}>
                <button type="button" className="rail-button" disabled title="Not built yet">
                  <span className="block">{item.label}</span>
                  <span className="block text-xs text-muted">Not built yet</span>
                </button>
                {item.children?.map((child) => (
                  <button key={child.label} type="button" className="rail-button pl-6" disabled title="Not built yet">
                    <span className="block">{child.label}</span>
                    <span className="block text-xs text-muted">Not built yet</span>
                  </button>
                ))}
              </div>
            ),
          )}
        </nav>
      </aside>
      <div>
        <header className="flex flex-wrap items-center gap-3 border-b border-gold/20 px-4 py-3 md:px-6">
          <input
            className="min-w-0 flex-1 rounded-full border border-gold/25 bg-background px-4 py-2 text-sm text-muted"
            placeholder="Search is not built yet"
            aria-label="Search, not built yet"
            disabled
          />
          <p className="text-sm text-muted">
            {me.email ?? "Admin"}
            {me.local ? " · local" : ""}
          </p>
          <button type="button" className="btn is-outline" onClick={() => void signOut()}>
            Sign out
          </button>
        </header>
        <div className="px-4 py-6 md:px-6">
          <Outlet context={ctx} />
        </div>
      </div>
    </div>
  );
}
