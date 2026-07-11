import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnnouncementBar } from "@/components/announcement-bar";
import { ProductCard } from "@/components/product-card";
import { Package, ShoppingBag } from "lucide-react";
import { getVisibleProducts, type Product } from "@/lib/local-store";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/store")({
  component: StorePage,
});

function StorePage() {
  const [products] = useState<Product[]>(() => getVisibleProducts());
  const isLoading = false;

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <SiteHeader />

      <section className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <ShoppingBag className="h-4 w-4" /> Nijer Bazaar Store
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">আমাদের সকল পণ্য একসাথে</h1>
            <p className="mt-3 text-base text-muted-foreground">
              আপনার প্রয়োজনীয় পণ্য বেছে নিন, অর্ডার করুন এবং দ্রুত ডেলিভারি পান।
            </p>
          </div>
          <Link to="/" className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted">
            ← হোমে ফিরুন
          </Link>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">সকল পণ্য</h2>
            <p className="text-sm text-muted-foreground">{products.length} টি পণ্য উপলব্ধ</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border bg-card" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-bold">এখনও কোনো পণ্য নেই</h3>
            <p className="mt-2 text-sm text-muted-foreground">অ্যাডমিন প্যানেল থেকে নতুন পণ্য যোগ করুন।</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
