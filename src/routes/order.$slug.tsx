import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { createOrder, getProductBySlug, type Product } from "@/lib/local-store";

export const Route = createFileRoute("/order/$slug")({
  component: OrderPage,
});

const ZONES = [
  { value: "inside_dhaka", label: "ঢাকার ভিতরে", fee: 60 },
  { value: "outside_dhaka", label: "ঢাকার বাহিরে", fee: 120 },
];

function OrderPage() {
  const { slug } = Route.useParams();
  const [product] = useState<Product | null>(() => getProductBySlug(slug));

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zone, setZone] = useState(ZONES[0].value);
  const [qty, setQty] = useState(1);

  const fee = useMemo(() => ZONES.find((z) => z.value === zone)?.fee ?? 0, [zone]);
  const subtotal = Number(product?.price ?? 0) * qty;
  const total = subtotal + fee;

  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!product) return;
    const trimmed = { customer_name: name.trim(), phone: phone.trim(), address: address.trim() };
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
      toast.success(`অর্ডার সফল! Order #${data.order_number}`, { duration: 8000 });
      setName("");
      setPhone("");
      setAddress("");
      setQty(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "অর্ডার করতে সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) throw notFound();

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <Link to="/store" className="text-sm text-muted-foreground hover:text-primary">← স্টোরে ফিরুন</Link>

        <div className="mt-5 rounded-2xl border bg-card p-4 shadow-card sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img src={(product.images as string[] | null)?.[0] ?? "https://placehold.co/600x600/ff6b1a/ffffff?text=Nijer+Bazaar"} alt={product.name} className="h-24 w-24 rounded-xl object-cover" />
            <div>
              <h2 className="text-xl font-extrabold">{product.name}</h2>
              <p className="text-sm text-muted-foreground">{product.tagline}</p>
              <p className="mt-2 text-sm font-semibold text-primary">৳{Number(product.price).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-brand p-3 text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">অর্ডার করতে ফর্ম পূরণ করুন</h1>
                <p className="text-sm text-muted-foreground">ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">আপনার নাম *</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="যেমন: রহিম আহমেদ" className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none focus:border-primary" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">মোবাইল নম্বর *</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="01XXXXXXXXX" className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none focus:border-primary" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">সম্পূর্ণ ঠিকানা *</span>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} placeholder="বাসা, রোড, এলাকা, থানা, জেলা" className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none focus:border-primary" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">ডেলিভারি এরিয়া *</span>
                  <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-3 outline-none focus:border-primary">
                    {ZONES.map((z) => (
                      <option key={z.value} value={z.value}>{z.label} — ৳{z.fee}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">পরিমাণ</span>
                  <div className="flex items-stretch rounded-lg border border-input">
                    <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 text-lg font-bold text-primary">−</button>
                    <input value={qty} readOnly className="w-full bg-transparent text-center font-bold outline-none" />
                    <button type="button" onClick={() => setQty((q) => q + 1)} className="px-3 text-lg font-bold text-primary">+</button>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-6 space-y-2 rounded-xl bg-muted p-4 text-sm">
              <Row label="পণ্যের মূল্য" value={`৳${subtotal.toLocaleString()}`} />
              <Row label="ডেলিভারি ফি" value={`৳${fee.toLocaleString()}`} />
              <div className="border-t pt-2">
                <Row label={<span className="text-base font-bold">সর্বমোট</span>} value={<span className="text-xl font-extrabold text-primary">৳{total.toLocaleString()}</span>} />
              </div>
            </div>
            <button type="button" onClick={submit} disabled={submitting} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-4 text-base font-extrabold text-primary-foreground shadow-brand transition-transform hover:scale-[1.01] disabled:opacity-60">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              অর্ডার নিশ্চিত করুন — ৳{total.toLocaleString()}
            </button>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" /> ১০০% নিরাপদ অর্ডার, কোনো অগ্রিম পেমেন্ট নেই
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
