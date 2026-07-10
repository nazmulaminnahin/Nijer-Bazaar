import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, Truck, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { sendToCourier } from "@/lib/courier";
import { StatusPill } from "./admin.index";

type Status = Database["public"]["Enums"]["order_status"];

const STATUSES: Status[] = ["pending", "confirmed", "sent_to_ecomdrive", "shipped", "delivered", "pre_order", "cancelled"];

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ["admin_orders", filter],
    queryFn: async () => {
      let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_orders"] }); toast.success("স্ট্যাটাস আপডেট হয়েছে"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const dispatchCourier = useMutation({
    mutationFn: async (orderId: string) => {
      const o = orders.find((x) => x.id === orderId)!;
      const r = await sendToCourier("steadfast", {
        orderNumber: o.order_number, customerName: o.customer_name, phone: o.phone,
        address: o.address, amount: Number(o.total), itemDescription: o.product_name,
      });
      if (!r.ok) throw new Error(r.message);
      await supabase.from("orders").update({ status: "shipped", courier_provider: r.provider, courier_tracking: r.trackingId }).eq("id", orderId);
      return r;
    },
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ["admin_orders"] }); toast.success(`Courier dispatched · ${r.trackingId}`); },
    onError: (e: Error) => toast.error(e.message),
  });

  const sel = orders.find((o) => o.id === selected);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div><h1 className="text-3xl font-extrabold">Orders</h1><p className="text-sm text-muted-foreground">{orders.length} টি অর্ডার</p></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
        {STATUSES.map((s) => (<Chip key={s} active={filter === s} onClick={() => setFilter(s)}>{s.replace(/_/g, " ")}</Chip>))}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Order #</th><th>Customer</th><th>Phone</th><th>Product</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t transition-colors hover:bg-muted/50">
                  <td className="p-3 font-mono text-xs">{o.order_number}{o.is_pre_order && <span className="ml-1 rounded bg-secondary px-1 text-[9px] text-secondary-foreground">PRE</span>}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.phone}</td>
                  <td className="max-w-[180px] truncate">{o.product_name}</td>
                  <td className="font-bold">৳{Number(o.total).toLocaleString()}</td>
                  <td><StatusPill status={o.status} /></td>
                  <td className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td><button onClick={() => setSelected(o.id)} className="rounded-md p-1.5 hover:bg-muted"><Eye className="h-4 w-4" /></button></td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">কোনো অর্ডার নেই</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {sel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{sel.order_number}</h2>
                <p className="text-sm text-muted-foreground">{new Date(sel.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <Row k="Customer" v={sel.customer_name} />
              <Row k="Phone" v={sel.phone} />
              <Row k="Address" v={sel.address} />
              <Row k="Zone" v={`${sel.delivery_zone} (৳${sel.shipping_fee})`} />
              <Row k="Product" v={`${sel.product_name} × ${sel.quantity}`} />
              <Row k="Total" v={`৳${Number(sel.total).toLocaleString()}`} />
              <Row k="Payment" v={sel.payment_method} />
              {sel.courier_tracking && <Row k="Tracking" v={`${sel.courier_provider} · ${sel.courier_tracking}`} />}
            </dl>
            <div className="mt-5 space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">Update Status</label>
                <select defaultValue={sel.status}
                  onChange={(e) => updateStatus.mutate({ id: sel.id, status: e.target.value as Status })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <button onClick={() => dispatchCourier.mutate(sel.id)} disabled={dispatchCourier.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-brand px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-brand">
                <Truck className="h-4 w-4" /> Dispatch via Steadfast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${active ? "bg-primary text-primary-foreground shadow-brand" : "bg-card border hover:bg-muted"}`}>{children}</button>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) { return <div className="flex justify-between gap-3 border-b pb-1.5"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>; }
