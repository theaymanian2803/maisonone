import { createClient, type Client } from "@libsql/client";

/**
 * Turso / libSQL client. Server-only.
 *
 * Reads TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from process.env inside
 * getDb() so envs injected at request time by the Worker runtime resolve
 * correctly.
 */

let cached: Client | null = null;
let schemaReady = false;

export function tursoConfigured(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

export function getDb(): Client {
  if (cached) return cached;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Set it in your environment to enable the database.",
    );
  }
  cached = createClient({ url, authToken });
  return cached;
}

export const CATEGORIES = [
  "tv-units",
  "libraries",
  "shelves",
  "tables",
  "sofas",
  "rugs",
  "beds",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/** Lazily create tables on first access. Safe to call repeatedly. */
export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  const db = getDb();
  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS products (
         id TEXT PRIMARY KEY,
         title TEXT NOT NULL,
         category TEXT NOT NULL,
         image_url TEXT NOT NULL,
         current_price REAL NOT NULL,
          original_price REAL NOT NULL,
          discount_badge TEXT NOT NULL,
          rating REAL NOT NULL DEFAULT 5.0,
          gallery TEXT NOT NULL DEFAULT '[]',
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
      `CREATE TABLE IF NOT EXISTS blog_posts (
         id TEXT PRIMARY KEY,
         title TEXT NOT NULL,
         excerpt TEXT NOT NULL,
         image_url TEXT NOT NULL,
         content TEXT NOT NULL DEFAULT '',
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE TABLE IF NOT EXISTS orders (
         id TEXT PRIMARY KEY,
         customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
          customer_phone TEXT NOT NULL DEFAULT '',
          shipping_address TEXT NOT NULL DEFAULT '',
         total REAL NOT NULL,
         status TEXT NOT NULL DEFAULT 'pending',
         notes TEXT NOT NULL DEFAULT '',
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)`,
      `CREATE TABLE IF NOT EXISTS order_items (
         id TEXT PRIMARY KEY,
         order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
         product_id TEXT,
         title TEXT NOT NULL,
         quantity INTEGER NOT NULL,
         unit_price REAL NOT NULL
       )`,
      `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`,
      `CREATE TABLE IF NOT EXISTS categories (
         slug TEXT PRIMARY KEY,
         label TEXT NOT NULL
       )`,
      `CREATE TABLE IF NOT EXISTS customers (
         id TEXT PRIMARY KEY,
         email TEXT NOT NULL UNIQUE,
         name TEXT NOT NULL,
         password_hash TEXT NOT NULL,
         auth_token TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`,
      `CREATE TABLE IF NOT EXISTS reviews (
         id TEXT PRIMARY KEY,
         product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
         customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
         order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
         customer_name TEXT NOT NULL,
         rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
         title TEXT NOT NULL DEFAULT '',
         body TEXT NOT NULL,
          verified_purchase INTEGER NOT NULL DEFAULT 0,
          approved INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)`,
      `CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id)`,
    ],
    "write",
  );

  /* Add columns that may not exist on tables created before schema changes */
  for (const alter of [
    "ALTER TABLE products ADD COLUMN gallery TEXT NOT NULL DEFAULT '[]'",
    "ALTER TABLE reviews ADD COLUMN approved INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE orders ADD COLUMN customer_phone TEXT NOT NULL DEFAULT ''",
  ]) {
    try { await db.execute(alter); } catch { /* column already exists */ }
  }

  schemaReady = true;
}

/** Verify admin password. */
export function verifyAdminToken(token: string | undefined | null): boolean {
  const expected = process.env.ADMIN_TOKEN ?? "111222";
  return token === expected;
}
