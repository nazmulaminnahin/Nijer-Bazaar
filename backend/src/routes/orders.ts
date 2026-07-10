import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";

const router = Router();

router.post("/", async (req, res) => {
  const body = req.body ?? {};
  const trimmed = {
    customer_name: String(body.customer_name ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    address: String(body.address ?? "").trim(),
  };

  if (trimmed.customer_name.length < 2) {
    return res.status(400).json({ error: "সঠিক নাম লিখুন" });
  }
  if (!/^[0-9+\-\s]{6,}$/.test(trimmed.phone)) {
    return res.status(400).json({ error: "সঠিক ফোন নম্বর লিখুন" });
  }
  if (trimmed.address.length < 5) {
    return res.status(400).json({ error: "সম্পূর্ণ ঠিকানা লিখুন" });
  }

  const quantity = Number(body.quantity ?? 1);
  const subtotal = Number(body.subtotal);
  const total = Number(body.total);
  const shipping_fee = Number(body.shipping_fee);

  if (!Number.isFinite(total) || total < 0 || quantity <= 0) {
    return res.status(400).json({ error: "Invalid order totals" });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: trimmed.customer_name,
      phone: trimmed.phone,
      address: trimmed.address,
      delivery_zone: body.delivery_zone,
      shipping_fee,
      product_id: body.product_id ?? null,
      product_name: body.product_name,
      product_price: Number(body.product_price),
      quantity,
      subtotal,
      total,
      payment_method: body.payment_method ?? "cod",
      status: body.status ?? "pending",
      is_pre_order: !!body.is_pre_order,
    })
    .select("order_number")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
