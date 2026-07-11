import logo from "@/assets/logo.png";
import { Facebook, Phone, Mail, MapPin } from "lucide-react";
import { getSiteSettings } from "@/lib/local-store";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function SiteFooter() {
  const settings = getSiteSettings();

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
            {settings.quickLinks.map((link) => (
              <li key={link.href}><a href={link.href} className="hover:text-primary">{link.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-glow">Policies</h4>
          <Accordion type="single" collapsible className="mt-4 space-y-2 text-sm text-secondary-foreground/80">
            {settings.policies.map((policy) => (
              <AccordionItem key={policy.title} value={policy.title} className="border-b-0 rounded-lg bg-white/10 px-3">
                <AccordionTrigger className="py-2 text-left text-sm font-semibold text-secondary-foreground hover:no-underline">
                  {policy.title}
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-2 text-sm text-secondary-foreground/80">
                  {policy.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-glow">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-secondary-foreground/80">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {settings.contact.phone}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {settings.contact.email}</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {settings.contact.address}</li>
            <li className="flex items-center gap-2"><Facebook className="h-4 w-4 text-primary" /> {settings.contact.facebook}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-secondary-foreground/60">
        © {new Date().getFullYear()} Nijer Bazaar — সমস্যার সমাধান, স্বস্তির নিশ্চয়তা।
      </div>
    </footer>
  );
}
