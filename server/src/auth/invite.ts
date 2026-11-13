import { z } from "zod";
import { getServiceRoleClient } from "../db/admin";

const emailSchema = z.string().email();

export async function inviteUser(email: string) {
  const parsed = emailSchema.parse(email);
  const client = getServiceRoleClient();
  if (!client) throw new Error("Supabase service role is not configured.");
  const { data, error } = await client.auth.admin.inviteUserByEmail(parsed);
  if (error) throw error;
  return data.user;
}
