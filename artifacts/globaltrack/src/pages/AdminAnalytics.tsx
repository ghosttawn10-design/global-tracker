import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";
import { useGetAnalyticsSummary, useGetShipmentsByStatus, getGetAnalyticsSummaryQueryKey, getGetShipmentsByStatusQueryKey } from "@workspace/api-client-react";
import { TrendingUp, Package, Truck, CheckCircle2, AlertCircle, Globe, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  in_transit: "#3b82f6",
  out_for_delivery: "#f97316",
  delivered: "#22c55e",
  delayed: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  delayed: "Delayed",
};

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

function useGetShipmentsByDay() {
  return useQuery({
    queryKey: ["analytics", "shipments-by-day"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/analytics/shipments-by-day`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch daily data");
      return res.json() as Promise<Array<{ day: string; count: number; delivered: number }>>;
    },
    staleTime: 60000,
  });
}

const RADIAN = Math.PI / 180;
function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function AdminAnalytics() {
  const { data: summary } = useGetAnalyticsSummary({ query: { queryKey: getGetAnalyticsSummaryQueryKey() } });
  const { data: byStatus } = useGetShipmentsByStatus({ query: { queryKey: getGetShipmentsByStatusQueryKey() } });
  const { data: byDay } = useGetShipmentsByDay();

  const pieData = (byStatus ?? []).map((item) => ({
    name: STATUS_LABELS[item.status] ?? item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] ?? "#6b7280",
  }));

  const visibleDayData = (byDay ?? []).slice(-30);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Performance metrics and shipping data</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Package, label: "Total", value: summary?.totalShipments ?? 0, color: "text-primary" },
          { icon: Truck, label: "Active", value: summary?.activeShipments ?? 0, color: "text-blue-400" },
          { icon: CheckCircle2, label: "Delivered", value: summary?.deliveredShipments ?? 0, color: "text-green-400" },
          { icon: AlertCircle, label: "Delayed", value: summary?.delayedShipments ?? 0, color: "text-red-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border bg-card p-4">
            <div className={`${s.color} mb-2`}><s.icon className="h-5 w-5" /></div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <TrendingUp className="h-5 w-5 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-green-400">{summary?.onTimeRate ?? 97}%</p>
          <p className="text-xs text-muted-foreground">On-Time Rate</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <Globe className="h-5 w-5 text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-purple-400">{summary?.countriesServed ?? 87}</p>
          <p className="text-xs text-muted-foreground">Countries</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <Clock className="h-5 w-5 text-orange-400 mb-2" />
          <p className="text-2xl font-bold text-orange-400">{summary?.avgDeliveryDays ?? 3.2}d</p>
          <p className="text-xs text-muted-foreground">Avg Delivery</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-4 md:col-span-3">
          <h3 className="font-semibold mb-1">Daily Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 30 days</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={visibleDayData}>
              <defs>
                <linearGradient id="colorDayCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDayDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="day"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                interval={Math.max(0, Math.floor((visibleDayData.length - 1) / 6))}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorDayCount)" name="Total" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="delivered" stroke="#22c55e" fill="url(#colorDayDelivered)" name="Delivered" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-4 md:col-span-2">
          <h3 className="font-semibold mb-4">Status Distribution</h3>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                    formatter={(value: number, name: string) => [`${value} shipments`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 w-full px-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
                    <span className="text-xs text-muted-foreground truncate">{entry.name}</span>
                    <span className="text-xs font-semibold ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-muted-foreground">No data yet</div>
          )}
        </motion.div>
      </div>

      {byStatus && byStatus.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Shipments by Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byStatus.map(s => ({ ...s, name: STATUS_LABELS[s.status] ?? s.status }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Bar dataKey="count" name="Shipments" radius={[4, 4, 0, 0]}>
                {byStatus.map((entry, index) => (
                  <Cell key={index} fill={STATUS_COLORS[entry.status] ?? "#6b7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
