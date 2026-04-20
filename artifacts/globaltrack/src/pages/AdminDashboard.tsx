import { motion } from "framer-motion";
import { Link } from "wouter";
import { Package, Truck, CheckCircle2, AlertCircle, MessageSquare, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetAnalyticsSummary, useListShipments, getGetAnalyticsSummaryQueryKey, getListShipmentsQueryKey } from "@workspace/api-client-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  in_transit: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  out_for_delivery: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  delayed: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  delayed: "Delayed",
};

export default function AdminDashboard() {
  const { data: summary } = useGetAnalyticsSummary({
    query: { queryKey: getGetAnalyticsSummaryQueryKey() },
  });
  const { data: shipmentsData } = useListShipments({ page: 1, limit: 5 }, {
    query: { queryKey: getListShipmentsQueryKey({ page: 1, limit: 5 }) },
  });

  const stats = [
    { icon: Package, label: "Total Shipments", value: summary?.totalShipments ?? 0, color: "text-primary" },
    { icon: Truck, label: "Active", value: summary?.activeShipments ?? 0, color: "text-blue-400" },
    { icon: CheckCircle2, label: "Delivered", value: summary?.deliveredShipments ?? 0, color: "text-green-400" },
    { icon: AlertCircle, label: "Delayed", value: summary?.delayedShipments ?? 0, color: "text-red-400" },
    { icon: MessageSquare, label: "Unread Contacts", value: summary?.unreadContacts ?? 0, color: "text-orange-400" },
    { icon: TrendingUp, label: "On-Time Rate", value: `${summary?.onTimeRate ?? 0}%`, color: "text-purple-400" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className={`${stat.color} mb-3`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/shipments">
          <div className="rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <span className="font-medium">Manage Shipments</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </Link>
        <Link href="/admin/contacts">
          <div className="rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-orange-400" />
                <span className="font-medium">
                  View Contacts
                  {(summary?.unreadContacts ?? 0) > 0 && (
                    <span className="ml-2 text-xs bg-orange-400/20 text-orange-400 px-1.5 py-0.5 rounded-full">
                      {summary?.unreadContacts} new
                    </span>
                  )}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </Link>
        <Link href="/admin/settings">
          <div className="rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-400" />
                <span className="font-medium">Site Settings</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Shipments */}
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Recent Shipments</h2>
          <Link href="/admin/shipments">
            <Button variant="ghost" size="sm" className="text-xs">View all <ArrowRight className="h-3 w-3 ml-1" /></Button>
          </Link>
        </div>
        <div className="divide-y">
          {shipmentsData?.shipments?.map((ship) => (
            <div key={ship.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div>
                <p className="font-mono font-medium text-sm">{ship.trackingNumber}</p>
                <p className="text-xs text-muted-foreground">{ship.recipientName} — {ship.destination}</p>
              </div>
              <Badge className={`border text-xs ${STATUS_COLORS[ship.currentStatus] ?? ""}`}>
                {STATUS_LABELS[ship.currentStatus] ?? ship.currentStatus}
              </Badge>
            </div>
          ))}
          {(!shipmentsData?.shipments || shipmentsData.shipments.length === 0) && (
            <div className="p-8 text-center text-muted-foreground text-sm">No shipments yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
