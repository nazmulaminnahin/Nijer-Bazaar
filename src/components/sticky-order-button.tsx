import { ShoppingBag } from "lucide-react";

export function StickyOrderButton({ label = "এখনই অর্ডার করুন" }: { label?: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 p-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.2)] backdrop-blur-md md:hidden">
      <a
        href="#checkout"
        className="flex w-full animate-pulse-glow items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-3.5 text-base font-extrabold text-primary-foreground"
      >
        <ShoppingBag className="h-5 w-5" /> {label}
      </a>
    </div>
  );
}
