import logo from "@/assets/logo.png";
import { Facebook, Phone, Mail, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-gradient-dark text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <img src={logo} alt="Nijer Bazaar" className="h-12 w-auto rounded-md" />
          <p className="mt-4 text-sm text-secondary-foreground/70">
            সমস্যার সমাধান, স্বস্তির নিশ্চয়তা। সারা বাংলাদেশে দ্রুত ডেলিভারি ও বিশ্বস্ত সেবা।
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-glow">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm text-secondary-foreground/80">
            <li><a href="/" className="hover:text-primary">হোম</a></li>
            <li><a href="/#products" className="hover:text-primary">সকল পণ্য</a></li>
            <li><a href="/#trust" className="hover:text-primary">কেন আমরা</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-glow">Policies</h4>
          <ul className="mt-4 space-y-2 text-sm text-secondary-foreground/80">
            <li>রিফান্ড পলিসি</li>
            <li>রিটার্ন পলিসি</li>
            <li>প্রাইভেসি পলিসি</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-glow">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-secondary-foreground/80">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> 09XXX-XXXXXX</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> support@nijerbazaarbd.com</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Dhaka, Bangladesh</li>
            <li className="flex items-center gap-2"><Facebook className="h-4 w-4 text-primary" /> /nijerbazaar</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-secondary-foreground/60">
        © {new Date().getFullYear()} Nijer Bazaar — সমস্যার সমাধান, স্বস্তির নিশ্চয়তা।
      </div>
    </footer>
  );
}
