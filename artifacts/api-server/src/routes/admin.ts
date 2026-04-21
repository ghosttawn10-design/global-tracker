import { Router } from "express";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";
import crypto from "crypto";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@globaltrack.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Admin";

const sessions = new Map<string, { id: number; email: string; name: string; expiresAt: Date }>();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "globaltrack_salt").digest("hex");
}

router.post("/login", async (req, res): Promise<void> => {
  const body = AdminLoginBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid credentials format" });
    return;
  }

  const { email, password } = body.data;

  let admin: { id: number; email: string; name: string } | null = null;

  try {
    const [dbAdmin] = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.email, email))
      .limit(1);

    if (dbAdmin) {
      const hashedInput = hashPassword(password);
      const isValid = dbAdmin.password === hashedInput || dbAdmin.password === password;
      if (isValid) {
        admin = { id: dbAdmin.id, email: dbAdmin.email, name: dbAdmin.name };
      }
    }
  } catch {
    // Database unavailable/misconfigured: fall back to env credentials
  }

  if (!admin && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    admin = { id: 0, email: ADMIN_EMAIL, name: ADMIN_NAME };
  }

  if (!admin) {
    res.status(401).json({ error: "unauthorized", message: "Invalid email or password" });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  sessions.set(token, { ...admin, expiresAt });

  const forwardedProto = String(req.headers["x-forwarded-proto"] ?? "").toLowerCase();
  const isHttps = Boolean((req as any).secure) || forwardedProto === "https";
  const hasOrigin = typeof req.headers.origin === "string" && req.headers.origin.length > 0;
  const sameSite = isHttps && hasOrigin ? "none" : "lax";

  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: isHttps,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite,
  });

  res.json({ success: true, admin, token });
});

router.post("/logout", async (req, res): Promise<void> => {
  const token = req.cookies?.admin_token ?? req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    sessions.delete(token);
  }
  res.clearCookie("admin_token");
  res.json({ success: true });
});

router.get("/me", async (req, res): Promise<void> => {
  const token = req.cookies?.admin_token ?? req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt < new Date()) {
    if (session) sessions.delete(token);
    res.status(401).json({ error: "unauthorized", message: "Session expired" });
    return;
  }

  res.json({ id: session.id, email: session.email, name: session.name });
});

router.put("/credentials", async (req, res): Promise<void> => {
  const token = req.cookies?.admin_token ?? req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt < new Date()) {
    if (session) sessions.delete(token);
    res.status(401).json({ error: "unauthorized", message: "Session expired" });
    return;
  }

  const { email, password, currentPassword, name } = req.body as {
    email?: string;
    password?: string;
    currentPassword?: string;
    name?: string;
  };

  if (!email && !password && !name) {
    res.status(400).json({ error: "validation_error", message: "No fields to update" });
    return;
  }

  if (password && !currentPassword) {
    res.status(400).json({ error: "validation_error", message: "Current password is required to set a new password" });
    return;
  }

  const [existing] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, session.email))
    .limit(1);

  if (existing) {
    if (password && currentPassword) {
      const hashedCurrent = hashPassword(currentPassword);
      const validCurrent = existing.password === hashedCurrent || existing.password === currentPassword;
      if (!validCurrent) {
        res.status(401).json({ error: "unauthorized", message: "Current password is incorrect" });
        return;
      }
    }

    const updates: Record<string, string> = {};
    if (email) updates.email = email;
    if (name) updates.name = name;
    if (password) updates.password = hashPassword(password);

    const [updated] = await db
      .update(adminUsersTable)
      .set(updates)
      .where(eq(adminUsersTable.id, existing.id))
      .returning();

    if (updated) {
      sessions.set(token, { ...session, email: updated.email, name: updated.name });
    }

    res.json({ success: true, email: updated?.email ?? existing.email, name: updated?.name ?? existing.name });
    return;
  }

  if (password && currentPassword) {
    const isDefaultValid = currentPassword === ADMIN_PASSWORD;
    if (!isDefaultValid) {
      res.status(401).json({ error: "unauthorized", message: "Current password is incorrect" });
      return;
    }
  }

  const newEmail = email ?? session.email;
  const newName = name ?? session.name;
  const hashedPass = password ? hashPassword(password) : hashPassword(ADMIN_PASSWORD);

  const [created] = await db
    .insert(adminUsersTable)
    .values({ email: newEmail, name: newName, password: hashedPass })
    .returning();

  if (created) {
    sessions.set(token, { ...session, email: created.email, name: created.name });
  }

  res.json({ success: true, email: created?.email ?? newEmail, name: created?.name ?? newName });
});

export function requireAdmin(req: any, res: any, next: any): void {
  const token = req.cookies?.admin_token ?? req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt < new Date()) {
    if (session) sessions.delete(token);
    res.status(401).json({ error: "unauthorized", message: "Session expired" });
    return;
  }

  next();
}

export default router;
