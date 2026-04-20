import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router = Router();

const defaultSettings = {
  companyName: "GlobalTrack Logistique",
  heroTitle: "Track Your Shipment in Real-Time",
  heroSubtitle: "Reliable global logistics with precision tracking and real-time updates.",
  primaryColor: "#0066FF",
  whatsappNumber: null,
  whatsappEnabled: false,
  telegramLink: null,
  telegramEnabled: false,
  tawktoScript: null,
  tawktoEnabled: false,
  facebookUrl: null,
  twitterUrl: null,
  instagramUrl: null,
  linkedinUrl: null,
  contactEmail: "contact@globaltrack.com",
  contactPhone: "+1 (800) 555-0199",
  address: "123 Logistics Way, New York, NY 10001",
  darkModeDefault: true,
};

router.get("/", async (req, res): Promise<void> => {
  const [settings] = await db.select().from(siteSettingsTable).limit(1);

  if (!settings) {
    const [created] = await db.insert(siteSettingsTable).values({}).returning();
    res.json(created ?? defaultSettings);
    return;
  }

  res.json(settings);
});

router.put("/", async (req, res): Promise<void> => {
  const body = UpdateSettingsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "validation_error", message: body.error.message });
    return;
  }

  const [existing] = await db.select().from(siteSettingsTable).limit(1);

  if (!existing) {
    const [created] = await db
      .insert(siteSettingsTable)
      .values({ ...body.data, updatedAt: new Date() })
      .returning();
    res.json(created);
    return;
  }

  const [updated] = await db
    .update(siteSettingsTable)
    .set({ ...body.data, updatedAt: new Date() })
    .returning();

  res.json(updated);
});

export default router;
