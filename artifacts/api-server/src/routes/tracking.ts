import { Router } from "express";
import { db, shipmentsTable, trackingEventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { TrackShipmentParams } from "@workspace/api-zod";

const router = Router();

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

  let routePoints: Array<{ lat: number; lng: number; label?: string; timestamp?: string }> = [];
  if (shipment.routePoints) {
    try {
      routePoints = JSON.parse(shipment.routePoints);
    } catch {
      routePoints = [];
    }
  }

  res.json({
    ...shipment,
    routePoints,
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
