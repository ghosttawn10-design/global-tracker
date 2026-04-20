import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Cookie } from "lucide-react";

const DEFAULT_CONTENT = `Cookies Policy

Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

1. WHAT ARE COOKIES
Cookies are small text files placed on your device when you visit our website. They help us provide a better experience by remembering your preferences and improving our services.

2. TYPES OF COOKIES WE USE

Essential Cookies: Necessary for the website to function properly. They enable core functionality such as security and session management.

Functional Cookies: These cookies remember your preferences to enhance your experience, such as language and region settings.

Analytics Cookies: We use analytics cookies to understand how visitors interact with our website to improve our services.

Performance Cookies: These cookies help us measure and improve the performance of our website.

3. MANAGING COOKIES
You can control and manage cookies through your browser settings. Most browsers allow you to view, delete, or block cookies. Disabling certain cookies may affect website functionality.

4. THIRD-PARTY COOKIES
Our website may use third-party services that set their own cookies, including analytics and live chat providers.

5. UPDATES TO THIS POLICY
We may update this Cookies Policy from time to time. Any changes will be posted on this page.

6. CONTACT US
If you have questions about our use of cookies, please contact us at contact@globaltrack.com.`;

export default function CookiesPage() {
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const content = (settings as any)?.cookiesPolicy || DEFAULT_CONTENT;
  const companyName = settings?.companyName || "GlobalTrack Logistique";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-slate-900 to-background border-b border-border/30 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
              <Cookie className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Cookies Policy</h1>
            <p className="text-muted-foreground mt-2">{companyName}</p>
          </motion.div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border bg-card p-8 prose prose-invert prose-sm max-w-none"
        >
          <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground font-sans">{content}</div>
        </motion.div>
      </div>
    </div>
  );
}
