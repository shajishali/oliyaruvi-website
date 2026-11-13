export type VerifiedAdmin = {
  userId: string;
  email: string | null;
  roles: string[];
};

export type AccessDecision =
  | { kind: "unconfigured" }
  | { kind: "unauthenticated" }
  | { kind: "forbidden" }
  | { kind: "ok"; admin: VerifiedAdmin };

export function decideAdminAccess(input: {
  configured: boolean;
  token: string | null;
  user: VerifiedAdmin | null;
}): AccessDecision {
  if (!input.configured) return { kind: "unconfigured" };
  if (!input.token || !input.user) return { kind: "unauthenticated" };
  if (input.user.roles.length === 0) return { kind: "forbidden" };
  return { kind: "ok", admin: input.user };
}
