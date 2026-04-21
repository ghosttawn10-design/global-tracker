import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingContact } from "./FloatingContact";
import { useGetSettings } from "@workspace/api-client-react";

export function MainLayout({ children }: { children: ReactNode }) {
  const { data: settings } = useGetSettings({
    query: { queryKey: ["/api/settings"] },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;

    const existing = document.getElementById("tawkto-widget");
    const enabled = Boolean((settings as any)?.tawktoEnabled);
    const scriptValue = String((settings as any)?.tawktoScript ?? "").trim();

    if (!enabled || !scriptValue) {
      existing?.remove();
      return;
    }

    const srcMatch = scriptValue.match(/s1\.src\s*=\s*['\"]([^'\"]+)['\"]/i);
    const urlMatch = scriptValue.match(/https:\/\/embed\.tawk\.to\/[^\s'\"]+/i);
    const src = (srcMatch?.[1] ?? urlMatch?.[0] ?? "").trim();
    if (!src) return;

    if (existing && (existing as HTMLScriptElement).src === src) return;
    existing?.remove();

    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.id = "tawkto-widget";
    s1.async = true;
    s1.src = src;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.body.appendChild(s1);
  }, [(settings as any)?.tawktoEnabled, (settings as any)?.tawktoScript]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContact />
    </div>
  );
}
