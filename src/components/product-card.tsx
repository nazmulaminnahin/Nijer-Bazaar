import { Link } from "@tanstack/react-router";
import { ShoppingCart, Flame } from "lucide-react";
import { CountdownTimer } from "./countdown-timer";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

export function ProductCard({ product }: { product: Product }) {
  const images = (product.images as string[] | null) ?? [];
  const img = images[0] ?? "https://placehold.co/600x600/ff6b1a/ffffff?text=Nijer+Bazaar";
  const discount =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
      ? Math.round(((Number(product.compare_at_price) - Number(product.price)) / Number(product.compare_at_price)) * 100)
      : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-brand">
      <Link to="/products/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img src={img} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
              -{discount}%
            </span>
          )}
          {product.is_flash_sale && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-brand px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-brand">
              <Flame className="h-3 w-3" /> Flash
            </span>
          )}
          {product.is_pre_order && (
            <span className="absolute bottom-3 left-3 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
              Pre-Order
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-sm font-bold text-foreground sm:text-base">{product.name}</h3>
          {product.tagline && <p className="line-clamp-1 text-xs text-muted-foreground">{product.tagline}</p>}
          <div className="mt-auto flex items-end justify-between pt-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-primary">৳{Number(product.price).toLocaleString()}</span>
                {discount > 0 && (
                  <span className="text-xs text-muted-foreground line-through">৳{Number(product.compare_at_price).toLocaleString()}</span>
                )}
              </div>
            </div>
            <span className="text-xs font-semibold text-primary">বিস্তারিত</span>
          </div>
          {product.is_flash_sale && product.flash_sale_ends_at && (
            <div className="mt-2 border-t pt-2">
              <CountdownTimer endsAt={product.flash_sale_ends_at} compact />
            </div>
          )}
        </div>
      </Link>
      <div className="border-t border-border/60 p-4 pt-3">
        <Link
          to="/order/$slug"
          params={{ slug: product.slug }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-brand transition-transform hover:scale-[1.01]"
        >
          <ShoppingCart className="h-4 w-4" /> অর্ডার
        </Link>
      </div>
    </div>
  );
}
