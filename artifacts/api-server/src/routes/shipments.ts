import { Router } from "express";
import { db, shipmentsTable, trackingEventsTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { ListShipmentsQueryParams, CreateShipmentBody, UpdateShipmentBody, UpdateShipmentParams, GetShipmentParams, DeleteShipmentParams } from "@workspace/api-zod";

const router = Router();

type RoutePoint = { lat: number; lng: number; label?: string };

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function parseEstimatedDelivery(value: string): Date | null {
  const v = value.trim();
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    // Treat date-only as end-of-day UTC to avoid premature delivery.
    return new Date(`${v}T23:59:59.000Z`);
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseRoutePoints(value: string | null): RoutePoint[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((p) => ({
        lat: typeof p?.lat === "number" ? p.lat : Number(p?.lat),
        lng: typeof p?.lng === "number" ? p.lng : Number(p?.lng),
        label: typeof p?.label === "string" ? p.label : undefined,
      }))
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  } catch {
    return [];
  }
}

function interpolateLocation(points: RoutePoint[], progress: number): {
  currentLat?: number;
  currentLng?: number;
  currentLocation?: string;
} {
  if (points.length === 0) return {};
  if (points.length === 1) {
    return {
      currentLat: points[0]!.lat,
      currentLng: points[0]!.lng,
      currentLocation: points[0]!.label,
    };
  }

  const t = clamp(progress / 100, 0, 1);
  const scaled = t * (points.length - 1);
  const i = Math.floor(scaled);
  const frac = scaled - i;
  const a = points[i] ?? points[0]!;
  const b = points[Math.min(i + 1, points.length - 1)] ?? points[points.length - 1]!;

  const lat = a.lat + (b.lat - a.lat) * frac;
  const lng = a.lng + (b.lng - a.lng) * frac;
  const label = frac < 0.5 ? a.label : b.label;

  return { currentLat: lat, currentLng: lng, currentLocation: label };
}

function computeAutonomousProgress(
  baseProgress: number,
  updatedAt: Date,
  eta: Date | null,
  now: Date,
): number {
  const base = clamp(baseProgress, 0, 100);
  if (!eta) return base;
  const remainingMs = eta.getTime() - updatedAt.getTime();
  if (remainingMs <= 0) {
    return now.getTime() >= eta.getTime() ? 100 : base;
  }
  const elapsedMs = now.getTime() - updatedAt.getTime();
  const delta = ((100 - base) * clamp(elapsedMs, 0, remainingMs)) / remainingMs;
  return clamp(base + delta, 0, 100);
}

function computeEffectiveStatus(storedStatus: string, progress: number): string {
  if (progress >= 100) return "delivered";
  // Preserve explicit delayed state unless delivered.
  if (storedStatus === "delayed") return "delayed";
  if (progress < 10) return "pending";
  if (progress < 90) return "in_transit";
  return "out_for_delivery";
}

function applySmartFields(s: typeof shipmentsTable.$inferSelect) {
  const now = new Date();
  const eta = parseEstimatedDelivery(s.estimatedDelivery);
  const progress = computeAutonomousProgress(s.progressPercent ?? 0, s.updatedAt, eta, now);
  const status = computeEffectiveStatus(s.currentStatus, progress);
  const routePoints = parseRoutePoints(s.routePoints);
  const interpolated = interpolateLocation(routePoints, progress);

  return {
    ...s,
    progressPercent: Math.round(progress),
    currentStatus: status,
    currentLat: interpolated.currentLat ?? s.currentLat ?? undefined,
    currentLng: interpolated.currentLng ?? s.currentLng ?? undefined,
    currentLocation: interpolated.currentLocation ?? s.currentLocation,
  };
}

function generateTrackingNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "GTL-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatShipment(s: typeof shipmentsTable.$inferSelect) {
  const effective = applySmartFields(s);
  return {
    ...effective,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res): Promise<void> => {
  const query = ListShipmentsQueryParams.safeParse(req.query);
  const page = query.success ? (query.data.page ?? 1) : 1;
  const limit = query.success ? (query.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;

  const [totalResult, shipments] = await Promise.all([
    db.select({ count: count() }).from(shipmentsTable),
    db.select().from(shipmentsTable).orderBy(desc(shipmentsTable.createdAt)).limit(limit).offset(offset),
  ]);

  res.json({
    shipments: shipments.map(formatShipment),
    total: totalResult[0]?.count ?? 0,
    page,
    limit,
  });
});

router.post("/", async (req, res): Promise<void> => {
  const body = CreateShipmentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "validation_error", message: body.error.message });
    return;
  }

  const trackingNumber = generateTrackingNumber();

  const [shipment] = await db
    .insert(shipmentsTable)
    .values({
      ...body.data,
      trackingNumber,
      updatedAt: new Date(),
    })
    .returning();

  if (!shipment) {
    res.status(500).json({ error: "Failed to create shipment" });
    return;
  }

  await db.insert(trackingEventsTable).values({
    shipmentId: shipment.id,
    status: "pending",
    description: "Shipment order placed and confirmed",
    location: body.data.origin,
    timestamp: new Date(),
  });

  res.status(201).json(formatShipment(shipment));
});

