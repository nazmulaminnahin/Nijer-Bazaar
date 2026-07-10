import { ShieldCheck, Truck, ThumbsUp, Headphones, Award, RotateCcw } from "lucide-react";

const trust = [
  { icon: ShieldCheck, t: "১০০% নিরাপদ", d: "প্রতিটি পণ্য কোয়ালিটি চেক করা হয়" },
  { icon: Truck, t: "দ্রুত ডেলিভারি", d: "ঢাকার ভিতরে ২৪ ঘণ্টা, সারাদেশে ৪৮-৭২ ঘণ্টা" },
  { icon: ThumbsUp, t: "বিশ্বস্ত সার্ভিস", d: "হাজারো সন্তুষ্ট কাস্টমার আমাদের সাথে" },
  { icon: Headphones, t: "২৪/৭ সাপোর্ট", d: "যেকোনো সমস্যায় আমরা পাশে আছি" },
  { icon: Award, t: "প্রিমিয়াম কোয়ালিটি", d: "শুধুমাত্র সেরা পণ্য নির্বাচিত" },
  { icon: RotateCcw, t: "সহজ রিটার্ন", d: "পণ্য পছন্দ না হলে ৩ দিনের মধ্যে রিটার্ন" },
];

export function TrustBadges() {
  return (
    <section id="trust" className="bg-gradient-dark py-16 text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-glow">কেন আমরা সেরা</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">আপনার ভরসার নাম, Nijer Bazaar</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trust.map((it) => (
            <div key={it.t} className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-primary/50 hover:bg-white/10">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-brand shadow-brand transition-transform group-hover:scale-110">
                <it.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-base font-bold">{it.t}</h3>
                <p className="mt-1 text-sm text-secondary-foreground/70">{it.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
