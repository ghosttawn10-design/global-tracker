import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitContact, useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";

const SUBJECTS = [
  "Tracking Inquiry",
  "Delayed Shipment",
  "Damaged Package",
  "Pickup Request",
  "Partnership",
  "General Inquiry",
  "Other",
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });

  const { mutate: submitContact, isPending } = useSubmitContact({
    mutation: { onSuccess: () => setSubmitted(true) },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact({ data: form });
  };

  const contactInfo = [
    { icon: Mail, label: "Email Us", value: settings?.contactEmail, href: `mailto:${settings?.contactEmail}` },
    { icon: Phone, label: "Call Us", value: settings?.contactPhone, href: `tel:${settings?.contactPhone}` },
    { icon: MapPin, label: "Our Office", value: settings?.address, href: undefined },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen bg-background">
      <div className="hero-gradient border-b py-12 md:py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
              <MessageCircle className="h-4 w-4" />
              Get in Touch
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Contact Our Team</h1>
            <p className="text-white/50">We typically respond within 2 business hours.</p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-10 md:py-14">
        <div className="grid md:grid-cols-5 gap-8 md:gap-10">
          {/* Left — Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 space-y-6"
          >
            <div>
              <h2 className="text-lg font-semibold mb-2">How Can We Help?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Whether you need to track a shipment, report an issue, or explore business partnerships, our expert team is ready to assist.
              </p>
            </div>

            {contactInfo.length > 0 && (
              <div className="space-y-3">
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3 rounded-xl border bg-card p-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-medium hover:text-primary transition-colors mt-0.5 block">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium mt-0.5">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Business Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { day: "Monday – Friday", hours: "8:00 AM – 8:00 PM" },
                  { day: "Saturday", hours: "9:00 AM – 5:00 PM" },
                  { day: "Sunday", hours: "Emergency only" },
                ].map((row) => (
                  <div key={row.day} className="flex justify-between">
                    <span className="text-muted-foreground">{row.day}</span>
                    <span className="font-medium">{row.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-3 rounded-2xl border bg-card p-6 md:p-7"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Thank you for reaching out. Our team will respond within 2 business hours.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 rounded-xl"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                  }}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <select
                      id="subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select a topic...</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your inquiry in detail..."
                    rows={5}
                    required
                    className="resize-none"
                  />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl font-semibold" disabled={isPending}>
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Message
                    </span>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By submitting, you agree to our Privacy Policy. We never share your information.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
