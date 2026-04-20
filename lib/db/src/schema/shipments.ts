import { pgTable, serial, text, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shipmentsTable = pgTable("shipments", {
  id: serial("id").primaryKey(),
  trackingNumber: text("tracking_number").notNull().unique(),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email"),
  recipientName: text("recipient_name").notNull(),
  recipientEmail: text("recipient_email"),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  currentStatus: text("current_status").notNull().default("pending"),
  currentLocation: text("current_location").notNull(),
  estimatedDelivery: text("estimated_delivery").notNull(),
  weight: text("weight"),
  dimensions: text("dimensions"),
  packageType: text("package_type").notNull().default("parcel"),
  description: text("description"),
  currentLat: real("current_lat"),
  currentLng: real("current_lng"),
  routePoints: text("route_points"),
  progressPercent: integer("progress_percent").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const trackingEventsTable = pgTable("tracking_events", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull().references(() => shipmentsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const insertShipmentSchema = createInsertSchema(shipmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTrackingEventSchema = createInsertSchema(trackingEventsTable).omit({ id: true });

export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipmentsTable.$inferSelect;
export type InsertTrackingEvent = z.infer<typeof insertTrackingEventSchema>;
export type TrackingEvent = typeof trackingEventsTable.$inferSelect;
