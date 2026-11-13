import { getServiceRoleClient } from "../db/admin";

export async function signPrivatePath(storagePath: string) {
  const client = getServiceRoleClient();
  if (!client) throw new Error("Supabase service role is not configured.");
  const { data, error } = await client.storage.from("media-private").createSignedUrl(storagePath, 60);
  if (error) throw error;
  return data.signedUrl;
}
