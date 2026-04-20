import { motion } from "framer-motion";
import { TrendingUp, Package, Globe, Clock, Shield, Zap, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const publicStats = [
  { label: "Packages Delivered", value: "124,850+", icon: Package, color: "text-primary" },
  { label: "Countries Served", value: "87+", icon: Globe, color: "text-blue-500" },
  { label: "On-Time Delivery", value: "97%", icon: TrendingUp, color: "text-primary" },
  { label: "Avg Delivery Time", value: "3.2 days", icon: Clock, color: "text-orange-500" },
];

const highlights = [
  { icon: Shield, title: "Industry-Leading Reliability", desc: "97% on-time delivery rate across all routes and shipment types." },
  { icon: Zap, title: "Real-Time Visibility", desc: "Every shipment is tracked from pickup to final delivery with live updates." },
  { icon: Globe, title: "Global Network", desc: "Operations spanning 87+ countries with local expertise worldwide." },
];

export default function Analytics() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hero-gradient border-b py-14 md:py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
              <TrendingUp className="h-4 w-4" />
              Performance Overview
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Global Operations at a Glance</h1>
            <p className="text-white/50 max-w-xl mx-auto">
              A snapshot of GlobalTrack's worldwide logistics performance. Full analytics are available in the admin dashboard.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-12 space-y-10">
        {/* Public Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {publicStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border bg-card p-5 text-center hover:border-primary/20 transition-colors"
            >
              <div className={`${stat.color} flex justify-center mb-3`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border bg-card overflow-hidden relative"
        >
          <div className="p-5 border-b">
            <h3 className="font-semibold">Monthly Shipments Trend</h3>
            <p className="text-sm text-muted-foreground">12-month performance overview</p>
          </div>
          <div className="relative h-52 flex items-end gap-2 px-6 pb-6 pt-4">
            {[45, 62, 58, 80, 72, 95, 88, 110, 102, 125, 118, 140].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(h / 140) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.6, ease: "easeOut" }}
                  className="w-full rounded-t-sm bg-primary/20 border-t-2 border-primary/40 min-h-[4px]"
                />
              </div>
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl px-8 py-6 text-center">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-semibold mb-1">Full Analytics — Admin Only</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Detailed charts, filters, and real-time data are available in the secure admin dashboard.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Highlights */}
        <div className="grid md:grid-cols-3 gap-5">
          {highlights.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border bg-card p-6 hover:border-primary/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <h.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{h.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border bg-primary/5 border-primary/20 p-8 text-center"
        >
          <h3 className="text-xl font-bold mb-2">Need Detailed Shipment Analytics?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Contact our team to learn about enterprise reporting, custom dashboards, and API integrations for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact">
              <Button size="lg" className="gap-2 rounded-xl">
                Contact Our Team
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/track">
              <Button variant="outline" size="lg" className="rounded-xl">
                Track a Shipment
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
