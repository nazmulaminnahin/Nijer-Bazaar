import { Router } from "express";
import { createUserClient, supabaseAdmin } from "../lib/supabase.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return res.status(401).json({ error: error?.message ?? "Login failed" });
  }

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user!.id,
      email: data.user!.email,
    },
  });
});

router.post("/signup", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabaseAdmin.auth.signUp({ email, password });
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
    message: "Account created",
  });
});

router.post("/logout", requireAuth, async (_req, res) => {
  res.json({ ok: true });
});

router.get("/session", requireAuth, async (req: AuthRequest, res) => {
  const client = createUserClient(req.accessToken!);
  const { data, error } = await client.auth.getUser(req.accessToken!);
  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid session" });
  }
  res.json({ user: { id: data.user.id, email: data.user.email } });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", req.userId!)
    .eq("role", "admin")
    .maybeSingle();

  res.json({ isAdmin: !!data, userId: req.userId });
});

export default router;
