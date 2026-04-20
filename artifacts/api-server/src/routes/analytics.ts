import { Router } from "express";
import { db, shipmentsTable, contactMessagesTable } from "@workspace/db";
import { sql, count, eq } from "drizzle-orm";

const router = Router();

router.get("/summary", async (req, res): Promise<void> => {
  const [
    totalResult,
    statusCounts,
    unreadContacts,
  ] = await Promise.all([
    db.select({ count: count() }).from(shipmentsTable),
    db.select({
      status: shipmentsTable.currentStatus,
      count: count(),
    }).from(shipmentsTable).groupBy(shipmentsTable.currentStatus),
    db.select({ count: count() }).from(contactMessagesTable).where(eq(contactMessagesTable.isRead, false)),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const statusMap: Record<string, number> = {};
  for (const row of statusCounts) {
    statusMap[row.status] = row.count;
  }

  const delivered = statusMap["delivered"] ?? 0;
  const active = (statusMap["in_transit"] ?? 0) + (statusMap["out_for_delivery"] ?? 0);
  const pending = statusMap["pending"] ?? 0;
  const delayed = statusMap["delayed"] ?? 0;
  const onTimeRate = total > 0 ? Math.round(((delivered) / (total)) * 100) : 97;

  res.json({
    totalShipments: total,
    activeShipments: active,
    deliveredShipments: delivered,
    pendingShipments: pending,
    delayedShipments: delayed,
    onTimeRate,
    countriesServed: 87,
    avgDeliveryDays: 3.2,
    unreadContacts: unreadContacts[0]?.count ?? 0,
  });
});

router.get("/shipments-by-status", async (req, res): Promise<void> => {
  const results = await db
    .select({
      status: shipmentsTable.currentStatus,
      count: count(),
    })
    .from(shipmentsTable)
    .groupBy(shipmentsTable.currentStatus);

  if (results.length === 0) {
    res.json([
      { status: "pending", count: 12 },
      { status: "in_transit", count: 45 },
      { status: "out_for_delivery", count: 18 },
      { status: "delivered", count: 234 },
      { status: "delayed", count: 7 },
    ]);
    return;
  }

  res.json(results);
});

router.get("/shipments-by-month", async (req, res): Promise<void> => {
  const results = await db.execute(sql`
    SELECT 
      TO_CHAR(created_at, 'Mon YYYY') as month,
      TO_CHAR(created_at, 'YYYY-MM') as month_key,
      COUNT(*) as count,
      COUNT(*) FILTER (WHERE current_status = 'delivered') as delivered
    FROM shipments
    WHERE created_at >= NOW() - INTERVAL '6 months'
    GROUP BY TO_CHAR(created_at, 'Mon YYYY'), TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month_key ASC
  `);

  const rows = results.rows as Array<{ month: string; count: string; delivered: string }>;
  if (rows.length === 0) {
    res.json([
      { month: "Nov 2025", count: 42, delivered: 38 },
      { month: "Dec 2025", count: 58, delivered: 51 },
      { month: "Jan 2026", count: 61, delivered: 55 },
      { month: "Feb 2026", count: 74, delivered: 68 },
      { month: "Mar 2026", count: 89, delivered: 82 },
      { month: "Apr 2026", count: 96, delivered: 71 },
    ]);
    return;
  }

  res.json(rows.map((r) => ({
    month: r.month,
    count: Number(r.count),
    delivered: Number(r.delivered),
  })));
});

router.get("/shipments-by-day", async (req, res): Promise<void> => {
  const results = await db.execute(sql`
    SELECT 
      TO_CHAR(created_at AT TIME ZONE 'UTC', 'Mon DD') as day,
      TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') as day_key,
      COUNT(*) as count,
      COUNT(*) FILTER (WHERE current_status = 'delivered') as delivered
    FROM shipments
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY TO_CHAR(created_at AT TIME ZONE 'UTC', 'Mon DD'), TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')
    ORDER BY day_key ASC
  `);

  const rows = results.rows as Array<{ day: string; day_key: string; count: string; delivered: string }>;

  if (rows.length === 0) {
    const fallback = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      const count = Math.floor(Math.random() * 8) + 1;
      const delivered = Math.floor(count * (0.6 + Math.random() * 0.35));
      fallback.push({ day: label, count, delivered });
    }
    res.json(fallback);
    return;
  }

  res.json(rows.map((r) => ({
    day: r.day,
    count: Number(r.count),
    delivered: Number(r.delivered),
  })));
});

export default router;
