import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsPage });

const FIELDS: Array<{ key: string; label: string; fields: Array<{ name: string; label: string; type?: string }> }> = [
  { key: "facebook_pixel_id", label: "Facebook Pixel", fields: [{ name: "id", label: "Pixel ID" }] },
  { key: "facebook_capi", label: "Facebook Conversions API", fields: [{ name: "access_token", label: "Access Token", type: "password" }, { name: "test_event_code", label: "Test Event Code" }] },
  { key: "ecomdrive", label: "Ecomdrivebd", fields: [{ name: "api_key", label: "API Key", type: "password" }, { name: "base_url", label: "Base URL" }] },
  { key: "steadfast", label: "Steadfast Courier", fields: [{ name: "api_key", label: "API Key", type: "password" }, { name: "secret_key", label: "Secret Key", type: "password" }, { name: "base_url", label: "Base URL" }] },
  { key: "pathao", label: "Pathao Courier", fields: [{ name: "client_id", label: "Client ID" }, { name: "client_secret", label: "Client Secret", type: "password" }, { name: "username", label: "Username" }, { name: "password", label: "Password", type: "password" }, { name: "base_url", label: "Base URL" }] },
  { key: "payment_bkash", label: "bKash", fields: [{ name: "merchant_number", label: "Merchant Number" }, { name: "app_key", label: "App Key", type: "password" }, { name: "app_secret", label: "App Secret", type: "password" }] },
  { key: "payment_nagad", label: "Nagad", fields: [{ name: "merchant_number", label: "Merchant Number" }, { name: "merchant_id", label: "Merchant ID" }] },
  { key: "payment_sslcommerz", label: "SSLCommerz", fields: [{ name: "store_id", label: "Store ID" }, { name: "store_password", label: "Store Password", type: "password" }] },
];

function SettingsPage() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;
      return data;
    },
  });
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    const next: Record<string, Record<string, string>> = {};
    for (const r of rows) next[r.key] = (r.value as Record<string, string>) ?? {};
    setValues(next);
  }, [rows]);

  const save = useMutation({
    mutationFn: async (key: string) => {
      const { error } = await supabase.from("settings").upsert({ key, value: values[key] ?? {} }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_settings"] }); toast.success("সংরক্ষিত হয়েছে"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div><h1 className="text-3xl font-extrabold">Settings</h1><p className="text-sm text-muted-foreground">ইন্টিগ্রেশন ও API কনফিগারেশন</p></div>

      <div className="grid gap-5 lg:grid-cols-2">
        {FIELDS.map((group) => (
          <div key={group.key} className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="text-lg font-bold">{group.label}</h2>
            <div className="mt-4 space-y-3">
              {group.fields.map((f) => (
                <label key={f.name} className="block">
                  <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">{f.label}</span>
                  <input
                    type={f.type ?? "text"}
                    value={values[group.key]?.[f.name] ?? ""}
                    onChange={(e) => setValues((p) => ({ ...p, [group.key]: { ...p[group.key], [f.name]: e.target.value } }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </label>
              ))}
            </div>
            <button onClick={() => save.mutate(group.key)} disabled={save.isPending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-bold text-primary-foreground shadow-brand disabled:opacity-60">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
