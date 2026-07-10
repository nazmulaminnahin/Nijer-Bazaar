import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import logo from "@/assets/logo.png";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Nijer Bazaar" className="h-10 w-auto rounded-md" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link to="/" className="text-foreground/80 transition-colors hover:text-primary">হোম</Link>
          <a href="/#products" className="text-foreground/80 transition-colors hover:text-primary">পণ্য</a>
          <a href="/#trust" className="text-foreground/80 transition-colors hover:text-primary">কেন আমরা</a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="/#products"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-brand transition-transform hover:scale-105"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> এখনই কিনুন
          </a>
        </div>
      </div>
    </header>
  );
}
