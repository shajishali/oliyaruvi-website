import type { NextFunction, Request, Response } from "express";
import { decideAdminAccess, type VerifiedAdmin } from "../auth/access";
import { localAdminEnabled, verifyLocalToken } from "../auth/local";
import { verifyWithSupabase } from "../auth/verify";
import { isAuthConfigured } from "../db/client";

export type VerifyToken = (token: string) => Promise<VerifiedAdmin | null>;

export function requireStaff(options: { verifyToken?: VerifyToken; authConfigured?: boolean }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const configured = options.authConfigured ?? isAuthConfigured();
      const header = req.header("authorization") ?? "";
      const match = header.match(/^Bearer\s+(\S+)\s*$/i);
      const token = match?.[1] ?? null;
      let user: VerifiedAdmin | null = null;

      if (token && localAdminEnabled()) {
        user = verifyLocalToken(token);
      }

      if (!user && configured && token) {
        const verify = options.verifyToken ?? verifyWithSupabase;
        user = await verify(token);
      }

      if (!configured && localAdminEnabled()) {
        if (!token || !user) {
          res.status(401).json({ error: "Sign in required." });
          return;
        }
        res.locals.admin = user;
        next();
        return;
      }

      const decision = decideAdminAccess({ configured, token, user });
      if (decision.kind === "unconfigured") {
        res.status(503).json({ error: "Supabase is not configured." });
        return;
      }
      if (decision.kind === "unauthenticated") {
        res.status(401).json({ error: "Sign in required." });
        return;
      }
      if (decision.kind === "forbidden") {
        res.status(403).json({ error: "This account does not have an admin role." });
        return;
      }
      res.locals.admin = decision.admin;
      next();
    } catch (error) {
      next(error);
    }
  };
}
