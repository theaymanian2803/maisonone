import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  PRODUCT_CATEGORIES,
  CATEGORY_LABEL,
  type BlogPost,
  type Product,
  type ProductCategory,
  type Category,
} from "./catalog.types";

/* ---------- Fallback seed (used when Turso is not yet configured) ---------- */

const IMG = (id: string, w = 800, h = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const GALLERY = (...ids: string[]) => ids.map((id) => IMG(id, 800, 900));

const NOW = Math.floor(Date.now() / 1000);

const SEED_CATEGORIES: Category[] = PRODUCT_CATEGORIES.map((c) => ({
  slug: c,
  label: CATEGORY_LABEL[c],
}));

const SEED_PRODUCTS: Product[] = [
  {
    id: "s-tv-1",
    title: "Nordic Oak TV Console",
    category: "tv-units",
    image_url: IMG("photo-1616486338812-3dadae4b4ace"),
    gallery: GALLERY(
      "photo-1497366811353-6870744d04b2",
      "photo-1595515106969-4ce29557152a",
      "photo-1560448204-e02f11c3d0e2",
    ),
    current_price: 649,
    original_price: 819,
    discount_badge: "-20%",
    rating: 5,
    created_at: NOW,
  },
  {
    id: "s-tv-2",
    title: "Linear Media Cabinet",
    category: "tv-units",
    image_url: IMG("photo-1567016432779-094069958ea5"),
    gallery: GALLERY(
      "photo-1502005229762-cf1b2da7c5d6",
      "photo-1497366216548-37526070297c",
      "photo-1512917774080-9991f1c4c750",
    ),
    current_price: 529,
    original_price: 699,
    discount_badge: "-25%",
    rating: 4,
    created_at: NOW,
  },
  {
    id: "s-tv-3",
    title: "Floating Wall Unit",
    category: "tv-units",
    image_url: IMG("photo-1615873968403-89e068629265"),
    gallery: GALLERY(
      "photo-1479839672679-a46483c0e7c8",
      "photo-1497366811353-6870744d04b2",
      "photo-1544457070-4cd773b4d71e",
    ),
    current_price: 899,
    original_price: 1120,
    discount_badge: "-20%",
    rating: 5,
    created_at: NOW,
  },
  {
    id: "s-tv-4",
    title: "Studio TV Stand",
    category: "tv-units",
    image_url: IMG("photo-1595428774223-ef52624120d2"),
    gallery: GALLERY(
      "photo-1564078510393-c73293af07c9",
      "photo-1578302758063-5ef5e5a9f1c5",
      "photo-1586023495959-31065541db10",
    ),
    current_price: 379,
    original_price: 479,
    discount_badge: "-20%",
    rating: 4,
    created_at: NOW,
  },
  {
    id: "s-tb-1",
    title: "Round Marble Coffee Table",
    category: "tables",
    image_url: IMG("photo-1499933374294-4584851497cc"),
    gallery: GALLERY(
      "photo-1502005229762-cf1b2da7c5d6",
      "photo-1564078510393-c73293af07c9",
      "photo-1586105253276-1e4a70c6f5b5",
    ),
    current_price: 449,
    original_price: 599,
    discount_badge: "-25%",
    rating: 5,
    created_at: NOW,
  },
  {
    id: "s-tb-2",
    title: "Terra Oak Low Table",
    category: "tables",
    image_url: IMG("photo-1533090481720-856c6e3c1fdc"),
    gallery: GALLERY(
      "photo-1506439773649-6e0eb8cfb237",
      "photo-1595515106969-4ce29557152a",
      "photo-1573883431205-82b6f8ad2c50",
    ),
    current_price: 319,
    original_price: 399,
    discount_badge: "-20%",
    rating: 4,
    created_at: NOW,
  },
  {
    id: "s-tb-3",
    title: "Glass Nesting Set",
    category: "tables",
    image_url: IMG("photo-1493663284031-b7e3aefcae8e"),
    gallery: GALLERY(
      "photo-1497366216548-37526070297c",
      "photo-1512917774080-9991f1c4c750",
      "photo-1544457070-4cd773b4d71e",
    ),
    current_price: 289,
    original_price: 379,
    discount_badge: "-24%",
    rating: 4,
    created_at: NOW,
  },
  {
    id: "s-tb-4",
    title: "Sculpt Side Table",
    category: "tables",
    image_url: IMG("photo-1567538096630-e0c55bd6374c"),
    gallery: GALLERY(
      "photo-1479839672679-a46483c0e7c8",
      "photo-1560448204-e02f11c3d0e2",
      "photo-1556228578-0d85b1a4d571",
    ),
    current_price: 219,
    original_price: 279,
    discount_badge: "-22%",
    rating: 5,
    created_at: NOW,
  },
  {
    id: "s-rg-1",
    title: "Berber Wool Rug 200×290",
    category: "rugs",
    image_url: IMG("photo-1600166898405-da9535204843"),
    gallery: GALLERY(
      "photo-1584285405429-136bf988919c",
      "photo-1560448204-e02f11c3d0e2",
      "photo-1578302758063-5ef5e5a9f1c5",
    ),
    current_price: 349,
    original_price: 469,
    discount_badge: "-25%",
    rating: 5,
    created_at: NOW,
  },
  {
    id: "s-rg-2",
    title: "Muted Stripe Runner",
    category: "rugs",
    image_url: IMG("photo-1558618666-fcd25c85cd64"),
    gallery: GALLERY(
      "photo-1600166898405-da9535204843",
      "photo-1519710164239-da123dc03ef4",
      "photo-1586023495959-31065541db10",
    ),
    current_price: 189,
    original_price: 239,
    discount_badge: "-20%",
    rating: 4,
    created_at: NOW,
  },
  {
    id: "s-rg-3",
    title: "Sand Loop Pile Rug",
    category: "rugs",
    image_url: IMG("photo-1584285405429-136bf988919c"),
    gallery: GALLERY(
      "photo-1558618666-fcd25c85cd64",
      "photo-1600166898405-da9535204843",
      "photo-1519710164239-da123dc03ef4",
    ),
    current_price: 279,
    original_price: 359,
    discount_badge: "-22%",
    rating: 4,
    created_at: NOW,
  },
  {
    id: "s-rg-4",
    title: "Ivory Geometric Rug",
    category: "rugs",
    image_url: IMG("photo-1519710164239-da123dc03ef4"),
    gallery: GALLERY(
      "photo-1584285405429-136bf988919c",
      "photo-1558618666-fcd25c85cd64",
      "photo-1600166898405-da9535204843",
    ),
    current_price: 399,
    original_price: 519,
    discount_badge: "-23%",
    rating: 5,
    created_at: NOW,
  },
  {
    id: "s-sf-1",
    title: "Cloud 3-Seater Sofa",
    category: "sofas",
    image_url: IMG("photo-1555041469-a586c61ea9bc"),
    gallery: GALLERY(
      "photo-1493666438817-866a91353ca9",
      "photo-1540574163026-643ea20ade25",
      "photo-1506439773649-6e0eb8cfb237",
    ),
    current_price: 1499,
    original_price: 1899,
    discount_badge: "-21%",
    rating: 5,
    created_at: NOW,
  },
  {
    id: "s-sf-2",
    title: "Linden Boucle Loveseat",
    category: "sofas",
    image_url: IMG("photo-1493666438817-866a91353ca9"),
    gallery: GALLERY(
      "photo-1555041469-a586c61ea9bc",
      "photo-1567538096621-38d2284b23ff",
      "photo-1556228578-0d85b1a4d571",
    ),
    current_price: 1199,
    original_price: 1499,
    discount_badge: "-20%",
    rating: 5,
    created_at: NOW,
  },
  {
    id: "s-sf-3",
    title: "Modular Corner Sofa",
    category: "sofas",
    image_url: IMG("photo-1540574163026-643ea20ade25"),
    gallery: GALLERY(
      "photo-1555041469-a586c61ea9bc",
      "photo-1493666438817-866a91353ca9",
      "photo-1567538096621-38d2284b23ff",
    ),
    current_price: 1899,
    original_price: 2399,
    discount_badge: "-21%",
    rating: 4,
    created_at: NOW,
  },
  {
    id: "s-sf-4",
    title: "Terra Leather Armchair",
    category: "sofas",
    image_url: IMG("photo-1567538096621-38d2284b23ff"),
    gallery: GALLERY(
      "photo-1555041469-a586c61ea9bc",
      "photo-1540574163026-643ea20ade25",
      "photo-1502005229762-cf1b2da7c5d6",
    ),
    current_price: 799,
    original_price: 999,
    discount_badge: "-20%",
    rating: 5,
    created_at: NOW,
  },
];

const SEED_ARTICLES: BlogPost[] = [
  {
    id: "s-a-1",
    title: "Comment superposer les textures dans un salon moderne",
    excerpt:
      "Un guide rapide pour mélanger lin, laine et chêne sans perdre cette sensation aérienne et minimaliste que votre espace mérite.",
    image_url: IMG("photo-1616627561950-9f746e330187", 700, 500),
    content: "",
    created_at: NOW,
  },
  {
    id: "s-a-2",
    title: "Petite bibliothèque, grand impact : des étagères qui fonctionnent",
    excerpt:
      "Six agencements d'étagères qui transforment n'importe quel coin en un coin lecture réfléchi — sans travaux.",
    image_url: IMG("photo-1507473885765-e6ed057f782c", 700, 500),
    content: "",
    created_at: NOW,
  },
  {
    id: "s-a-3",
    title: "Choisir la bonne taille de tapis pour votre canapé",
    excerpt:
      "La règle empirique que les architectes d'intérieur utilisent réellement — plus les erreurs courantes qui rétrécissent visuellement votre pièce.",
    image_url: IMG("photo-1584285405429-136bf988919c", 700, 500),
    content: "",
    created_at: NOW,
  },
  {
    id: "s-a-4",
    title: "Minimalisme chaleureux : une palette pour chaque saison",
    excerpt:
      "Comment construire un intérieur qui semble à la fois actuel et habité avec une histoire de couleur serrée et discrètement confiante.",
    image_url: IMG("photo-1616486338812-3dadae4b4ace", 700, 500),
    content: "",
    created_at: NOW,
  },
];

/* ---------- Row mappers ---------- */

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

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    title: String(row.title),
    category: String(row.category) as ProductCategory,
    image_url: String(row.image_url),
    gallery: parseGallery(row.gallery),
    current_price: Number(row.current_price),
    original_price: Number(row.original_price),
    discount_badge: String(row.discount_badge),
    rating: Number(row.rating),
    created_at: Number(row.created_at),
  };
}

