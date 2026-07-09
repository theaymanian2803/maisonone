import { createClient } from "@libsql/client";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
function loadEnv(path) {
  if (!existsSync(path)) return;
  const txt = readFileSync(path, "utf-8");
  for (const line of txt.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    process.env[key] = val;
  }
}

loadEnv(resolve(__dirname, ".env"));

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("FAIL: TURSO_DATABASE_URL is not set");
  process.exit(1);
}

console.log("TURSO_DATABASE_URL:", url);
console.log("TURSO_AUTH_TOKEN:", authToken ? authToken.slice(0, 20) + "..." : "NOT SET");

const db = createClient({ url, authToken });

try {
  // Test basic connection
  console.log("\n1. Testing connection...");
  const ping = await db.execute("SELECT 1 AS ping");
  console.log("   OK - row count:", ping.rows.length);

  // Check if products table exists
  console.log("\n2. Checking products table...");
  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='products'"
  );
  if (tables.rows.length > 0) {
    console.log("   products table exists");
    
    // Check columns
    const cols = await db.execute("PRAGMA table_info(products)");
    const colNames = cols.rows.map(r => r.name);
    console.log("   columns:", colNames.join(", "));
    
    if (!colNames.includes("gallery")) {
      console.log("3. Adding gallery column...");
      await db.execute("ALTER TABLE products ADD COLUMN gallery TEXT NOT NULL DEFAULT '[]'");
      console.log("   OK");
    } else {
      console.log("3. gallery column already exists");
    }

    // Try SELECT
    console.log("\n4. Testing SELECT products...");
    const res = await db.execute(
      "SELECT id, title, image_url, gallery, current_price, original_price, discount_badge, rating, created_at FROM products ORDER BY created_at DESC LIMIT 5"
    );
    console.log("   Found", res.rows.length, "products");
    for (const row of res.rows) {
      console.log("   -", row.title, "| gallery:", row.gallery);
    }
  } else {
    console.log("   products table does not exist (will be created on first use)");
  }

  // Check reviews table
  console.log("\n5. Checking reviews table...");
  const revTables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='reviews'"
  );
  if (revTables.rows.length > 0) {
    const revCols = await db.execute("PRAGMA table_info(reviews)");
    const revColNames = revCols.rows.map(r => r.name);
    console.log("   reviews columns:", revColNames.join(", "));
    
    if (!revColNames.includes("approved")) {
      console.log("6. Adding approved column...");
      await db.execute("ALTER TABLE reviews ADD COLUMN approved INTEGER NOT NULL DEFAULT 0");
      console.log("   OK");
    } else {
      console.log("6. approved column already exists");
    }
    
    // Try SELECT with approved
    console.log("\n7. Testing SELECT reviews...");
    const revRes = await db.execute("SELECT COUNT(*) AS cnt FROM reviews");
    console.log("   Total reviews:", revRes.rows[0].cnt);
  } else {
    console.log("   reviews table does not exist");
  }

  console.log("\n✅ All checks passed!");
} catch (err) {
  console.error("\n❌ FAILED:", err.message);
  process.exit(1);
}
