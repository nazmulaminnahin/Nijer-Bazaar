import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnnouncementBar } from "@/components/announcement-bar";
import { CountdownTimer } from "@/components/countdown-timer";
import { CheckoutForm } from "@/components/checkout-form";
import { StickyOrderButton } from "@/components/sticky-order-button";
import { CheckCircle2, Star, ShieldCheck, Truck, Award } from "lucide-react";
import { trackEvent } from "@/lib/pixel";
import { getProductBySlug, type Product } from "@/lib/local-store";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Nijer Bazaar` },
      { name: "description", content: "Nijer Bazaar — অর্ডার করুন এখনই, ক্যাশ অন ডেলিভারি সুবিধা।" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const [product] = useState<Product | null>(() => getProductBySlug(slug));
  const reviews = useMemo(() => [], []);

  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (product) trackEvent("ViewContent", { content_ids: [product.id], content_name: product.name, value: Number(product.price), currency: "BDT" });
  }, [product]);

  if (!product) throw notFound();

  const images = ((product.images as string[] | null) ?? []);
  const mainImg = images[activeImg] ?? "https://placehold.co/800x800/ff6b1a/ffffff?text=Nijer+Bazaar";
  const features = ((product.features as string[] | null) ?? []);
  const discount = product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
    ? Math.round(((Number(product.compare_at_price) - Number(product.price)) / Number(product.compare_at_price)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <AnnouncementBar />
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← সকল পণ্য</Link>

        <div className="mt-4 grid gap-8 md:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="overflow-hidden rounded-2xl border bg-muted">
              <img src={mainImg} alt={product.name} className="aspect-square w-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`overflow-hidden rounded-lg border-2 ${i === activeImg ? "border-primary" : "border-transparent"}`}>
                    <img src={img} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.is_pre_order && (
              <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                Pre-Order · Expected Delivery: {product.pre_order_eta_days} Days
              </span>
            )}
            {product.is_flash_sale && (
              <span className="ml-2 inline-block rounded-full bg-gradient-brand px-3 py-1 text-xs font-bold text-primary-foreground shadow-brand">
                🔥 Flash Sale
              </span>
            )}
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{product.name}</h1>
            {product.tagline && <p className="mt-2 text-base text-muted-foreground">{product.tagline}</p>}

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-primary">৳{Number(product.price).toLocaleString()}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">৳{Number(product.compare_at_price).toLocaleString()}</span>
                  <span className="rounded-md bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">-{discount}%</span>
                </>
              )}
            </div>

            {product.is_flash_sale && product.flash_sale_ends_at && (
              <div className="mt-4 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-3">
                <p className="mb-2 text-xs font-bold uppercase text-destructive">⚡ অফার শেষ হবে</p>
                <CountdownTimer endsAt={product.flash_sale_ends_at} />
              </div>
            )}

            {features.length > 0 && (
              <div className="mt-6 rounded-xl border bg-card p-5">
                <h3 className="mb-3 text-lg font-bold text-foreground">এই পণ্য কীভাবে আপনার সমস্যার সমাধান করবে:</h3>
                <ul className="space-y-2.5">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.description && (
              <div className="mt-5 rounded-xl bg-muted p-5 text-sm leading-relaxed text-foreground/90">
                {product.description}
              </div>
            )}

            {product.is_pre_order && product.partial_advance && (
              <div className="mt-5 rounded-xl border-2 border-secondary/30 bg-accent p-4 text-sm">
                💡 <span className="font-semibold">Optional partial advance:</span> ৳{Number(product.partial_advance)} (বাকি ক্যাশ অন ডেলিভারি)
              </div>
            )}

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { i: ShieldCheck, t: "১০০% Original" },
                { i: Truck, t: "Fast Delivery" },
                { i: Award, t: "Quality Tested" },
              ].map((b) => (
                <div key={b.t} className="flex items-center gap-2 rounded-lg border bg-card p-2.5 text-xs font-semibold">
                  <b.i className="h-4 w-4 text-primary" /> {b.t}
                </div>
              ))}
            </div>

            <Link to="/order/$slug" params={{ slug }} className="mt-6 hidden w-full items-center justify-center rounded-xl bg-gradient-brand px-6 py-4 text-base font-extrabold text-primary-foreground shadow-brand transition-transform hover:scale-[1.01] md:flex">
              {product.is_pre_order ? "Pre-Order Now" : "Order Now"} — ৳{Number(product.price).toLocaleString()}
            </Link>
          </div>
        </div>

        {/* Checkout */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr,1.1fr]">
          <div>
            <h2 className="text-2xl font-extrabold">📦 কাস্টমার রিভিউ</h2>
            <div className="mt-4 space-y-3">
              {reviews.length === 0 && <p className="text-sm text-muted-foreground">এই পণ্যের জন্য এখনো কোনো রিভিউ নেই।</p>}
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}</div>
                    <span className="text-sm font-semibold">{r.customer_name}</span>
                  </div>
                  <p className="mt-2 text-sm text-foreground/90">{r.comment}</p>
                  {r.image_url && <img src={r.image_url} alt="" className="mt-2 h-32 rounded-lg object-cover" />}
                </div>
              ))}
            </div>
          </div>
          <CheckoutForm product={product} />
        </div>
      </div>

      <SiteFooter />
      <StickyOrderButton label={product.is_pre_order ? "Pre-Order Now" : `অর্ডার করুন — ৳${Number(product.price).toLocaleString()}`} />
    </div>
  );
}
