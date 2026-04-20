import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Globe2, LayoutDashboard, Truck, BarChart3, MessageSquare, Star, Settings, LogOut, Truck as TruckIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminLogout } from "@workspace/api-client-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/shipments", icon: Truck, label: "Shipments" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/contacts", icon: MessageSquare, label: "Contacts" },
  { href: "/admin/testimonials", icon: Star, label: "Testimonials" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

function isActive(current: string, target: string) {
  if (target === "/admin") return current === "/admin";
  return current.startsWith(target);
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { mutate: doLogout } = useAdminLogout({
    mutation: { onSuccess: () => logout() },
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="w-60 border-r border-border bg-card/50 flex-col hidden md:flex shrink-0">
        <div className="p-5 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Globe2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">GlobalTrack</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Admin</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(location, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/50">
          <button
            onClick={() => doLogout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 w-full transition-all duration-150"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="md:hidden border-b border-border bg-card/80 backdrop-blur-xl px-4 h-14 flex items-center justify-between sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Globe2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">GT Admin</span>
          </Link>
          <button
            onClick={() => doLogout()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </header>

        <main className="flex-1 overflow-auto pb-20 md:pb-0">{children}</main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/60">
          <div className="grid grid-cols-6 h-16">
            {navItems.map((item) => {
              const active = isActive(location, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                  <span className="text-[9px] font-medium">{item.label}</span>
                  {active && (
                    <div className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
