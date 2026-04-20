import { Router } from "express";
import { db, testimonialsTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import { CreateTestimonialBody, UpdateTestimonialBody, UpdateTestimonialParams, DeleteTestimonialParams, ListTestimonialsQueryParams } from "@workspace/api-zod";

const router = Router();

function formatTestimonial(t: typeof testimonialsTable.$inferSelect) {
  return {
    ...t,
    createdAt: t.createdAt.toISOString(),
  };
}

router.get("/", async (req, res): Promise<void> => {
  const query = ListTestimonialsQueryParams.safeParse(req.query);
  const testimonials = await db
    .select()
    .from(testimonialsTable)
    .orderBy(asc(testimonialsTable.sortOrder), desc(testimonialsTable.createdAt));

  res.json(testimonials.map(formatTestimonial));
});

router.post("/", async (req, res): Promise<void> => {
  const body = CreateTestimonialBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "validation_error", message: body.error.message });
    return;
  }

  const [testimonial] = await db
    .insert(testimonialsTable)
    .values(body.data)
    .returning();

  if (!testimonial) {
    res.status(500).json({ error: "Failed to create testimonial" });
    return;
  }

  res.status(201).json(formatTestimonial(testimonial));
});

router.put("/:id", async (req, res): Promise<void> => {
  const params = UpdateTestimonialParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateTestimonialBody.safeParse(req.body);

  if (!params.success || !body.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid data" });
    return;
  }

  const [updated] = await db
    .update(testimonialsTable)
    .set(body.data)
    .where(eq(testimonialsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Testimonial not found" });
    return;
  }

  res.json(formatTestimonial(updated));
});

router.delete("/:id", async (req, res): Promise<void> => {
  const params = DeleteTestimonialParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(testimonialsTable).where(eq(testimonialsTable.id, params.data.id));
  res.status(204).send();
});

export default router;
