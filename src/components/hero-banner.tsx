import { ShieldCheck, ThumbsUp, Truck, Headphones } from "lucide-react";
import heroBanner from "@/assets/hero-banner.png";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_top_right,white,transparent_55%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
        <div className="text-primary-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            🔥 Flash Sale চলছে
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            আপনার সমস্যার<br />
            <span className="text-secondary-foreground bg-secondary px-3 rounded-md">আমাদের সমাধান</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-primary-foreground/90 sm:text-lg">
            সমস্যার সমাধান, স্বস্তির নিশ্চয়তা — উন্নত মানের পণ্য, দ্রুত ডেলিভারি এবং বিশ্বস্ত সার্ভিস, একদম আপনার দরজায়।
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#products" className="inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-brand transition-transform hover:scale-105">
              এখনই অর্ডার করুন
            </a>
            <a href="#trust" className="inline-flex items-center justify-center rounded-full border-2 border-white/70 px-6 py-3 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/10">
              আরও জানুন
            </a>
          </div>
          <div className="mt-8 grid max-w-md grid-cols-4 gap-3 text-center">
            {[
              { icon: ShieldCheck, label: "উন্নত মানের পণ্য" },
              { icon: ThumbsUp, label: "বিশ্বস্ত সার্ভিস" },
              { icon: Truck, label: "দ্রুত ডেলিভারি" },
              { icon: Headphones, label: "২৪/৭ সাপোর্ট" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1.5">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary shadow-glow">
                  <b.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold leading-tight text-primary-foreground/90">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-3xl bg-secondary/30 blur-3xl" />
          <img src={heroBanner} alt="Nijer Bazaar premium products" className="relative w-full rounded-2xl shadow-2xl" />
        </div>
      </div>
    </section>
  );
}
