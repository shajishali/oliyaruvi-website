import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { Navigate, Outlet } from "react-router-dom";
import { ApiError, getAdminMe } from "../../lib/api";
import { clearLocalAdminToken, getLocalAdminToken } from "../../lib/admin-auth";
import { supabase, supabaseKeyError } from "../../lib/supabase";
import type { AdminMe } from "../../lib/types";

export function RequireStaff() {
  const { session, loading } = useSession();
  const [me, setMe] = useState<AdminMe | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "ready" | "forbidden" | "failed">("idle");

  useEffect(() => {
    if (loading) return;
    let active = true;
    const localToken = getLocalAdminToken();
    const accessToken = session?.access_token || localToken;
    if (!accessToken) {
      setState("failed");
      return;
    }
    getAdminMe(accessToken)
      .then((next) => {
        if (!active) return;
        setMe(next);
        setToken(accessToken);
        setState(next.roles.length > 0 ? "ready" : "forbidden");
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (localToken) clearLocalAdminToken();
        setState(error instanceof ApiError && error.status === 403 ? "forbidden" : "failed");
      });
    return () => {
      active = false;
    };
  }, [loading, session]);

  if (supabaseKeyError) {
    return <AdminMessage title="Admin sign-in is blocked">{supabaseKeyError}</AdminMessage>;
  }
  if (loading || state === "idle") {
    return <AdminMessage title="Checking access">Confirming this account with the server.</AdminMessage>;
  }
  if (!session && !getLocalAdminToken()) return <Navigate to="/admin/login" replace />;
  if (state === "forbidden") {
    return (
      <AdminMessage title="No admin role">
        This account can sign in, but it does not have an admin role.
        <button
          type="button"
          className="btn is-outline mt-4"
          onClick={() => {
            clearLocalAdminToken();
            void supabase?.auth.signOut();
          }}
        >
          Sign out
        </button>
      </AdminMessage>
    );
  }
  if (state !== "ready" || !me || !token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet context={{ me, token }} />;
}

function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}

function AdminMessage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-heading text-3xl text-gold">{title}</h1>
      <div className="mt-3 text-muted">{children}</div>
    </main>
  );
}
