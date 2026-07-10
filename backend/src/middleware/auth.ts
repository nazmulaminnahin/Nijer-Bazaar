import type { Request, Response, NextFunction } from "express";
import { createUserClient, supabaseAdmin } from "../lib/supabase.js";

export type AuthRequest = Request & {
  userId?: string;
  accessToken?: string;
};

async function authenticate(req: AuthRequest): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const token = header.slice(7);
  const client = createUserClient(token);
  const { data, error } = await client.auth.getUser(token);

  if (error || !data.user) {
    return { ok: false, status: 401, error: "Invalid token" };
  }

  req.userId = data.user.id;
  req.accessToken = token;
  return { ok: true };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const result = await authenticate(req);
  if (!result.ok) {
    return res.status(result.status).json({ error: result.error });
  }
  next();
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const result = await authenticate(req);
  if (!result.ok) {
    return res.status(result.status).json({ error: result.error });
  }

  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", req.userId!)
    .eq("role", "admin")
    .maybeSingle();

  if (!data) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}
