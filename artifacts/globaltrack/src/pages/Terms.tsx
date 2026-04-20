import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const DEFAULT_CONTENT = `Terms of Service

Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

1. ACCEPTANCE OF TERMS
By accessing and using GlobalTrack Logistique ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.

2. DESCRIPTION OF SERVICE
GlobalTrack Logistique provides logistics tracking, shipment management, and related services. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.

3. SHIPMENT TRACKING
Our tracking information is provided in real-time from our logistics network. While we strive for accuracy, tracking data may occasionally be delayed due to circumstances beyond our control.

4. USER RESPONSIBILITIES
You agree to provide accurate information, maintain account security, not use the service unlawfully, and comply with all applicable laws and regulations.

5. LIABILITY LIMITATIONS
GlobalTrack Logistique shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.

6. INTELLECTUAL PROPERTY
All content and features of the Service are owned by GlobalTrack Logistique and protected by international intellectual property laws.

7. GOVERNING LAW
These Terms shall be governed by applicable laws. Any disputes shall be resolved through binding arbitration.

8. CHANGES TO TERMS
We may revise these Terms at any time. Continued use of the service after changes constitutes acceptance of the new Terms.

9. CONTACT
For questions about these Terms, contact us at legal@globaltrack.com.`;

export default function Terms() {
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const content = (settings as any)?.termsOfService || DEFAULT_CONTENT;
  const companyName = settings?.companyName || "GlobalTrack Logistique";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-slate-900 to-background border-b border-border/30 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Terms of Service</h1>
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
