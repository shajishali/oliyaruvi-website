import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

export const supabaseKeyError = key && isServiceRoleKey(key)
  ? "The browser is configured with the Supabase service role key. Remove it from VITE_SUPABASE_ANON_KEY."
  : null;

export const supabase: SupabaseClient | null =
  url && key && !supabaseKeyError ? createClient(url, key) : null;

function isServiceRoleKey(value: string) {
  const part = value.split(".")[1];
  if (!part) return false;
  try {
    const json = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))) as { role?: string };
    return json.role === "service_role";
  } catch {
    return false;
  }
}
