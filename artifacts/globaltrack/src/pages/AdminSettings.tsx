import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Save, CheckCircle2, Building, MessageSquare, Share2, Mail, Server, Image, Upload, X, Shield, FileText, Cookie, KeyRound, Eye, EyeOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

function SettingsSection({ icon: Icon, title, children, delay = 0 }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border bg-card overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </motion.div>
  );
}

async function uploadFile(file: File): Promise<string> {
  const res = await fetch(`${API_BASE}/storage/uploads/request-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  const { uploadURL, objectPath } = await res.json();
  await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  const filename = objectPath.split("/").pop();
  return `${API_BASE}/storage/public-objects/${filename}`;
}

function ImageUploadButton({ onUploaded, uploading, setUploading, label = "Upload Image" }: {
  onUploaded: (url: string) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onUploaded(url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="gap-2"
      >
        {uploading ? (
          <><span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> Uploading...</>
        ) : (
          <><Upload className="h-3.5 w-3.5" /> {label}</>
        )}
      </Button>
    </>
  );
}

const DEFAULT_PRIVACY = `Privacy Policy

Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

1. INFORMATION WE COLLECT
We collect information you provide directly to us, such as when you submit a shipment inquiry, contact form, or use our tracking services. This may include your name, email address, phone number, and shipment details.

2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Process and track your shipments
- Communicate with you about your shipments
- Respond to your inquiries and provide customer support
- Improve our services and user experience
- Send operational notifications related to your shipments

3. SHARING OF INFORMATION
We do not sell, trade, or otherwise transfer your personal information to outside parties except as necessary to provide our services or as required by law. We may share your information with trusted logistics partners to fulfill shipment delivery.

4. DATA SECURITY
We implement appropriate security measures to protect your personal information. Your data is stored securely in encrypted databases and accessed only by authorized personnel.

5. COOKIES
We use cookies and similar tracking technologies to enhance your experience on our platform. You may disable cookies in your browser settings, though some features may not function properly without them.

6. YOUR RIGHTS
You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at the email address below.

7. CONTACT US
For any privacy-related questions, please contact us at contact@globaltrack.com.`;

const DEFAULT_TERMS = `Terms of Service

Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

1. ACCEPTANCE OF TERMS
By accessing and using GlobalTrack Logistique ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.

2. DESCRIPTION OF SERVICE
GlobalTrack Logistique provides logistics tracking, shipment management, and related services. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.

3. SHIPMENT TRACKING
Our tracking information is provided in real-time from our logistics network. While we strive for accuracy, tracking data may occasionally be delayed or incomplete due to circumstances beyond our control.

4. USER RESPONSIBILITIES
You agree to:
- Provide accurate and complete information when using our services
- Maintain the confidentiality of your account credentials
- Not use the service for any unlawful or prohibited purposes
- Comply with all applicable laws and regulations

5. LIABILITY LIMITATIONS
GlobalTrack Logistique shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount paid by you for the services in question.

6. INTELLECTUAL PROPERTY
All content, features, and functionality of the Service are owned by GlobalTrack Logistique and protected by international copyright, trademark, and other intellectual property laws.

7. GOVERNING LAW
These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration.

8. CHANGES TO TERMS
We may revise these Terms at any time. Continued use of the service after changes constitutes acceptance of the new Terms.

9. CONTACT
For questions about these Terms, contact us at legal@globaltrack.com.`;

const DEFAULT_COOKIES = `Cookies Policy

Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

1. WHAT ARE COOKIES
Cookies are small text files placed on your device when you visit our website. They help us provide a better experience by remembering your preferences and improving our services.

2. TYPES OF COOKIES WE USE

Essential Cookies: These are necessary for the website to function properly. They enable core functionality such as security, session management, and user authentication.

Functional Cookies: These cookies remember your preferences and settings to enhance your experience on our platform, such as your language and region settings.

Analytics Cookies: We use analytics cookies to understand how visitors interact with our website. This helps us improve our services and user experience.

Performance Cookies: These cookies help us measure and improve the performance of our website.

3. MANAGING COOKIES
You can control and manage cookies through your browser settings. Most browsers allow you to:
- View cookies stored on your device
- Delete cookies individually or all at once
- Block cookies from specific or all websites
- Set preferences for certain types of cookies

Please note that disabling certain cookies may affect the functionality of our website.

4. THIRD-PARTY COOKIES
Our website may use third-party services that set their own cookies. These include analytics services and live chat providers. We have no control over these third-party cookies.

5. UPDATES TO THIS POLICY
We may update this Cookies Policy from time to time. Any changes will be posted on this page.

6. CONTACT US
If you have questions about our use of cookies, please contact us at contact@globaltrack.com.`;

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const [saved, setSaved] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [credSaved, setCredSaved] = useState(false);
  const [credSaving, setCredSaving] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    heroTitle: "",
    heroSubtitle: "",
    primaryColor: "#0066FF",
    logoUrl: "",
    heroImages: "",
    heroImageSlideEnabled: false,
    heroImageSlideInterval: 5,
    whatsappNumber: "",
    whatsappEnabled: false,
    telegramLink: "",
    telegramEnabled: false,
    tawktoScript: "",
    tawktoEnabled: false,
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    darkModeDefault: true,
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    smtpFrom: "",
    smtpTo: "",
    smtpEnabled: false,
    privacyPolicy: "",
    termsOfService: "",
    cookiesPolicy: "",
    businessHours: "",
    businessHoursTimezone: "America/New_York",
  });

  const [credForm, setCredForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        companyName: settings.companyName ?? "",
        heroTitle: settings.heroTitle ?? "",
        heroSubtitle: settings.heroSubtitle ?? "",
        primaryColor: settings.primaryColor ?? "#0066FF",
        logoUrl: (settings as any).logoUrl ?? "",
        heroImages: (settings as any).heroImages ?? "",
        heroImageSlideEnabled: (settings as any).heroImageSlideEnabled ?? false,
        heroImageSlideInterval: (settings as any).heroImageSlideInterval ?? 5,
        whatsappNumber: settings.whatsappNumber ?? "",
        whatsappEnabled: settings.whatsappEnabled ?? false,
        telegramLink: settings.telegramLink ?? "",
        telegramEnabled: settings.telegramEnabled ?? false,
        tawktoScript: settings.tawktoScript ?? "",
        tawktoEnabled: settings.tawktoEnabled ?? false,
        facebookUrl: settings.facebookUrl ?? "",
        twitterUrl: settings.twitterUrl ?? "",
        instagramUrl: settings.instagramUrl ?? "",
        linkedinUrl: settings.linkedinUrl ?? "",
        contactEmail: settings.contactEmail ?? "",
        contactPhone: settings.contactPhone ?? "",
        address: settings.address ?? "",
        darkModeDefault: settings.darkModeDefault ?? true,
        smtpHost: (settings as any).smtpHost ?? "",
        smtpPort: (settings as any).smtpPort ?? "587",
        smtpUser: (settings as any).smtpUser ?? "",
        smtpPass: (settings as any).smtpPass ?? "",
        smtpFrom: (settings as any).smtpFrom ?? "",
        smtpTo: (settings as any).smtpTo ?? "",
        smtpEnabled: (settings as any).smtpEnabled ?? false,
        privacyPolicy: (settings as any).privacyPolicy ?? "",
        termsOfService: (settings as any).termsOfService ?? "",
        cookiesPolicy: (settings as any).cookiesPolicy ?? "",
        businessHours: (settings as any).businessHours ?? "",
        businessHoursTimezone: (settings as any).businessHoursTimezone ?? "America/New_York",
      });
    }
  }, [settings]);

  const { mutate: updateSettings, isPending } = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    },
  });

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));
  const setCred = (key: string, value: any) => setCredForm((f) => ({ ...f, [key]: value }));

  const heroImageList: string[] = (() => {
    try { return JSON.parse(form.heroImages || "[]"); } catch { return []; }
  })();

  const addHeroImage = (url: string) => {
    const updated = [...heroImageList, url];
    set("heroImages", JSON.stringify(updated));
  };

  const removeHeroImage = (idx: number) => {
    const updated = heroImageList.filter((_, i) => i !== idx);
    set("heroImages", JSON.stringify(updated));
  };

  const handleSaveCredentials = async () => {
    if (!credForm.name && !credForm.email && !credForm.newPassword) {
      toast({ title: "Nothing to update", description: "Enter at least one field to change.", variant: "destructive" });
      return;
    }
    if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must match.", variant: "destructive" });
      return;
    }
    if (credForm.newPassword && credForm.newPassword.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }

    setCredSaving(true);
    try {
      const body: Record<string, string> = {};
      if (credForm.name) body.name = credForm.name;
      if (credForm.email) body.email = credForm.email;
      if (credForm.newPassword) {
        body.password = credForm.newPassword;
        body.currentPassword = credForm.currentPassword;
      }

      const res = await fetch(`${API_BASE}/admin/credentials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ title: "Update failed", description: err.message ?? "Could not update credentials.", variant: "destructive" });
        return;
      }

      setCredSaved(true);
      setCredForm({ name: "", email: "", currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setCredSaved(false), 3000);
      toast({ title: "Credentials updated", description: "Your admin credentials have been updated." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update credentials. Please try again.", variant: "destructive" });
    } finally {
      setCredSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground text-sm">Customize your company information, branding, and integrations</p>
      </div>

      <SettingsSection icon={Building} title="Company Information" delay={0}>
        <div className="space-y-1.5">
          <Label>Company Name</Label>
          <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="GlobalTrack Logistique" />
        </div>
        <div className="space-y-1.5">
          <Label>Hero Title</Label>
          <Input value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} placeholder="Track Your Shipment in Real-Time" />
        </div>
        <div className="space-y-1.5">
          <Label>Hero Subtitle</Label>
          <Input value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} placeholder="Premium global logistics..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Contact Email</Label>
            <Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Contact Phone</Label>
            <Input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Office Address</Label>
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Logistics Way, New York, NY" />
        </div>
      </SettingsSection>

      <SettingsSection icon={Clock} title="Business Hours" delay={0.02}>
        <p className="text-xs text-muted-foreground">Set your operating hours. These will be visible to customers on your contact and about pages.</p>
        {(() => {
          const DAYS = [
            { key: "monday", label: "Monday" },
            { key: "tuesday", label: "Tuesday" },
            { key: "wednesday", label: "Wednesday" },
            { key: "thursday", label: "Thursday" },
            { key: "friday", label: "Friday" },
            { key: "saturday", label: "Saturday" },
            { key: "sunday", label: "Sunday" },
          ] as const;

          const DEFAULT_HOURS = {
            monday:    { open: true,  from: "09:00", to: "18:00" },
            tuesday:   { open: true,  from: "09:00", to: "18:00" },
            wednesday: { open: true,  from: "09:00", to: "18:00" },
            thursday:  { open: true,  from: "09:00", to: "18:00" },
            friday:    { open: true,  from: "09:00", to: "17:00" },
            saturday:  { open: true,  from: "10:00", to: "14:00" },
            sunday:    { open: false, from: "09:00", to: "18:00" },
          };

          let hours: Record<string, { open: boolean; from: string; to: string }>;
          try {
            hours = form.businessHours ? JSON.parse(form.businessHours) : DEFAULT_HOURS;
          } catch {
            hours = DEFAULT_HOURS;
          }

          const updateHours = (day: string, field: "open" | "from" | "to", value: any) => {
            const updated = { ...hours, [day]: { ...hours[day], [field]: value } };
            set("businessHours", JSON.stringify(updated));
          };

          const TIMEZONES = [
            "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
            "America/Toronto", "America/Vancouver", "America/Sao_Paulo",
            "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Rome",
            "Europe/Amsterdam", "Europe/Zurich", "Europe/Moscow",
            "Africa/Lagos", "Africa/Cairo", "Africa/Johannesburg", "Africa/Nairobi",
            "Asia/Dubai", "Asia/Riyadh", "Asia/Karachi", "Asia/Kolkata", "Asia/Dhaka",
            "Asia/Bangkok", "Asia/Singapore", "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul",
            "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland",
          ];

          return (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Timezone</Label>
                <select
                  value={form.businessHoursTimezone}
                  onChange={(e) => set("businessHoursTimezone", e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                {DAYS.map(({ key, label }) => {
                  const day = hours[key] ?? { open: false, from: "09:00", to: "18:00" };
                  return (
                    <div key={key} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${day.open ? "bg-primary/5 border border-primary/10" : "bg-muted/20 border border-transparent"}`}>
                      <Switch
                        checked={day.open}
                        onCheckedChange={(v) => updateHours(key, "open", v)}
                      />
                      <span className={`w-24 text-sm font-medium shrink-0 ${!day.open ? "text-muted-foreground" : ""}`}>{label}</span>
                      {day.open ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={day.from}
                            onChange={(e) => updateHours(key, "from", e.target.value)}
                            className="h-8 px-2 rounded-md border border-input bg-background text-sm w-28 focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                          <span className="text-muted-foreground text-xs">to</span>
                          <input
                            type="time"
                            value={day.to}
                            onChange={(e) => updateHours(key, "to", e.target.value)}
                            className="h-8 px-2 rounded-md border border-input bg-background text-sm w-28 focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic flex-1">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </SettingsSection>

      <SettingsSection icon={Image} title="Brand & Hero Images" delay={0.03}>
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Company Logo</Label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">Shown in the navbar and footer. PNG with transparent background recommended.</p>
            {form.logoUrl && (
              <div className="flex items-center gap-3 mb-2 p-2 rounded-lg border bg-muted/20">
                <img src={form.logoUrl} alt="Logo" className="h-10 max-w-[140px] object-contain" />
                <Button type="button" variant="ghost" size="sm" onClick={() => set("logoUrl", "")} className="h-7 px-2 text-destructive hover:text-destructive">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <ImageUploadButton onUploaded={(url) => set("logoUrl", url)} uploading={logoUploading} setUploading={setLogoUploading} label="Upload Logo" />
          </div>
        </div>

        <div className="pt-2 border-t border-border/50 space-y-3">
          <div>
            <Label className="text-sm font-medium">Hero Background Images</Label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">Upload images for the hero section. If none are set, a default logistics-themed background is shown.</p>
            {heroImageList.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {heroImageList.map((url, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden aspect-video border">
                    <img src={url} alt={`Hero ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeHeroImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">
                      {i === 0 ? "Main" : `Slide ${i + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <ImageUploadButton onUploaded={addHeroImage} uploading={heroUploading} setUploading={setHeroUploading} label="Add Hero Image" />
          </div>

          {heroImageList.length > 1 && (
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label className="text-sm font-medium">Auto-Slideshow</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Automatically cycle through hero images</p>
              </div>
              <Switch checked={form.heroImageSlideEnabled} onCheckedChange={(v) => set("heroImageSlideEnabled", v)} />
            </div>
          )}

          {form.heroImageSlideEnabled && heroImageList.length > 1 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Slide Interval (seconds)</Label>
              <Input
                type="number"
                min={2}
                max={30}
                value={form.heroImageSlideInterval}
                onChange={(e) => set("heroImageSlideInterval", parseInt(e.target.value) || 5)}
                className="h-9 w-32"
              />
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection icon={MessageSquare} title="Contact Widgets" delay={0.05}>
        <div className="space-y-4 divide-y divide-border/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">WhatsApp Button</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Show a floating WhatsApp chat button</p>
              </div>
              <Switch checked={form.whatsappEnabled} onCheckedChange={(v) => set("whatsappEnabled", v)} />
            </div>
            {form.whatsappEnabled && (
              <div className="space-y-1.5 pl-0">
                <Label className="text-xs text-muted-foreground">Phone Number (with country code, digits only)</Label>
                <Input value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="12125550000" className="h-9" />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Telegram Button</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Show a floating Telegram chat button</p>
              </div>
              <Switch checked={form.telegramEnabled} onCheckedChange={(v) => set("telegramEnabled", v)} />
            </div>
            {form.telegramEnabled && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Telegram URL (e.g. https://t.me/username)</Label>
                <Input value={form.telegramLink} onChange={(e) => set("telegramLink", e.target.value)} placeholder="https://t.me/..." className="h-9" />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Tawk.to Live Chat</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Embed Tawk.to live chat widget</p>
              </div>
              <Switch checked={form.tawktoEnabled} onCheckedChange={(v) => set("tawktoEnabled", v)} />
            </div>
            {form.tawktoEnabled && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tawk.to Widget Script</Label>
                <Textarea value={form.tawktoScript} onChange={(e) => set("tawktoScript", e.target.value)} placeholder="Paste your Tawk.to script here..." rows={3} className="resize-none text-xs font-mono" />
              </div>
            )}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection icon={Share2} title="Social Media" delay={0.08}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "facebookUrl", label: "Facebook", placeholder: "https://facebook.com/..." },
            { key: "twitterUrl", label: "Twitter / X", placeholder: "https://twitter.com/..." },
            { key: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/..." },
            { key: "linkedinUrl", label: "LinkedIn", placeholder: "https://linkedin.com/..." },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Input value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className="h-9" />
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection icon={Server} title="SMTP Email Notifications" delay={0.11}>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Enable Email Notifications</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Send an email when a contact form is submitted</p>
          </div>
          <Switch checked={form.smtpEnabled} onCheckedChange={(v) => set("smtpEnabled", v)} />
        </div>

        {form.smtpEnabled && (
          <div className="space-y-4 pt-2 border-t border-border/50">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>SMTP Host</Label>
                <Input value={form.smtpHost} onChange={(e) => set("smtpHost", e.target.value)} placeholder="smtp.gmail.com" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>SMTP Port</Label>
                <Input value={form.smtpPort} onChange={(e) => set("smtpPort", e.target.value)} placeholder="587" className="h-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Username</Label>
                <Input value={form.smtpUser} onChange={(e) => set("smtpUser", e.target.value)} placeholder="you@gmail.com" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Password / App Password</Label>
                <Input type="password" value={form.smtpPass} onChange={(e) => set("smtpPass", e.target.value)} placeholder="••••••••••••" className="h-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>From Address</Label>
                <Input value={form.smtpFrom} onChange={(e) => set("smtpFrom", e.target.value)} placeholder="noreply@yourcompany.com" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Notify To</Label>
                <Input value={form.smtpTo} onChange={(e) => set("smtpTo", e.target.value)} placeholder="admin@yourcompany.com" className="h-9" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              For Gmail, use an <strong>App Password</strong> (not your regular password). Port 587 with STARTTLS or 465 with SSL.
            </p>
          </div>
        )}
      </SettingsSection>

      <SettingsSection icon={FileText} title="Privacy Policy" delay={0.13}>
        <p className="text-xs text-muted-foreground">This content will be displayed on the /privacy page of your site.</p>
        <Textarea
          value={form.privacyPolicy || DEFAULT_PRIVACY}
          onChange={(e) => set("privacyPolicy", e.target.value)}
          rows={12}
          className="resize-y text-sm font-mono leading-relaxed"
          placeholder={DEFAULT_PRIVACY}
        />
        {!form.privacyPolicy && (
          <Button type="button" variant="outline" size="sm" onClick={() => set("privacyPolicy", DEFAULT_PRIVACY)}>
            Load Default Template
          </Button>
        )}
      </SettingsSection>

      <SettingsSection icon={FileText} title="Terms of Service" delay={0.15}>
        <p className="text-xs text-muted-foreground">This content will be displayed on the /terms page of your site.</p>
        <Textarea
          value={form.termsOfService || DEFAULT_TERMS}
          onChange={(e) => set("termsOfService", e.target.value)}
          rows={12}
          className="resize-y text-sm font-mono leading-relaxed"
          placeholder={DEFAULT_TERMS}
        />
        {!form.termsOfService && (
          <Button type="button" variant="outline" size="sm" onClick={() => set("termsOfService", DEFAULT_TERMS)}>
            Load Default Template
          </Button>
        )}
      </SettingsSection>

      <SettingsSection icon={Cookie} title="Cookies Policy" delay={0.17}>
        <p className="text-xs text-muted-foreground">This content will be displayed on the /cookies page of your site.</p>
        <Textarea
          value={form.cookiesPolicy || DEFAULT_COOKIES}
          onChange={(e) => set("cookiesPolicy", e.target.value)}
          rows={12}
          className="resize-y text-sm font-mono leading-relaxed"
          placeholder={DEFAULT_COOKIES}
        />
        {!form.cookiesPolicy && (
          <Button type="button" variant="outline" size="sm" onClick={() => set("cookiesPolicy", DEFAULT_COOKIES)}>
            Load Default Template
          </Button>
        )}
      </SettingsSection>

      <div className="flex justify-end">
        <Button
          onClick={() => updateSettings({ data: form as any })}
          disabled={isPending}
          size="lg"
          className="min-w-[160px] rounded-xl"
        >
          {saved ? (
            <span className="flex items-center gap-2 text-white">
              <CheckCircle2 className="h-4 w-4" /> Saved!
            </span>
          ) : isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" /> Save Settings
            </span>
          )}
        </Button>
      </div>

      <SettingsSection icon={KeyRound} title="Admin Credentials" delay={0.2}>
        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs text-yellow-600 dark:text-yellow-400">
          Updating credentials takes effect immediately. Make sure to remember your new email and password before saving.
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Display Name</Label>
              <Input
                value={credForm.name}
                onChange={(e) => setCred("name", e.target.value)}
                placeholder="Admin"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label>New Email</Label>
              <Input
                type="email"
                value={credForm.email}
                onChange={(e) => setCred("email", e.target.value)}
                placeholder="admin@yourcompany.com"
                className="h-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground font-medium">Change Password (leave blank to keep current)</p>
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPass ? "text" : "password"}
                  value={credForm.currentPassword}
                  onChange={(e) => setCred("currentPassword", e.target.value)}
                  placeholder="••••••••"
                  className="h-9 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                >
                  {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPass ? "text" : "password"}
                    value={credForm.newPassword}
                    onChange={(e) => setCred("newPassword", e.target.value)}
                    placeholder="Min. 8 characters"
                    className="h-9 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPass(!showNewPass)}
                  >
                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={credForm.confirmPassword}
                  onChange={(e) => setCred("confirmPassword", e.target.value)}
                  placeholder="Repeat new password"
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSaveCredentials}
            disabled={credSaving}
            variant="outline"
            size="sm"
            className="min-w-[160px]"
          >
            {credSaved ? (
              <span className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="h-4 w-4" /> Updated!
              </span>
            ) : credSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Update Credentials
              </span>
            )}
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}
