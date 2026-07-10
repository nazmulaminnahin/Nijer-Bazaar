import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";

const router = Router();

router.get("/facebook-pixel", async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "facebook_pixel_id")
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  const pixelId = (data?.value as { id?: string } | null)?.id ?? "";
  res.json({ id: pixelId });
});

export default router;
