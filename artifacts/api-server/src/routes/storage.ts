import { randomUUID } from "crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { eq, sql } from "drizzle-orm";
import { db, fileBlobsTable } from "@workspace/db";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

function getApiBase(req: Request): string {
  return `${req.protocol}://${req.get("host")}/api`;
}

async function ensureFileBlobsTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "file_blobs" (
      "id" text PRIMARY KEY NOT NULL,
      "file_name" text NOT NULL,
      "content_type" text NOT NULL,
      "size" integer NOT NULL,
      "data_base64" text NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `);
}

router.post("/storage/uploads", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "Missing file" });
    return;
  }

  try {
    await ensureFileBlobsTable();

    const id = randomUUID();
    const contentType = req.file.mimetype || "application/octet-stream";

    await db.insert(fileBlobsTable).values({
      id,
      fileName: req.file.originalname || "upload",
      contentType,
      size: req.file.size,
      dataBase64: req.file.buffer.toString("base64"),
    });

    const publicUrl = `${getApiBase(req)}/storage/public-objects/${id}`;
    res.status(201).json({
      id,
      objectPath: `/objects/${id}`,
      publicUrl,
      url: publicUrl,
      metadata: {
        name: req.file.originalname,
        size: req.file.size,
        contentType,
      },
    });
  } catch (error) {
    req.log.error({ err: error }, "Error storing upload in Neon");
    res.status(500).json({ error: "Failed to store upload" });
  }
});

router.get(["/storage/public-objects/:id", "/storage/objects/:id"], async (req: Request, res: Response) => {
  try {
    await ensureFileBlobsTable();

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const [file] = await db
      .select()
      .from(fileBlobsTable)
      .where(eq(fileBlobsTable.id, id))
      .limit(1);

    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const body = Buffer.from(file.dataBase64, "base64");
    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Length", String(body.length));
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(body);
  } catch (error) {
    req.log.error({ err: error }, "Error serving Neon file");
    res.status(500).json({ error: "Failed to serve file" });
  }
});

export default router;
