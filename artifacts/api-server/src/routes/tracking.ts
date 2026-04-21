import { Router } from "express";
import { db, shipmentsTable, trackingEventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { TrackShipmentParams } from "@workspace/api-zod";

const router = Router();

type RoutePoint = { lat: number; lng: number; label?: string; timestamp?: string };

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function parseEstimatedDelivery(value: string): Date | null {
  const v = value.trim();
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return new Date(`${v}T23:59:59.000Z`);
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
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
  if (storedStatus === "delayed") return "delayed";
  if (progress < 10) return "pending";
  if (progress < 90) return "in_transit";
  return "out_for_delivery";
}

router.get("/:trackingNumber", async (req, res): Promise<void> => {
  const params = TrackShipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid tracking number" });
    return;
  }

  const { trackingNumber } = params.data;

  const [shipment] = await db
    .select()
    .from(shipmentsTable)
    .where(eq(shipmentsTable.trackingNumber, trackingNumber))
    .limit(1);

  if (!shipment) {
    res.status(404).json({ error: "not_found", message: `No shipment found with tracking number ${trackingNumber}` });
    return;
  }

  const events = await db
    .select()
    .from(trackingEventsTable)
    .where(eq(trackingEventsTable.shipmentId, shipment.id))
    .orderBy(trackingEventsTable.timestamp);

  let routePoints: RoutePoint[] = [];
  if (shipment.routePoints) {
    try {
      routePoints = JSON.parse(shipment.routePoints);
    } catch {
      routePoints = [];
    }
  }

  const now = new Date();
  const eta = parseEstimatedDelivery(shipment.estimatedDelivery);
  const progress = computeAutonomousProgress(
    shipment.progressPercent ?? 0,
    shipment.updatedAt,
    eta,
    now,
  );
  const status = computeEffectiveStatus(shipment.currentStatus, progress);
  const interpolated = interpolateLocation(routePoints, progress);

  res.json({
    ...shipment,
    routePoints,
    progressPercent: Math.round(progress),
    currentStatus: status,
    currentLat: interpolated.currentLat ?? shipment.currentLat ?? undefined,
    currentLng: interpolated.currentLng ?? shipment.currentLng ?? undefined,
    currentLocation: interpolated.currentLocation ?? shipment.currentLocation,
    events: events.map((e) => ({
      id: e.id,
      status: e.status,
      description: e.description,
      location: e.location,
      timestamp: e.timestamp.toISOString(),
      lat: e.lat ?? undefined,
      lng: e.lng ?? undefined,
    })),
    estimatedDelivery: shipment.estimatedDelivery,
    createdAt: shipment.createdAt.toISOString(),
    updatedAt: shipment.updatedAt.toISOString(),
  });
});

export default router;
