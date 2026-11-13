import { getAnonClient, getUserClient } from "../db/client";
import type { VerifiedAdmin } from "./access";

type RoleJoin = { key?: string } | { key?: string }[] | null;

export async function verifyWithSupabase(token: string): Promise<VerifiedAdmin | null> {
  const anon = getAnonClient();
  if (!anon) throw new Error("Supabase is not configured.");

  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) return null;

  const userClient = getUserClient(token);
  if (!userClient) throw new Error("Supabase is not configured.");

  const { data: rows, error: roleError } = await userClient.from("user_roles").select("roles(key)");
  if (roleError) throw roleError;

  const roles = (rows ?? [])
    .map((row) => roleKey((row as { roles: RoleJoin }).roles))
    .filter((key) => key.length > 0);

  return {
    userId: data.user.id,
    email: data.user.email ?? null,
    roles,
  };
}

function roleKey(value: RoleJoin) {
  if (Array.isArray(value)) return value[0]?.key ?? "";
  return value?.key ?? "";
}