function toBlogPost(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id),
    title: String(row.title),
    excerpt: String(row.excerpt),
    image_url: String(row.image_url),
    content: String(row.content ?? ""),
    created_at: Number(row.created_at),
  };
}

/* ---------- Public read server functions ---------- */

export const getCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<Category[]> => {
    const { tursoConfigured, getDb, ensureSchema } = await import("./turso.server");
    if (!tursoConfigured()) return SEED_CATEGORIES;
    await ensureSchema();
    const res = await getDb().execute("SELECT slug, label FROM categories ORDER BY slug ASC");
    const rows = res.rows.map((r) => ({
      slug: String(r.slug),
      label: String(r.label),
    }));
    return rows.length > 0 ? rows : SEED_CATEGORIES;
  },
);

export const getAllProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    const { tursoConfigured, getDb, ensureSchema } = await import("./turso.server");
    if (!tursoConfigured()) return SEED_PRODUCTS;
    await ensureSchema();
    const res = await getDb().execute(
      "SELECT id, title, category, image_url, gallery, current_price, original_price, discount_badge, rating, created_at FROM products ORDER BY created_at DESC",
    );
    const rows = res.rows.map((r) => toProduct(r as unknown as Record<string, unknown>));
    return rows.length > 0 ? rows : SEED_PRODUCTS;
  },
);

