import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { trackEvent } from "@/lib/pixel";
import { createOrder } from "@/lib/local-store";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const ZONES = [
  { value: "inside_dhaka", label: "ঢাকার ভিতরে", fee: 60 },
  { value: "outside_dhaka", label: "ঢাকার বাহিরে", fee: 120 },
];

interface Props {
  product: Product;
}

export function CheckoutForm({ product }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zone, setZone] = useState(ZONES[0].value);
  const [qty, setQty] = useState(1);

  const fee = useMemo(() => ZONES.find((z) => z.value === zone)?.fee ?? 0, [zone]);
  const subtotal = Number(product.price) * qty;
  const total = subtotal + fee;

  useEffect(() => {
    trackEvent("InitiateCheckout", { content_ids: [product.id], value: total, currency: "BDT" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const trimmed = {
      customer_name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };
    if (trimmed.customer_name.length < 2) { toast.error("সঠিক নাম লিখুন"); return; }
    if (!/^[0-9+\-\s]{6,}$/.test(trimmed.phone)) { toast.error("সঠিক ফোন নম্বর লিখুন"); return; }
    if (trimmed.address.length < 5) { toast.error("সম্পূর্ণ ঠিকানা লিখুন"); return; }

    setSubmitting(true);
    try {
      const data = createOrder({
        ...trimmed,
        delivery_zone: zone,
        shipping_fee: fee,
        product_id: product.id,
        product_name: product.name,
        product_price: Number(product.price),
        quantity: qty,
        subtotal,
        total,
        payment_method: "cod",
        status: product.is_pre_order ? "pre_order" : "pending",
        is_pre_order: product.is_pre_order,
      });
      trackEvent("Purchase", { value: total, currency: "BDT", content_ids: [product.id] });
      toast.success(`অর্ডার সফল! Order #${data.order_number}`, { duration: 8000 });
      setName(""); setPhone(""); setAddress(""); setQty(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "অর্ডার করতে সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      id="checkout"
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      className="rounded-2xl border-2 border-primary/20 bg-card p-5 shadow-card sm:p-7"
    >
      <div className="mb-5">
        <h3 className="text-2xl font-extrabold text-foreground">অর্ডার করতে ফর্ম পূরণ করুন</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {product.is_pre_order ? "প্রি-অর্ডার — ১৫-২০ দিনের মধ্যে ডেলিভারি" : "ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন"}
        </p>
      </div>

      <div className="space-y-4">
        <Field label="আপনার নাম *">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="যেমন: রহিম আহমেদ"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
        </Field>
        <Field label="মোবাইল নম্বর *">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="01XXXXXXXXX"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
        </Field>
        <Field label="সম্পূর্ণ ঠিকানা *">
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} placeholder="বাসা, রোড, এলাকা, থানা, জেলা"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ডেলিভারি এরিয়া *">
            <select value={zone} onChange={(e) => setZone(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30">
              {ZONES.map((z) => <option key={z.value} value={z.value}>{z.label} — ৳{z.fee}</option>)}
            </select>
          </Field>
          <Field label="পরিমাণ">
            <div className="flex items-stretch rounded-lg border border-input">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 text-lg font-bold text-primary">−</button>
              <input value={qty} readOnly className="w-full bg-transparent text-center text-base font-bold outline-none" />
              <button type="button" onClick={() => setQty((q) => q + 1)} className="px-3 text-lg font-bold text-primary">+</button>
            </div>
          </Field>
        </div>
      </div>

      <div className="my-5 space-y-2 rounded-xl bg-muted p-4 text-sm">
        <Row label="পণ্যের মূল্য" value={`৳${subtotal.toLocaleString()}`} />
        <Row label="ডেলিভারি ফি" value={`৳${fee}`} />
        <div className="border-t pt-2">
          <Row label={<span className="text-base font-bold">সর্বমোট</span>} value={<span className="text-xl font-extrabold text-primary">৳{total.toLocaleString()}</span>} />
        </div>
      </div>

      <button type="submit" disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-4 text-base font-extrabold text-primary-foreground shadow-brand transition-transform hover:scale-[1.01] disabled:opacity-60">
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {product.is_pre_order ? "প্রি-অর্ডার নিশ্চিত করুন" : "অর্ডার নিশ্চিত করুন"} — ৳{total.toLocaleString()}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-success" /> ১০০% নিরাপদ অর্ডার, কোনো অগ্রিম পেমেন্ট নেই
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}
function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return <div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span><span className="font-semibold text-foreground">{value}</span></div>;
}
