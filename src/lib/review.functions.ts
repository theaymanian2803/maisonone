import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { type Review } from "./catalog.types";

function toReview(row: Record<string, unknown>): Review {
  return {
    id: String(row.id),
    product_id: String(row.product_id),
    customer_id: row.customer_id == null ? null : String(row.customer_id),
    order_id: row.order_id == null ? null : String(row.order_id),
    customer_name: String(row.customer_name),
    rating: Number(row.rating),
    title: String(row.title ?? ""),
    body: String(row.body),
    verified_purchase: Boolean(row.verified_purchase),
    approved: Boolean(row.approved),
    created_at: Number(row.created_at),
  };
}

function randomId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const getProductReviews = createServerFn({ method: "GET" })
  .validator((input: { productId: string }) =>
    z.object({ productId: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<Review[]> => {
    const { tursoConfigured, getDb, ensureSchema } = await import("./turso.server");
    if (!tursoConfigured()) return [];
    await ensureSchema();
    const res = await getDb().execute({
      sql: `SELECT id, product_id, customer_id, order_id, customer_name, rating, title, body, verified_purchase, approved, created_at
            FROM reviews WHERE product_id = ? AND approved = 1 ORDER BY created_at DESC`,
      args: [data.productId],
    });
    return res.rows.map((r) => toReview(r as unknown as Record<string, unknown>));
  });

export const getCanReview = createServerFn({ method: "POST" })
  .validator((input: { productId: string; authToken?: string }) =>
    z.object({ productId: z.string().min(1), authToken: z.string().optional() }).parse(input),
  )
  .handler(async ({ data }): Promise<{ canReview: boolean; hasReviewed: boolean }> => {
    if (!data.authToken) return { canReview: false, hasReviewed: false };
    const { getDb, ensureSchema } = await import("./turso.server");
    await ensureSchema();
    const db = getDb();

    const customerRes = await db.execute({
      sql: "SELECT id FROM customers WHERE auth_token = ?",
      args: [data.authToken],
    });
    if (customerRes.rows.length === 0) return { canReview: false, hasReviewed: false };
    const customerId = String((customerRes.rows[0] as Record<string, unknown>).id);

    const reviewRes = await db.execute({
      sql: "SELECT id FROM reviews WHERE product_id = ? AND customer_id = ?",
      args: [data.productId, customerId],
    });
    if (reviewRes.rows.length > 0) return { canReview: false, hasReviewed: true };

    const orderRes = await db.execute({
      sql: `SELECT 1 FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            WHERE oi.product_id = ? AND o.customer_email = (SELECT email FROM customers WHERE id = ?)
            AND o.status IN ('delivered', 'shipped', 'paid')`,
      args: [data.productId, customerId],
    });
    return { canReview: orderRes.rows.length > 0, hasReviewed: false };
  });

export const createReview = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        productId: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        title: z.string().max(200).default(""),
        body: z.string().trim().min(1).max(5000),
        customerName: z.string().trim().min(1).max(200),
        authToken: z.string().optional(),
        orderId: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ id: string }> => {
    const { getDb, ensureSchema } = await import("./turso.server");
    await ensureSchema();
    const db = getDb();

    let customerId: string | null = null;
    let verifiedPurchase = false;

    if (data.authToken) {
      const customerRes = await db.execute({
        sql: "SELECT id FROM customers WHERE auth_token = ?",
        args: [data.authToken],
      });
      if (customerRes.rows.length > 0) {
        customerId = String((customerRes.rows[0] as Record<string, unknown>).id);
        const emailRes = await db.execute({
          sql: "SELECT email FROM customers WHERE id = ?",
          args: [customerId],
        });
        const email = String((emailRes.rows[0] as Record<string, unknown>).email);
        const orderRes = await db.execute({
          sql: `SELECT oi.order_id FROM orders o
                JOIN order_items oi ON oi.order_id = o.id
                WHERE oi.product_id = ? AND o.customer_email = ?
                AND o.status IN ('delivered', 'shipped', 'paid')
                LIMIT 1`,
          args: [data.productId, email],
        });
        if (orderRes.rows.length > 0) {
          verifiedPurchase = true;
        }
      }
    }

    const id = randomId();
    await db.execute({
      sql: `INSERT INTO reviews (id, product_id, customer_id, order_id, customer_name, rating, title, body, verified_purchase, approved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      args: [
        id,
        data.productId,
        customerId,
        data.orderId ?? null,
        data.customerName,
        data.rating,
        data.title,
        data.body,
        verifiedPurchase ? 1 : 0,
      ],
    });
    return { id };
  });
