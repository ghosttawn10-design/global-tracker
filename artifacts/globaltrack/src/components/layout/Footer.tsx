import { Link } from "wouter";
import { useGetSettings } from "@workspace/api-client-react";
import { Globe2, Mail, MapPin, Phone, Truck, ArrowRight } from "lucide-react";

export function Footer() {
  const { data: settings } = useGetSettings({
    query: { queryKey: ["/api/settings"] },
  });

  const year = new Date().getFullYear();
  const companyName = settings?.companyName || "GlobalTrack Logistique";

  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container max-w-screen-xl px-4 md:px-6 mx-auto py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              {(settings as any)?.logoUrl ? (
                <img src={(settings as any).logoUrl} alt={companyName} className="h-8 max-w-[140px] object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Globe2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-primary" />
                    <span className="font-bold tracking-tight">{companyName}</span>
                  </div>
                </>
              )}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              World-class logistics and premium shipment tracking for businesses that demand absolute precision and reliability.
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary font-medium">Live tracking operational worldwide</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Services</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/track", label: "Track a Package" },
                { href: "/contact", label: "Contact Support" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-primary flex items-center gap-1.5 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</h3>
            <ul className="space-y-3">
              {settings?.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <span className="text-sm text-muted-foreground">{settings.address}</span>
                </li>
              )}
              {settings?.contactEmail && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`mailto:${settings.contactEmail}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              {settings?.contactPhone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`tel:${settings.contactPhone}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {settings.contactPhone}
                  </a>
                </li>
              )}
              {!settings?.address && !settings?.contactEmail && !settings?.contactPhone && (
                <li className="text-sm text-muted-foreground">Contact info not configured</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Legal</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/cookies", label: "Cookie Policy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-primary flex items-center gap-1.5 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {year} {companyName}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Precision logistics, globally delivered.
          </p>
        </div>
      </div>
    </footer>
  );
}
