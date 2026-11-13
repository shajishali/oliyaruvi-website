import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Fields";
import { ApiError, getAdminMe, localAdminLogin } from "../../lib/api";
import { clearLocalAdminToken, setLocalAdminToken } from "../../lib/admin-auth";
import { supabase, supabaseKeyError } from "../../lib/supabase";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("local@oliyaruvi.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const canUseSupabase = Boolean(supabase) && !supabaseKeyError;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      if (canUseSupabase && supabase) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError || !data.session) {
          setError(signInError?.message ?? "Sign in failed.");
          setPending(false);
          return;
        }
        const me = await getAdminMe(data.session.access_token);
        if (me.roles.length === 0) {
          await supabase.auth.signOut();
          setError("This account does not have an admin role.");
          setPending(false);
          return;
        }
        clearLocalAdminToken();
        navigate("/admin");
        return;
      }

      const result = await localAdminLogin(email, password);
      setLocalAdminToken(result.token);
      navigate("/admin");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Sign in could not be confirmed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
      <Link to="/" className="font-heading text-3xl italic text-gold no-underline">
        Oliyaruvi
      </Link>
      <h1 className="mt-6 font-heading text-4xl">Admin sign in</h1>
      {supabaseKeyError ? (
        <p className="mt-4 text-muted" role="status">
          {supabaseKeyError}
        </p>
      ) : (
        <form className="mt-6 grid gap-4" onSubmit={(event) => void onSubmit(event)}>
          {!canUseSupabase ? (
            <p className="text-sm text-muted">
              Supabase is not connected. Local admin mode is available for this development machine.
            </p>
          ) : null}
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? (
            <p className="text-sm text-light-gold" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Signing in" : "Sign in"}
          </Button>
        </form>
      )}
    </main>
  );
}