export const getProductsByCategory = createServerFn({ method: "GET" })
  .validator((input: { category: string }) =>
    z.object({ category: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<Product[]> => {
    const { tursoConfigured, getDb, ensureSchema } = await import("./turso.server");
    if (!tursoConfigured()) {
      return SEED_PRODUCTS.filter((p) => p.category === data.category);
    }
    await ensureSchema();
    const res = await getDb().execute({
      sql: "SELECT id, title, category, image_url, gallery, current_price, original_price, discount_badge, rating, created_at FROM products WHERE category = ? ORDER BY created_at DESC",
      args: [data.category],
    });
    const rows = res.rows.map((r) => toProduct(r as unknown as Record<string, unknown>));
    return rows.length > 0 ? rows : SEED_PRODUCTS.filter((p) => p.category === data.category);
  });

export const getProductById = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<Product | null> => {
    const { tursoConfigured, getDb, ensureSchema } = await import("./turso.server");
    if (!tursoConfigured()) {
      return SEED_PRODUCTS.find((p) => p.id === data.id) ?? null;
    }
    await ensureSchema();
    const res = await getDb().execute({
      sql: "SELECT id, title, category, image_url, gallery, current_price, original_price, discount_badge, rating, created_at FROM products WHERE id = ?",
      args: [data.id],
    });
    if (res.rows.length === 0) {
      return SEED_PRODUCTS.find((p) => p.id === data.id) ?? null;
    }
    return toProduct(res.rows[0] as unknown as Record<string, unknown>);
  });

export const getLatestBlogPosts = createServerFn({ method: "GET" })
  .validator((input: { limit?: number } | undefined) =>
    z.object({ limit: z.number().int().min(1).max(50).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<BlogPost[]> => {
    const limit = data.limit ?? 4;
    const { tursoConfigured, getDb, ensureSchema } = await import("./turso.server");
    if (!tursoConfigured()) return SEED_ARTICLES.slice(0, limit);
    await ensureSchema();
    const res = await getDb().execute({
      sql: "SELECT id, title, excerpt, image_url, content, created_at FROM blog_posts ORDER BY created_at DESC LIMIT ?",
      args: [limit],
    });
    const rows = res.rows.map((r) => toBlogPost(r as unknown as Record<string, unknown>));
    return rows.length > 0 ? rows : SEED_ARTICLES.slice(0, limit);
  });

export const getBlogPostById = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<BlogPost | null> => {
    const { tursoConfigured, getDb, ensureSchema } = await import("./turso.server");
    if (!tursoConfigured()) {
      return SEED_ARTICLES.find((a) => a.id === data.id) ?? null;
    }
    await ensureSchema();
    const res = await getDb().execute({
      sql: "SELECT id, title, excerpt, image_url, content, created_at FROM blog_posts WHERE id = ?",
      args: [data.id],
    });
    if (res.rows.length === 0) {
      return SEED_ARTICLES.find((a) => a.id === data.id) ?? null;
    }
    return toBlogPost(res.rows[0] as unknown as Record<string, unknown>);
  });
