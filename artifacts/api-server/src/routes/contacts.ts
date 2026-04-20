import { Router } from "express";
import { db, contactMessagesTable, siteSettingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { SubmitContactBody, MarkContactReadParams, ListContactsQueryParams } from "@workspace/api-zod";
import nodemailer from "nodemailer";
import { z } from "zod";

const router = Router();

function formatContact(c: typeof contactMessagesTable.$inferSelect) {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
  };
}

async function sendEmailNotification(contact: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}) {
  let smtpHost = process.env.SMTP_HOST;
  let smtpPort = parseInt(process.env.SMTP_PORT ?? "587", 10);
  let smtpUser = process.env.SMTP_USER;
  let smtpPass = process.env.SMTP_PASS;
  let smtpFrom = process.env.SMTP_FROM ?? smtpUser;
  let smtpTo = process.env.SMTP_TO ?? smtpUser;

  try {
    const [settings] = await db.select().from(siteSettingsTable).limit(1);
    if (settings?.smtpEnabled) {
      smtpHost = settings.smtpHost ?? smtpHost ?? undefined;
      smtpPort = parseInt(settings.smtpPort ?? String(smtpPort), 10);
      smtpUser = settings.smtpUser ?? smtpUser ?? undefined;
      smtpPass = settings.smtpPass ?? smtpPass ?? undefined;
      smtpFrom = settings.smtpFrom ?? smtpFrom ?? smtpUser;
      smtpTo = settings.smtpTo ?? smtpTo ?? smtpUser;
    }
  } catch (err) {
    console.error("[SMTP] Failed to load settings from DB:", err);
  }

  if (!smtpHost || !smtpUser || !smtpPass) {
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"GlobalTrack Notifications" <${smtpFrom}>`,
      to: smtpTo,
      subject: `New Contact Message: ${contact.subject ?? "General Inquiry"} — from ${contact.name}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
          <div style="background: #0f172a; padding: 24px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #60a5fa; margin: 0; font-size: 18px;">🌍 GlobalTrack — New Contact Message</h2>
          </div>
          <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; width: 120px; font-size: 14px;">Name</td>
                <td style="padding: 10px 0; font-weight: 600; font-size: 14px;">${contact.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Email</td>
                <td style="padding: 10px 0; font-size: 14px;"><a href="mailto:${contact.email}" style="color: #3b82f6;">${contact.email}</a></td>
              </tr>
              ${contact.phone ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Phone</td>
                <td style="padding: 10px 0; font-size: 14px;">${contact.phone}</td>
              </tr>` : ""}
              ${contact.subject ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Subject</td>
                <td style="padding: 10px 0; font-weight: 600; font-size: 14px;">${contact.subject}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">Message</td>
                <td style="padding: 10px 0; font-size: 14px; line-height: 1.6;">${contact.message.replace(/\n/g, "<br>")}</td>
              </tr>
            </table>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">
            Sent via GlobalTrack Contact System · ${new Date().toUTCString()}
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[SMTP] Failed to send email notification:", err);
  }
}

router.get("/", async (req, res): Promise<void> => {
  const query = ListContactsQueryParams.safeParse(req.query);
  const contacts = await db
    .select()
    .from(contactMessagesTable)
    .orderBy(desc(contactMessagesTable.createdAt));

  res.json(contacts.map(formatContact));
});

router.post("/", async (req, res): Promise<void> => {
  const body = SubmitContactBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "validation_error", message: body.error.message });
    return;
  }

  const [contact] = await db
    .insert(contactMessagesTable)
    .values(body.data)
    .returning();

  if (!contact) {
    res.status(500).json({ error: "Failed to submit contact message" });
    return;
  }

  sendEmailNotification(body.data).catch(() => {});

  res.status(201).json(formatContact(contact));
});

router.put("/:id/read", async (req, res): Promise<void> => {
  const params = MarkContactReadParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [updated] = await db
    .update(contactMessagesTable)
    .set({ isRead: true })
    .where(eq(contactMessagesTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Contact message not found" });
    return;
  }

  res.json(formatContact(updated));
});

router.delete("/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id) || id <= 0) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [existing] = await db
    .select()
    .from(contactMessagesTable)
    .where(eq(contactMessagesTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Contact message not found" });
    return;
  }

  await db.delete(contactMessagesTable).where(eq(contactMessagesTable.id, id));
  res.status(204).send();
});

export default router;
