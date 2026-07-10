import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { requireAdmin } from "../middleware/auth.js";
import { sendToCourier } from "../lib/courier.js";

const router = Router();

router.use(requireAdmin);

router.get("/products", async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/products", async (req, res) => {
  const payload = normalizeProduct(req.body);
  const { data, error } = await supabaseAdmin.from("products").insert(payload).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.put("/products/:id", async (req, res) => {
  const payload = normalizeProduct(req.body);
  const { data, error } = await supabaseAdmin
    .from("products")
    .update(payload)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete("/products/:id", async (req, res) => {
  const { error } = await supabaseAdmin.from("products").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

router.get("/orders", async (req, res) => {
  const status = req.query.status as string | undefined;
  let query = supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });
  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.patch("/orders/:id/status", async (req, res) => {
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "Status is required" });

  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

router.post("/orders/:id/dispatch", async (req, res) => {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error || !order) return res.status(404).json({ error: "Order not found" });

  const result = await sendToCourier("steadfast", {
    orderNumber: order.order_number,
    customerName: order.customer_name,
    phone: order.phone,
    address: order.address,
    amount: Number(order.total),
    itemDescription: order.product_name,
  });

  if (!result.ok) return res.status(500).json({ error: result.message });

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: "shipped",
      courier_provider: result.provider,
      courier_tracking: result.trackingId,
    })
    .eq("id", req.params.id);

  if (updateError) return res.status(500).json({ error: updateError.message });
  res.json(result);
});

router.get("/settings", async (_req, res) => {
  const { data, error } = await supabaseAdmin.from("settings").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put("/settings/:key", async (req, res) => {
  const { value } = req.body ?? {};
  const { error } = await supabaseAdmin
    .from("settings")
    .upsert({ key: req.params.key, value: value ?? {} }, { onConflict: "key" });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

router.get("/stats", async (_req, res) => {
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const { count } = await supabaseAdmin
    .from("products")
    .select("*", { count: "exact", head: true });

  res.json({
    orders: orders ?? [],
    productCount: count ?? 0,
  });
});

function normalizeProduct(body: Record<string, unknown>) {
  return {
    ...body,
    price: Number(body.price),
    compare_at_price: body.compare_at_price ? Number(body.compare_at_price) : null,
    partial_advance: body.partial_advance ? Number(body.partial_advance) : null,
    stock: Number(body.stock ?? 0),
  };
}

export default router;
