import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";

const router = Router();

router.get("/", async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/:slug", async (req, res) => {
  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("slug", req.params.slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!product) return res.status(404).json({ error: "Product not found" });

  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .eq("product_id", product.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  res.json({ product, reviews: reviews ?? [] });
});

export default router;
