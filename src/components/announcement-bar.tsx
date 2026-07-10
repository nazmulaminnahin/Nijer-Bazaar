import { Truck, ShieldCheck, Headphones, Sparkles } from "lucide-react";

const items = [
  { icon: Truck, text: "সারাদেশে দ্রুত ডেলিভারি" },
  { icon: ShieldCheck, text: "১০০% বিশ্বস্ত সার্ভিস" },
  { icon: Sparkles, text: "উন্নত মানের পণ্য" },
  { icon: Headphones, text: "২৪/৭ কাস্টমার সাপোর্ট" },
];

export function AnnouncementBar() {
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden bg-secondary text-secondary-foreground">
      <div className="flex w-max animate-marquee gap-12 py-2.5 text-xs font-medium sm:text-sm">
        {loop.map((it, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <it.icon className="h-4 w-4 text-primary-glow" />
            <span>{it.text}</span>
            <span className="text-primary-glow">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
