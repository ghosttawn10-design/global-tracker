import { Link, useLocation } from "wouter";
import { Globe2, Menu, X, Mail, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useGetSettings } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { data: settings } = useGetSettings({
    query: { queryKey: ["/api/settings"] },
  });

  const navLinks = [
    { href: "/track", label: "Track Shipment" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 max-w-screen-xl items-center px-4 md:px-6 mx-auto">
        <div className="flex items-center flex-1">
          <Link href="/" className="flex items-center gap-2.5 mr-10">
            {(settings as any)?.logoUrl ? (
              <img src={(settings as any).logoUrl} alt={settings?.companyName || "GlobalTrack"} className="h-8 max-w-[140px] object-contain" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <Globe2 className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-primary" />
                  <span className="font-bold tracking-tight text-foreground">
                    {settings?.companyName || "GlobalTrack"}
                  </span>
                </div>
              </>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/contact" className="hidden md:block">
            <Button size="sm" className="gap-2 h-9 rounded-lg font-medium">
              <Mail className="h-3.5 w-3.5" />
              Get Support
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden w-9 h-9 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border/50 mt-1">
                <Link href="/contact" onClick={() => setIsOpen(false)}>
                  <Button className="w-full gap-2 rounded-xl" size="sm">
                    <Mail className="h-4 w-4" />
                    Get Support
                  </Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
