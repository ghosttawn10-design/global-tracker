import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const DEFAULT_CONTENT = `Privacy Policy

Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

1. INFORMATION WE COLLECT
We collect information you provide directly to us, such as when you submit a shipment inquiry, contact form, or use our tracking services. This may include your name, email address, phone number, and shipment details.

2. HOW WE USE YOUR INFORMATION
We use the information we collect to process and track your shipments, communicate with you, respond to your inquiries, improve our services, and send operational notifications.

3. SHARING OF INFORMATION
We do not sell, trade, or otherwise transfer your personal information to outside parties except as necessary to provide our services or as required by law.

4. DATA SECURITY
We implement appropriate security measures to protect your personal information. Your data is stored securely in encrypted databases.

5. COOKIES
We use cookies to enhance your experience on our platform. You may disable cookies in your browser settings.

6. YOUR RIGHTS
You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.

7. CONTACT US
For any privacy-related questions, please contact us at contact@globaltrack.com.`;

export default function Privacy() {
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const content = (settings as any)?.privacyPolicy || DEFAULT_CONTENT;
  const companyName = settings?.companyName || "GlobalTrack Logistique";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-slate-900 to-background border-b border-border/30 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Privacy Policy</h1>
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
