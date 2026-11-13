import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { ApiError, getAdminUsers } from "../../lib/api";

export function UsersAdminPage() {
  const { token } = useAdmin();
  const [users, setUsers] = useState<{ id: string; email: string; roles: string[]; status: string }[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminUsers(token)
      .then((data) => {
        if (!active) return;
        setUsers(data.users as { id: string; email: string; roles: string[]; status: string }[]);
        setNote(data.note);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load users");
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="grid max-w-3xl gap-6">
      <div>
        <h1 className="font-heading text-4xl">Users and roles</h1>
        <p className="mt-2 text-muted">
          Super Admin, Content Editor, Media Manager, Order Manager, Live Event Manager. Permission checks are on the
          API.
        </p>
      </div>
      {error ? <p className="text-light-gold" role="alert">{error}</p> : null}
      <p className="text-muted">{note}</p>
      <div className="grid gap-3">
        {users.map((user) => (
          <article key={user.id} className="rounded-[1.25rem] border border-gold/20 bg-surface/30 p-4">
            <h2 className="text-xl text-gold">{user.email}</h2>
            <p className="text-sm text-muted">
              {user.roles.join(", ")} · {user.status}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
