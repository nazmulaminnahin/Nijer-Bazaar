import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnnouncementBar } from "@/components/announcement-bar";
import { HeroBanner } from "@/components/hero-banner";
import { TrustBadges } from "@/components/trust-badges";
import { ProductCard } from "@/components/product-card";
import { CountdownTimer } from "@/components/countdown-timer";
import { Flame, Sparkles, Package } from "lucide-react";
import { getVisibleProducts, type Product } from "@/lib/local-store";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const products = getVisibleProducts();

  const flash = products.filter((p) => p.is_flash_sale);
  const featured = products.filter((p) => p.is_featured && !p.is_flash_sale);
  const all = products.filter((p) => !p.is_flash_sale && !p.is_featured);
  const flashEnd = flash[0]?.flash_sale_ends_at;

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <SiteHeader />
      <HeroBanner />

      {flash.length > 0 && (
        <Section
          id="flash"
          icon={<Flame className="h-6 w-6 text-destructive" />}
          title="⚡ Flash Sale"
          subtitle="সীমিত সময়ের জন্য বিশেষ অফার"
          right={flashEnd ? <CountdownTimer endsAt={flashEnd} /> : null}
        >
          <ProductGrid products={flash} />
        </Section>
      )}

      {featured.length > 0 && (
        <Section
          id="featured"
          icon={<Sparkles className="h-6 w-6 text-primary" />}
          title="🔥 ট্রেন্ডিং প্রবলেম-সলভিং পণ্য"
          subtitle="আপনার দৈনন্দিন সমস্যার সমাধান"
        >
          <ProductGrid products={featured} />
        </Section>
      )}

      <Section
        id="products"
        icon={<Package className="h-6 w-6 text-primary" />}
        title="সকল পণ্য"
        subtitle="আমাদের সম্পূর্ণ কালেকশন"
      >
        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <ProductGrid products={all.length ? all : products} />
        )}
      </Section>

      <TrustBadges />
      <SiteFooter />
    </div>
  );
}

function Section({
  id, icon, title, subtitle, right, children,
}: { id: string; icon: React.ReactNode; title: string; subtitle: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">{icon}<p className="text-xs font-bold uppercase tracking-wider text-primary">Section</p></div>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function ProductGrid({ products }: { products: Array<Parameters<typeof ProductCard>[0]["product"]> }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
      <Package className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-bold text-foreground">এখনো পণ্য যোগ করা হয়নি</h3>
      <p className="mt-2 text-sm text-muted-foreground">শীঘ্রই নতুন পণ্য যোগ করা হবে।</p>
    </div>
  );
}
