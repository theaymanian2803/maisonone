import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  ORDER_STATUSES,
  PRODUCT_CATEGORIES,
  CATEGORY_LABEL,
  type BlogPost,
  type Category,
  type Order,
  type OrderItem,
  type OrderStatus,
  type OrderWithItems,
  type Product,
  type Review,
} from "./catalog.types";

/**
 * Admin CRUD server functions. All mutations require an admin token that
 * matches process.env.ADMIN_TOKEN, compared in constant time server-side.
 *
 * The Turso client is imported lazily inside each handler so this module
 * stays safe to ship in the client bundle (only handler bodies are stripped).
 */

const productInsertSchema = z.object({
  token: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(64),
  image_url: z.string().trim().url().max(2000),
  current_price: z.number().nonnegative().max(1_000_000),
  original_price: z.number().nonnegative().max(1_000_000),
  discount_badge: z.string().trim().min(1).max(16),
  rating: z.number().min(0).max(5).default(5),
  gallery: z.array(z.string()).default([]),
});

const productUpdateSchema = productInsertSchema.extend({
  id: z.string().min(1).max(64),
});

const idWithTokenSchema = z.object({
  token: z.string().min(1),
  id: z.string().min(1).max(64),
});

const blogInsertSchema = z.object({
  token: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().min(1).max(500),
  image_url: z.string().trim().url().max(2000),
  content: z.string().max(20_000).default(""),
});

const blogUpdateSchema = blogInsertSchema.extend({
  id: z.string().min(1).max(64),
});

function parseGallery(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }
  return [];
}

function randomId(): string {
  // Crypto is available in the Worker runtime.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function unauthorized(): never {
  throw new Error("Unauthorized");
}

/* ---------------- Auth ping ---------------- */

