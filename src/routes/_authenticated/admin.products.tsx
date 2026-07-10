import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit, X, Loader2 } from "lucide-react";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Product = Tables<"products">;

export const Route = createFileRoute("/_authenticated/admin/products")({ component: ProductsPage });

const emptyProduct: TablesInsert<"products"> = {
  slug: "", name: "", tagline: "", description: "", price: 0,
  compare_at_price: null, images: [], features: [], stock: 100,
  is_active: true, is_featured: false, is_flash_sale: false,
  flash_sale_ends_at: null, is_pre_order: false, pre_order_eta_days: "15-20",
  partial_advance: null,
};

function ProductsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["admin_products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (p: Partial<Product>) => {
      const payload = {
        ...p,
        price: Number(p.price),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
        partial_advance: p.partial_advance ? Number(p.partial_advance) : null,
        stock: Number(p.stock ?? 0),
      };
      if (p.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload as TablesInsert<"products">);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_products"] }); setEditing(null); toast.success("সংরক্ষিত হয়েছে"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_products"] }); toast.success("ডিলিট হয়েছে"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div><h1 className="text-3xl font-extrabold">Products</h1><p className="text-sm text-muted-foreground">{products.length} টি পণ্য</p></div>
        <button onClick={() => setEditing({ ...emptyProduct })}
          className="flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-brand">
          <Plus className="h-4 w-4" /> নতুন পণ্য
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const img = ((p.images as string[] | null) ?? [])[0] ?? "https://placehold.co/400x400/ff6b1a/white?text=NB";
          return (
            <div key={p.id} className="overflow-hidden rounded-2xl border bg-card shadow-card">
              <div className="relative aspect-video bg-muted">
                <img src={img} alt={p.name} className="h-full w-full object-cover" />
                {!p.is_active && <span className="absolute left-2 top-2 rounded bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">Inactive</span>}
                {p.is_pre_order && <span className="absolute right-2 top-2 rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">Pre-Order</span>}
              </div>
              <div className="p-4">
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-xs text-muted-foreground">/{p.slug}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-primary">৳{Number(p.price).toLocaleString()}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(p)} className="rounded-md p-1.5 hover:bg-muted"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => confirm("Delete?") && del.mutate(p.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {products.length === 0 && <div className="col-span-full rounded-2xl border-2 border-dashed p-12 text-center text-muted-foreground">কোনো পণ্য নেই — উপরে "নতুন পণ্য" বাটনে ক্লিক করুন</div>}
      </div>

      {editing && <ProductEditor value={editing} onChange={setEditing} onSave={() => save.mutate(editing)} onClose={() => setEditing(null)} saving={save.isPending} />}
    </div>
  );
}

function ProductEditor({
  value, onChange, onSave, onClose, saving,
}: { value: Partial<Product>; onChange: (v: Partial<Product>) => void; onSave: () => void; onClose: () => void; saving: boolean; }) {
  const set = (k: keyof Product, v: unknown) => onChange({ ...value, [k]: v });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{value.id ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Inp label="Name *" value={value.name ?? ""} onChange={(v) => set("name", v)} required />
            <Inp label="Slug *" value={value.slug ?? ""} onChange={(v) => set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} required />
          </div>
          <Inp label="Tagline" value={value.tagline ?? ""} onChange={(v) => set("tagline", v)} />
          <Field label="Description (landing page copy)">
            <textarea rows={4} value={value.description ?? ""} onChange={(e) => set("description", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </Field>
          <Field label="Features — one per line (How this solves your problem)">
            <textarea rows={4} value={(value.features as string[] | undefined ?? []).join("\n")}
              onChange={(e) => set("features", e.target.value.split("\n").filter(Boolean))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </Field>
          <Field label="Image URLs — one per line">
            <textarea rows={3} value={(value.images as string[] | undefined ?? []).join("\n")}
              onChange={(e) => set("images", e.target.value.split("\n").filter(Boolean))}
              placeholder="https://..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Inp label="Price ৳ *" type="number" value={String(value.price ?? "")} onChange={(v) => set("price", v)} required />
            <Inp label="Compare-at ৳" type="number" value={String(value.compare_at_price ?? "")} onChange={(v) => set("compare_at_price", v)} />
            <Inp label="Stock" type="number" value={String(value.stock ?? 0)} onChange={(v) => set("stock", v)} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Toggle label="Active" checked={!!value.is_active} onChange={(v) => set("is_active", v)} />
            <Toggle label="Featured" checked={!!value.is_featured} onChange={(v) => set("is_featured", v)} />
            <Toggle label="Flash Sale" checked={!!value.is_flash_sale} onChange={(v) => set("is_flash_sale", v)} />
            <Toggle label="Pre-Order" checked={!!value.is_pre_order} onChange={(v) => set("is_pre_order", v)} />
          </div>

          {value.is_flash_sale && (
            <Inp label="Flash sale ends at" type="datetime-local"
              value={value.flash_sale_ends_at ? new Date(value.flash_sale_ends_at).toISOString().slice(0, 16) : ""}
              onChange={(v) => set("flash_sale_ends_at", v ? new Date(v).toISOString() : null)} />
          )}
          {value.is_pre_order && (
            <div className="grid grid-cols-2 gap-3">
              <Inp label="ETA (days)" value={value.pre_order_eta_days ?? "15-20"} onChange={(v) => set("pre_order_eta_days", v)} />
              <Inp label="Partial advance ৳" type="number" value={String(value.partial_advance ?? "")} onChange={(v) => set("partial_advance", v)} />
            </div>
          )}

          <button type="submit" disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground shadow-brand disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} সংরক্ষণ করুন
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">{label}</span>{children}</label>;
}
function Inp({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return <Field label={label}>
    <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
  </Field>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-3 ${checked ? "border-primary bg-primary/5" : ""}`}>
      <span className="text-xs font-semibold">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-primary" />
    </label>
  );
}
