export const PRODUCT_CATEGORIES = [
  "tv-units",
  "libraries",
  "shelves",
  "tables",
  "sofas",
  "rugs",
  "beds",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type Category = {
  slug: string;
  label: string;
};

export type Product = {
  id: string;
  title: string;
  category: ProductCategory;
  image_url: string;
  gallery: string[];
  current_price: number;
  original_price: number;
  discount_badge: string;
  rating: number;
  created_at: number;
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  image_url: string;
  content: string;
  created_at: number;
};

export const CATEGORY_LABEL: Record<string, string> = {
  "tv-units": "Meubles TV",
  libraries: "Bibliothèques",
  shelves: "Étagères",
  tables: "Tables",
  sofas: "Canapés",
  rugs: "Tapis",
  beds: "Lits",
};

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  title: string;
  quantity: number;
  unit_price: number;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total: number;
  status: OrderStatus;
  notes: string;
  created_at: number;
  item_count?: number;
};

export type OrderWithItems = Order & { items: OrderItem[] };

export type Review = {
  id: string;
  product_id: string;
  customer_id: string | null;
  order_id: string | null;
  customer_name: string;
  rating: number;
  title: string;
  body: string;
  verified_purchase: boolean;
  approved: boolean;
  created_at: number;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: number;
};
