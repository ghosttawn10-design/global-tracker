import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Globe, ShieldCheck, Truck, ClipboardCheck, MapPin, ArrowRight, Star, CheckCircle2, Zap, Clock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useGetSettings, useListTestimonials, getGetSettingsQueryKey, getListTestimonialsQueryKey } from "@workspace/api-client-react";

const BASE_COUNTS = {
  delivered: 124850,
  countries: 87,
  onTime: 97,
  active: 4900,
};

const COUNTER_KEY = "gtl_visit_counts";

function useAnimatedCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return count;
}

function StatCounter({ value, label, icon: Icon, suffix = "" }: {
  value: number; label: string; icon: React.ElementType; suffix?: string;
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useAnimatedCounter(inView ? value : 0, 1800);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-1.5 tabular-nums">
        {count.toLocaleString()}{suffix}
      </h3>
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
    </div>
  );
}

const howItWorksSteps = [
  { icon: ClipboardCheck, title: "Place Order", description: "Create a shipment with sender and recipient details in seconds." },
  { icon: Package, title: "Package Picked Up", description: "Our global network collects your package from the origin location." },
  { icon: Truck, title: "In Transit", description: "Your shipment moves through our optimized routing infrastructure." },
  { icon: MapPin, title: "Live Tracking", description: "Track your package in real-time on our live interactive map." },
  { icon: CheckCircle2, title: "Delivered", description: "Your package arrives safely at its destination, on schedule." },
];

const features = [
  { title: "Real-Time Tracking", desc: "Watch your package move on a live map with precise location updates every few seconds.", icon: MapPin },
  { title: "190+ Countries", desc: "We operate across 190+ countries with a deeply reliable network of logistics partners.", icon: Globe },
  { title: "Guaranteed Security", desc: "Every shipment is insured, encrypted in our systems, and monitored 24/7.", icon: ShieldCheck },
  { title: "Express Options", desc: "Average delivery in 3.2 days with urgent express options for critical shipments.", icon: Zap },
  { title: "Instant Alerts", desc: "Get real-time notifications via WhatsApp, Telegram, or email for every status change.", icon: Clock },
  { title: "Analytics Dashboard", desc: "Full visibility into your logistics operations with beautiful real-time reporting.", icon: BarChart3 },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function Home() {
  const [, setLocation] = useLocation();
  const [trackingNumber, setTrackingNumber] = useState("");
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const { data: testimonials } = useListTestimonials({ active: true }, { query: { queryKey: getListTestimonialsQueryKey({ active: true }) } });

  const heroImages: string[] = (() => {
    try { return JSON.parse((settings as any)?.heroImages || "[]"); } catch { return []; }
  })();
  const slideEnabled = (settings as any)?.heroImageSlideEnabled && heroImages.length > 1;
  const slideInterval = ((settings as any)?.heroImageSlideInterval ?? 5) * 1000;
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    if (!slideEnabled) return;
    const timer = setInterval(() => setHeroIdx((i) => (i + 1) % heroImages.length), slideInterval);
    return () => clearInterval(timer);
  }, [slideEnabled, heroImages.length, slideInterval]);

  const getLiveCounts = () => {
    try {
      const stored = localStorage.getItem(COUNTER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const lastVisit = parsed.lastVisit ?? 0;
        const hoursSince = (Date.now() - lastVisit) / 3600000;
        const increment = Math.floor(hoursSince * 3);
        return {
          delivered: BASE_COUNTS.delivered + (parsed.base ?? 0) + increment,
          countries: BASE_COUNTS.countries,
          onTime: BASE_COUNTS.onTime,
          active: BASE_COUNTS.active + Math.floor(Math.random() * 50),
        };
      }
    } catch {}
    const base = Math.floor(Math.random() * 200);
    try {
      localStorage.setItem(COUNTER_KEY, JSON.stringify({ base, lastVisit: Date.now() }));
    } catch {}
    return { ...BASE_COUNTS, delivered: BASE_COUNTS.delivered + base };
  };

  const [liveCounts] = useState(getLiveCounts);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setLocation(`/track?number=${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative text-white py-24 md:py-32 lg:py-40 overflow-hidden">
        {heroImages.length > 0 ? (
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence mode="sync">
              <motion.div
                key={heroIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImages[heroIdx]})` }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/75" />
            {heroImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {heroImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === heroIdx ? "bg-white w-4" : "bg-white/40"}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80")`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container relative z-10 px-4 md:px-6 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-white/8 rounded-full px-4 py-1.5 text-sm mb-8 border border-white/12 backdrop-blur-sm"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-white/80">Live tracking active across {BASE_COUNTS.countries}+ countries</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.08]"
          >
            {settings?.heroTitle || (
              <>
                Track Every Shipment,{" "}
                <span className="text-gradient-emerald">Everywhere.</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {settings?.heroSubtitle || "Premium global logistics with precision tracking and real-time updates. Your packages are always in sight, always on time."}
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleTrack}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter tracking number (e.g. GTL-DEMO001)"
                className="pl-12 h-14 text-gray-900 bg-white border-0 text-base rounded-2xl shadow-2xl placeholder:text-gray-400"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-2xl font-semibold text-base border-0 emerald-glow shrink-0"
            >
              Track Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.form>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-xs text-white/35 mt-4"
          >
            Demo: try GTL-DEMO001 or GTL-DEMO002
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 border-b bg-card/60">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatCounter value={liveCounts.delivered} label="Packages Delivered" icon={Package} suffix="+" />
            <StatCounter value={liveCounts.countries} label="Countries Served" icon={Globe} suffix="+" />
            <StatCounter value={liveCounts.onTime} label="On-Time Delivery %" icon={CheckCircle2} suffix="%" />
            <StatCounter value={liveCounts.active} label="Active Shipments" icon={Truck} suffix="+" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container max-w-5xl mx-auto px-4 md:px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-3">Simple Process</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From pickup to delivery, every step is tracked and fully transparent.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
            {howItWorksSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="relative inline-block mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-24 bg-muted/20 border-y">
        <div className="container max-w-5xl mx-auto px-4 md:px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-3">Why GlobalTrack</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Businesses That Demand the Best</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Enterprise-grade logistics infrastructure, trusted by thousands of businesses worldwide.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feat.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials && testimonials.filter(t => t.isActive).length > 0 && (
        <section className="py-20 md:py-24 bg-background">
          <div className="container max-w-5xl mx-auto px-4 md:px-6">
            <motion.div {...fadeUp} className="text-center mb-16">
              <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-3">Client Stories</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by World Leaders in Logistics</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.filter(t => t.isActive).slice(0, 6).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border bg-card p-6 hover:border-primary/20 transition-colors"
                >
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <Star key={r} className={`h-4 w-4 ${r <= t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt={t.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-semibold text-sm">{t.name[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}{t.company ? `, ${t.company}` : ""}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 md:py-24 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
        <div className="container max-w-3xl mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Track Your Shipment?</h2>
            <p className="text-white/60 mb-10 text-lg">Enter your tracking number or contact our expert team for assistance.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/track">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 rounded-xl emerald-glow">
                  Track a Package
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 rounded-xl bg-transparent">
                  Contact Support
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
