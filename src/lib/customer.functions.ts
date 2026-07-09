import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function hashPassword(password: string, salt?: string): Promise<string> {
  const s = salt ?? crypto.randomUUID();
  const encoder = new TextEncoder();
  const data = encoder.encode(s + password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${s}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const salt = stored.split(":")[0];
  const expected = await hashPassword(password, salt);
  return expected === stored;
}

function randomId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const registerCustomer = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        name: z.string().trim().min(1).max(200),
        password: z.string().min(8).max(128),
        confirmPassword: z.string().min(1),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      })
      .parse(input),
  )
  .handler(
    async ({
      data,
    }): Promise<{ token: string; customer: { id: string; email: string; name: string } }> => {
      const { getDb, ensureSchema } = await import("./turso.server");
      await ensureSchema();
      const db = getDb();
      const existing = await db.execute({
        sql: "SELECT id FROM customers WHERE email = ?",
        args: [data.email],
      });
      if (existing.rows.length > 0) throw new Error("Email already registered.");
      const id = randomId();
      const passwordHash = await hashPassword(data.password);
      const token = randomId();
      await db.execute({
        sql: "INSERT INTO customers (id, email, name, password_hash, auth_token) VALUES (?, ?, ?, ?, ?)",
        args: [id, data.email, data.name, passwordHash, token],
      });
      return { token, customer: { id, email: data.email, name: data.name } };
    },
  );

export const loginCustomer = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        password: z.string().min(1).max(128),
      })
      .parse(input),
  )
  .handler(
    async ({
      data,
    }): Promise<{ token: string; customer: { id: string; email: string; name: string } }> => {
      const { getDb, ensureSchema } = await import("./turso.server");
      await ensureSchema();
      const db = getDb();
      const res = await db.execute({
        sql: "SELECT id, email, name, password_hash FROM customers WHERE email = ?",
        args: [data.email],
      });
      if (res.rows.length === 0) throw new Error("Invalid email or password.");
      const row = res.rows[0] as unknown as Record<string, unknown>;
      const match = await verifyPassword(data.password, String(row.password_hash));
      if (!match) throw new Error("Invalid email or password.");
      const token = randomId();
      await db.execute({
        sql: "UPDATE customers SET auth_token = ? WHERE id = ?",
        args: [token, String(row.id)],
      });
      return {
        token,
        customer: {
          id: String(row.id),
          email: String(row.email),
          name: String(row.name),
        },
      };
    },
  );

export const getCurrentCustomer = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ token: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<{ id: string; email: string; name: string } | null> => {
    const { getDb, ensureSchema } = await import("./turso.server");
    await ensureSchema();
    const db = getDb();
    const res = await db.execute({
      sql: "SELECT id, email, name FROM customers WHERE auth_token = ?",
      args: [data.token],
    });
    if (res.rows.length === 0) return null;
    const row = res.rows[0] as unknown as Record<string, unknown>;
    return { id: String(row.id), email: String(row.email), name: String(row.name) };
  });

const orderItemInput = z.object({
  product_id: z.string().max(64).nullable().optional(),
  title: z.string().trim().min(1).max(200),
  image_url: z.string().max(2000).default(""),
  quantity: z.number().int().min(1).max(100),
  unit_price: z.number().nonnegative().max(1_000_000),
});

export const placeOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        customer_name: z.string().trim().min(1).max(200),
        customer_email: z.string().trim().email().max(255),
        customer_phone: z.string().trim().max(50).default(""),
        shipping_address: z.string().trim().min(1).max(1000),
        notes: z.string().max(2000).default(""),
        items: z.array(orderItemInput).min(1).max(100),
        auth_token: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ id: string }> => {
    const { getDb, ensureSchema } = await import("./turso.server");
    await ensureSchema();
    const db = getDb();
    let customerId: string | null = null;
    if (data.auth_token) {
      const res = await db.execute({
        sql: "SELECT id FROM customers WHERE auth_token = ?",
        args: [data.auth_token],
      });
      if (res.rows.length > 0) {
        customerId = String((res.rows[0] as unknown as Record<string, unknown>).id);
      }
    }
    const orderId = randomId();
    const total = data.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    const statements: { sql: string; args: (string | number | null)[] }[] = [
      {
        sql: `INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address, total, status, notes)
              VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
        args: [
          orderId,
          data.customer_name,
          data.customer_email,
          data.customer_phone,
          data.shipping_address,
          Math.round(total * 100) / 100,
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

export const listCustomerOrders = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ token: z.string().min(1) }).parse(input))
  .handler(
    async ({
      data,
    }): Promise<
      {
        id: string;
        total: number;
        status: string;
        created_at: number;
      }[]
    > => {
      const { getDb, ensureSchema } = await import("./turso.server");
      await ensureSchema();
      const db = getDb();
      const customerRes = await db.execute({
        sql: "SELECT email FROM customers WHERE auth_token = ?",
        args: [data.token],
      });
      if (customerRes.rows.length === 0) return [];
      const email = String(
        (customerRes.rows[0] as unknown as Record<string, unknown>).email,
      );
      const ordersRes = await db.execute({
        sql: `SELECT id, total, status, created_at
              FROM orders WHERE customer_email = ?
              ORDER BY created_at DESC`,
        args: [email],
      });
      return ordersRes.rows.map((r) => {
        const row = r as unknown as Record<string, unknown>;
        return {
          id: String(row.id),
          total: Number(row.total),
          status: String(row.status),
          created_at: Number(row.created_at),
        };
      });
    },
  );

export const getOrderById = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().min(1).max(64) }).parse(input))
  .handler(
    async ({
      data,
    }): Promise<{
      id: string;
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      shipping_address: string;
      total: number;
      status: string;
      notes: string;
      created_at: number;
      items: { title: string; quantity: number; unit_price: number }[];
    } | null> => {
      const { getDb, ensureSchema } = await import("./turso.server");
      await ensureSchema();
      const db = getDb();
      const orderRes = await db.execute({
        sql: `SELECT id, customer_name, customer_email, customer_phone, shipping_address, total, status, notes, created_at
            FROM orders WHERE id = ?`,
        args: [data.id],
      });
      if (orderRes.rows.length === 0) return null;
      const order = orderRes.rows[0] as unknown as Record<string, unknown>;
      const itemsRes = await db.execute({
        sql: "SELECT title, quantity, unit_price FROM order_items WHERE order_id = ? ORDER BY rowid",
        args: [data.id],
      });
      return {
        id: String(order.id),
        customer_name: String(order.customer_name),
        customer_email: String(order.customer_email),
        customer_phone: String(order.customer_phone ?? ""),
        shipping_address: String(order.shipping_address ?? ""),
        total: Number(order.total),
        status: String(order.status),
        notes: String(order.notes ?? ""),
        created_at: Number(order.created_at),
        items: itemsRes.rows.map((r) => {
          const row = r as unknown as Record<string, unknown>;
          return {
            title: String(row.title),
            quantity: Number(row.quantity),
            unit_price: Number(row.unit_price),
          };
        }),
      };
    },
  );