export const verifyAdmin = createServerFn({ method: "POST" })
  .validator((input: { token: string }) => z.object({ token: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { verifyAdminToken } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    return { ok: true };
  });

/* ---------------- Admin reads ---------------- */

export const adminListProducts = createServerFn({ method: "POST" })
  .validator((input: { token: string }) => z.object({ token: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<Product[]> => {
    const { verifyAdminToken, tursoConfigured, getDb, ensureSchema } =
      await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    if (!tursoConfigured()) return [];
    await ensureSchema();
    const res = await getDb().execute(
      "SELECT id, title, category, image_url, gallery, current_price, original_price, discount_badge, rating, created_at FROM products ORDER BY created_at DESC",
    );
    return res.rows.map((r) => {
      const raw = r as unknown as Record<string, unknown>;
      return {
        id: String(raw.id),
        title: String(raw.title),
        category: String(raw.category) as Product["category"],
        image_url: String(raw.image_url),
        gallery: parseGallery(raw.gallery),
        current_price: Number(raw.current_price),
        original_price: Number(raw.original_price),
        discount_badge: String(raw.discount_badge),
        rating: Number(raw.rating),
        created_at: Number(raw.created_at),
      };
    });
  });

export const adminListBlogPosts = createServerFn({ method: "POST" })
  .validator((input: { token: string }) => z.object({ token: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<BlogPost[]> => {
    const { verifyAdminToken, tursoConfigured, getDb, ensureSchema } =
      await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    if (!tursoConfigured()) return [];
    await ensureSchema();
    const res = await getDb().execute(
      "SELECT id, title, excerpt, image_url, content, created_at FROM blog_posts ORDER BY created_at DESC",
    );
    return res.rows.map((r) => ({
      id: String(r.id),
      title: String(r.title),
      excerpt: String(r.excerpt),
      image_url: String(r.image_url),
      content: String(r.content ?? ""),
      created_at: Number(r.created_at),
    }));
  });

/* ---------------- Product CRUD ---------------- */

export const createProduct = createServerFn({ method: "POST" })
  .validator((input: unknown) => productInsertSchema.parse(input))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    const id = randomId();
    await getDb().execute({
      sql: `INSERT INTO products (id, title, category, image_url, current_price, original_price, discount_badge, rating, gallery)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        data.title,
        data.category,
        data.image_url,
        data.current_price,
        data.original_price,
        data.discount_badge,
        data.rating,
        JSON.stringify(data.gallery),
      ],
    });
    return { id };
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator((input: unknown) => productUpdateSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    await getDb().execute({
      sql: `UPDATE products
            SET title = ?, category = ?, image_url = ?, current_price = ?, original_price = ?, discount_badge = ?, rating = ?, gallery = ?
            WHERE id = ?`,
      args: [
        data.title,
        data.category,
        data.image_url,
        data.current_price,
        data.original_price,
        data.discount_badge,
        data.rating,
        JSON.stringify(data.gallery),
        data.id,
      ],
    });
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((input: unknown) => idWithTokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    await getDb().execute({
      sql: "DELETE FROM products WHERE id = ?",
      args: [data.id],
    });
    return { ok: true };
  });

/* ---------------- Blog CRUD ---------------- */

export const createBlogPost = createServerFn({ method: "POST" })
  .validator((input: unknown) => blogInsertSchema.parse(input))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    const id = randomId();
    await getDb().execute({
      sql: `INSERT INTO blog_posts (id, title, excerpt, image_url, content) VALUES (?, ?, ?, ?, ?)`,
      args: [id, data.title, data.excerpt, data.image_url, data.content],
    });
    return { id };
  });

export const updateBlogPost = createServerFn({ method: "POST" })
  .validator((input: unknown) => blogUpdateSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    await getDb().execute({
      sql: `UPDATE blog_posts SET title = ?, excerpt = ?, image_url = ?, content = ? WHERE id = ?`,
      args: [data.title, data.excerpt, data.image_url, data.content, data.id],
    });
    return { ok: true };
  });

export const deleteBlogPost = createServerFn({ method: "POST" })
  .validator((input: unknown) => idWithTokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    await getDb().execute({
      sql: "DELETE FROM blog_posts WHERE id = ?",
      args: [data.id],
    });
    return { ok: true };
  });

/* ---------------- Category CRUD ---------------- */

export const adminListCategories = createServerFn({ method: "POST" })
  .validator((input: { token: string }) => z.object({ token: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<Category[]> => {
    const { verifyAdminToken, tursoConfigured, getDb, ensureSchema } =
      await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    if (!tursoConfigured()) return [];
    await ensureSchema();
    const res = await getDb().execute("SELECT slug, label FROM categories ORDER BY slug ASC");
    const rows = res.rows.map((r) => ({
      slug: String(r.slug),
      label: String(r.label),
    }));
    return rows.length > 0
      ? rows
      : PRODUCT_CATEGORIES.map((s) => ({ slug: s, label: CATEGORY_LABEL[s] }));
  });

export const createCategory = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        token: z.string().min(1),
        slug: z
          .string()
          .trim()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric + hyphens"),
        label: z.string().trim().min(1).max(64),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ slug: string }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    await getDb().execute({
      sql: "INSERT INTO categories (slug, label) VALUES (?, ?)",
      args: [data.slug, data.label],
    });
    return { slug: data.slug };
  });

export const updateCategory = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        token: z.string().min(1),
        slug: z.string().trim().min(1).max(64),
        label: z.string().trim().min(1).max(64),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    await getDb().execute({
      sql: "UPDATE categories SET label = ? WHERE slug = ?",
      args: [data.label, data.slug],
    });
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        token: z.string().min(1),
        slug: z.string().trim().min(1).max(64),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    await getDb().execute({
      sql: "DELETE FROM categories WHERE slug = ?",
      args: [data.slug],
    });
    return { ok: true };
  });

const orderItemSchema = z.object({
  product_id: z.string().max(64).nullable().optional(),
  title: z.string().trim().min(1).max(200),
  quantity: z.number().int().min(1).max(1000),
  unit_price: z.number().nonnegative().max(1_000_000),
});

const orderCreateSchema = z.object({
  token: z.string().min(1),
  customer_name: z.string().trim().min(1).max(200),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().max(50).default(""),
  shipping_address: z.string().trim().max(1000).default(""),
  status: z.enum(ORDER_STATUSES).default("pending"),
  notes: z.string().max(2000).default(""),
  items: z.array(orderItemSchema).min(1).max(100),
});

const orderStatusSchema = z.object({
  token: z.string().min(1),
  id: z.string().min(1).max(64),
  status: z.enum(ORDER_STATUSES),
});

function toOrderRow(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    customer_name: String(row.customer_name),
    customer_email: String(row.customer_email),
    customer_phone: String(row.customer_phone ?? ""),
    shipping_address: String(row.shipping_address ?? ""),
    total: Number(row.total),
    status: String(row.status) as OrderStatus,
    notes: String(row.notes ?? ""),
    created_at: Number(row.created_at),
    item_count: row.item_count == null ? undefined : Number(row.item_count),
  };
}

function toOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    product_id: row.product_id == null ? null : String(row.product_id),
    title: String(row.title),
    quantity: Number(row.quantity),
    unit_price: Number(row.unit_price),
  };
}

export const adminListOrders = createServerFn({ method: "POST" })
  .validator((input: { token: string; status?: OrderStatus | "all" }) =>
    z
      .object({
        token: z.string().min(1),
        status: z.enum([...ORDER_STATUSES, "all"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<Order[]> => {
    const { verifyAdminToken, tursoConfigured, getDb, ensureSchema } =
      await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    if (!tursoConfigured()) return [];
    await ensureSchema();
    const filter = data.status && data.status !== "all";
    const res = await getDb().execute({
      sql: `SELECT o.id, o.customer_name, o.customer_email, o.customer_phone, o.shipping_address, o.total,
                   o.status, o.notes, o.created_at,
                   (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
            FROM orders o
            ${filter ? "WHERE o.status = ?" : ""}
            ORDER BY o.created_at DESC`,
      args: filter ? [data.status as string] : [],
    });
    return res.rows.map((r) => toOrderRow(r as unknown as Record<string, unknown>));
  });

export const adminGetOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) => idWithTokenSchema.parse(input))
  .handler(async ({ data }): Promise<OrderWithItems | null> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    const db = getDb();
    const orderRes = await db.execute({
      sql: `SELECT id, customer_name, customer_email, customer_phone, shipping_address, total, status, notes, created_at
            FROM orders WHERE id = ?`,
      args: [data.id],
    });
    if (orderRes.rows.length === 0) return null;
    const order = toOrderRow(orderRes.rows[0] as unknown as Record<string, unknown>);
    const itemsRes = await db.execute({
      sql: `SELECT id, order_id, product_id, title, quantity, unit_price
            FROM order_items WHERE order_id = ? ORDER BY rowid`,
      args: [data.id],
    });
    return {
      ...order,
      items: itemsRes.rows.map((r) => toOrderItem(r as unknown as Record<string, unknown>)),
    };
  });

export const adminCreateOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) => orderCreateSchema.parse(input))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    const orderId = randomId();
    const total = data.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    const db = getDb();
    const statements: { sql: string; args: (string | number | null)[] }[] = [
      {
        sql: `INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address, total, status, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          orderId,
          data.customer_name,
          data.customer_email,
          data.customer_phone,
          data.shipping_address,
          Math.round(total * 100) / 100,
          data.status,
          data.notes,
        ],
      },
      ...data.items.map((i) => ({
        sql: `INSERT INTO order_items (id, order_id, product_id, title, quantity, unit_price)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [randomId(), orderId, i.product_id ?? null, i.title, i.quantity, i.unit_price] as (
          | string
          | number
          | null
        )[],
      })),
    ];
    await db.batch(statements, "write");
    return { id: orderId };
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) => orderStatusSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    await getDb().execute({
      sql: "UPDATE orders SET status = ? WHERE id = ?",
      args: [data.status, data.id],
    });
    return { ok: true };
  });

export const adminDeleteOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) => idWithTokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    await getDb().execute({
      sql: "DELETE FROM orders WHERE id = ?",
      args: [data.id],
    });
    return { ok: true };
  });

/* ---------------- Review Admin ---------------- */

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

export const adminListReviews = createServerFn({ method: "POST" })
  .validator((input: { token: string }) => z.object({ token: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<(Review & { product_title: string })[]> => {
    const { verifyAdminToken, tursoConfigured, getDb, ensureSchema } =
      await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    if (!tursoConfigured()) return [];
    await ensureSchema();
    const res = await getDb().execute(
      `SELECT r.*, COALESCE(p.title, 'Deleted product') AS product_title
       FROM reviews r
       LEFT JOIN products p ON p.id = r.product_id
       ORDER BY r.created_at DESC`,
    );
    return res.rows.map((r) => {
      const row = r as unknown as Record<string, unknown>;
      return { ...toReview(row), product_title: String(row.product_title) };
    });
  });

export const adminApproveReview = createServerFn({ method: "POST" })
  .validator((input: unknown) => idWithTokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    await getDb().execute({
      sql: "UPDATE reviews SET approved = 1 WHERE id = ?",
      args: [data.id],
    });
    return { ok: true };
  });

export const adminDeleteReview = createServerFn({ method: "POST" })
  .validator((input: unknown) => idWithTokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { verifyAdminToken, getDb, ensureSchema } = await import("./turso.server");
    if (!verifyAdminToken(data.token)) unauthorized();
    await ensureSchema();
    await getDb().execute({
      sql: "DELETE FROM reviews WHERE id = ?",
      args: [data.id],
    });
    return { ok: true };
  });
