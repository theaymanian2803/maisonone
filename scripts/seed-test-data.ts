import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN!;
if (!url) {
  console.error("TURSO_DATABASE_URL is not set. Create a .env file with your Turso credentials.");
  process.exit(1);
}
const db = createClient({ url, authToken });

function uuid() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function seed() {
  // Ensure tables exist
  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS products (
       id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL,
       image_url TEXT NOT NULL, current_price REAL NOT NULL,
       original_price REAL NOT NULL, discount_badge TEXT NOT NULL,
       rating REAL NOT NULL DEFAULT 5.0,
       created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
      `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
      `CREATE TABLE IF NOT EXISTS blog_posts (
       id TEXT PRIMARY KEY, title TEXT NOT NULL, excerpt TEXT NOT NULL,
       image_url TEXT NOT NULL, content TEXT NOT NULL DEFAULT '',
       created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
      `CREATE TABLE IF NOT EXISTS orders (
       id TEXT PRIMARY KEY, customer_name TEXT NOT NULL,
       customer_email TEXT NOT NULL, shipping_address TEXT NOT NULL DEFAULT '',
       total REAL NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
       notes TEXT NOT NULL DEFAULT '',
       created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)`,
      `CREATE TABLE IF NOT EXISTS order_items (
       id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
       product_id TEXT, title TEXT NOT NULL, quantity INTEGER NOT NULL,
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
    ],
    "write",
  );

  const now = Math.floor(Date.now() / 1000);

  // Seed categories
  const defaultCategories = [
    { slug: "tv-units", label: "TV Units" },
    { slug: "libraries", label: "Libraries" },
    { slug: "shelves", label: "Shelves" },
    { slug: "tables", label: "Tables" },
    { slug: "sofas", label: "Sofas" },
    { slug: "rugs", label: "Rugs" },
    { slug: "beds", label: "Beds" },
  ];
  for (const c of defaultCategories) {
    await db.execute({
      sql: "INSERT OR IGNORE INTO categories (slug, label) VALUES (?, ?)",
      args: [c.slug, c.label],
    });
  }
  console.log("✅ Categories seeded");

  // Product
  const productId = uuid();
  await db.execute({
    sql: `INSERT INTO products (id, title, category, image_url, current_price, original_price, discount_badge, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      productId,
      "Nordic Oak TV Console",
      "tv-units",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&h=900&q=80",
      649,
      819,
      "-20%",
      5,
    ],
  });
  console.log("✅ Product created:", productId);

  // Blog post
  const blogId = uuid();
  await db.execute({
    sql: `INSERT INTO blog_posts (id, title, excerpt, image_url, content) VALUES (?, ?, ?, ?, ?)`,
    args: [
      blogId,
      "How to layer textures in a modern living room",
      "A quick guide to mixing linen, wool, and oak without losing that airy, minimalist feel.",
      "https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&w=700&h=500&q=80",
      "Full article content here...",
    ],
  });
  console.log("✅ Blog post created:", blogId);

  // Order with items
  const orderId = uuid();
  const itemId = uuid();
  await db.batch(
    [
      {
        sql: `INSERT INTO orders (id, customer_name, customer_email, shipping_address, total, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          orderId,
          "Jane Doe",
          "jane@example.com",
          "123 Main St, New York, NY 10001",
          649,
          "pending",
          "Please deliver between 2-5pm",
        ],
      },
      {
        sql: `INSERT INTO order_items (id, order_id, product_id, title, quantity, unit_price) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [itemId, orderId, productId, "Nordic Oak TV Console", 1, 649],
      },
    ],
    "write",
  );
  console.log("✅ Order created:", orderId);

  console.log("\n🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
