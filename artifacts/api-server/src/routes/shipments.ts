import { Router } from "express";
import { db, shipmentsTable, trackingEventsTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { ListShipmentsQueryParams, CreateShipmentBody, UpdateShipmentBody, UpdateShipmentParams, GetShipmentParams, DeleteShipmentParams } from "@workspace/api-zod";

const router = Router();

function generateTrackingNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "GTL-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatShipment(s: typeof shipmentsTable.$inferSelect) {
  return {
    ...s,
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

  const [updated] = await db
    .update(shipmentsTable)
    .set({ ...body.data, updatedAt: new Date() })
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