router.get("/:id", async (req, res): Promise<void> => {
  const params = GetShipmentParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [shipment] = await db
    .select()
    .from(shipmentsTable)
    .where(eq(shipmentsTable.id, params.data.id))
    .limit(1);

  if (!shipment) {
    res.status(404).json({ error: "not_found", message: "Shipment not found" });
    return;
  }

  res.json(formatShipment(shipment));
});

router.put("/:id", async (req, res): Promise<void> => {
  const params = UpdateShipmentParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateShipmentBody.safeParse(req.body);

  if (!params.success || !body.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid data" });
    return;
  }

  const prevShipment = await db
    .select()
    .from(shipmentsTable)
    .where(eq(shipmentsTable.id, params.data.id))
    .limit(1);

  if (!prevShipment[0]) {
    res.status(404).json({ error: "not_found", message: "Shipment not found" });
    return;
  }

  const nextData: Record<string, unknown> = { ...body.data };

  const incomingStatus = typeof nextData.currentStatus === "string" ? nextData.currentStatus : undefined;
  const incomingProgress =
    typeof nextData.progressPercent === "number"
      ? nextData.progressPercent
      : typeof nextData.progressPercent === "string"
        ? Number(nextData.progressPercent)
        : undefined;

  if (incomingStatus === "delivered") {
    nextData.progressPercent = 100;
  } else if (incomingProgress != null && Number.isFinite(incomingProgress) && incomingProgress >= 100) {
    nextData.progressPercent = 100;
    nextData.currentStatus = "delivered";
  }

  const [updated] = await db
    .update(shipmentsTable)
    .set({ ...nextData, updatedAt: new Date() })
    .where(eq(shipmentsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(500).json({ error: "Failed to update shipment" });
    return;
  }

  if (body.data.currentStatus && body.data.currentStatus !== prevShipment[0].currentStatus) {
    const statusDescriptions: Record<string, string> = {
      pending: "Shipment order placed and confirmed",
      in_transit: "Package picked up and in transit",
      out_for_delivery: "Package is out for delivery",
      delivered: "Package has been delivered",
      delayed: "Shipment has been delayed",
    };

    await db.insert(trackingEventsTable).values({
      shipmentId: params.data.id,
      status: body.data.currentStatus,
      description: statusDescriptions[body.data.currentStatus] ?? `Status updated to ${body.data.currentStatus}`,
      location: body.data.currentLocation ?? updated.currentLocation,
      lat: body.data.currentLat ?? undefined,
      lng: body.data.currentLng ?? undefined,
      timestamp: new Date(),
    });
  }

  res.json(formatShipment(updated));
});

router.delete("/:id", async (req, res): Promise<void> => {
  const params = DeleteShipmentParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(shipmentsTable).where(eq(shipmentsTable.id, params.data.id));
  res.status(204).send();
});

export default router;
