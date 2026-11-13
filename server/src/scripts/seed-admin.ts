import dotenv from "dotenv";
import path from "path";
import { getServiceRoleClient } from "../db/admin";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.log("SEED_SUPER_ADMIN_EMAIL is not set. No admin was granted.");
    return;
  }

  const client = getServiceRoleClient();
  if (!client) {
    throw new Error("Supabase service role is not configured.");
  }

  let page = 1;
  let foundId: string | null = null;
  let foundName = "";

  while (!foundId) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) {
      foundId = match.id;
      foundName = match.user_metadata?.full_name ?? match.email ?? "";
      break;
    }
    if (data.users.length < 200) break;
    page += 1;
  }

  if (!foundId) {
    console.log("No Auth user matches SEED_SUPER_ADMIN_EMAIL. No password was created.");
    return;
  }

  const { error: profileError } = await client.from("profiles").upsert({
    id: foundId,
    full_name: foundName,
  });
  if (profileError) throw profileError;

  const { data: role, error: roleError } = await client
    .from("roles")
    .select("id")
    .eq("key", "super_admin")
    .single();
  if (roleError) throw roleError;

  const { error: grantError } = await client.from("user_roles").upsert(
    { user_id: foundId, role_id: role.id },
    { onConflict: "user_id,role_id" },
  );
  if (grantError) throw grantError;

  console.log(`Granted super_admin to ${email}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
