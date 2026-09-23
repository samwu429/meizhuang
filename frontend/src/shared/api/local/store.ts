// LocalStorage persistence for static GitHub Pages deploys (no backend required).
import type {
  AdminSettings,
  Order,
  OrderItem,
  Product,
  PublicSettings,
} from "../types";

const PRODUCTS_KEY = "meizhuang_products_v1";
const ORDERS_KEY = "meizhuang_orders_v1";
const SETTINGS_KEY = "meizhuang_settings_v1";
const SEQ_KEY = "meizhuang_seq_v1";

const SEED_PRODUCTS: Product[] = [
  {
    id: 1,
    name_zh: "\u6c34\u6da6\u7cbe\u534e\u9762\u971c",
    name_en: "Hydrating Essence Cream",
    description_zh:
      "\u8f7b\u76c8\u8d28\u5730\uff0c\u9002\u5408\u5e72\u71e5\u808c\u80a4\u7684\u65e5\u5e38\u4fdd\u6e7f\u3002",
    description_en: "Lightweight daily moisturizer for dry skin.",
    price_cents: 4599,
    currency: "CAD",
    image_data: null,
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    name_zh: "\u6e29\u67d4\u6d01\u9762\u6ce1\u6cab",
    name_en: "Gentle Foaming Cleanser",
    description_zh:
      "\u4f4e\u523a\u6fc0\u6ce1\u6cab\u6d01\u9762\uff0c\u6d17\u540e\u4e0d\u7d27\u7ef7\u3002",
    description_en: "Low-irritation foaming cleanser that leaves skin soft.",
    price_cents: 2899,
    currency: "CAD",
    image_data: null,
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    name_zh: "\u4eae\u6cfd\u5507\u91c9",
    name_en: "Glossy Lip Tint",
    description_zh:
      "\u534a\u900f\u660e\u6c34\u6da6\u8272\u6cfd\uff0c\u65e5\u5e38\u4e0e\u7ea6\u4f1a\u7686\u5b9c\u3002",
    description_en: "Sheer glossy tint for everyday and evening looks.",
    price_cents: 2499,
    currency: "CAD",
    image_data: null,
    is_active: true,
    sort_order: 3,
  },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextId(kind: "product" | "order"): number {
  const seq = readJson<Record<string, number>>(SEQ_KEY, { product: 3, order: 0 });
  seq[kind] = (seq[kind] ?? 0) + 1;
  writeJson(SEQ_KEY, seq);
  return seq[kind];
}

function ensureProducts(): Product[] {
  const existing = readJson<Product[] | null>(PRODUCTS_KEY, null);
  if (existing && existing.length > 0) return existing;
  writeJson(PRODUCTS_KEY, SEED_PRODUCTS);
  return SEED_PRODUCTS;
}

function ensureSettings(): AdminSettings {
  const existing = readJson<AdminSettings | null>(SETTINGS_KEY, null);
  if (existing) return existing;
  const row: AdminSettings = {
    id: 1,
    store_name: "",
    wechat_qr_image: null,
    etransfer_email: "",
    etransfer_note: "",
    updated_at: new Date().toISOString(),
  };
  writeJson(SETTINGS_KEY, row);
  return row;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const localApi = {
  listPublicProducts(): Product[] {
    return ensureProducts()
      .filter((p) => p.is_active)
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  },

  listAdminProducts(): Product[] {
    return ensureProducts().sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  },

  createProduct(payload: Omit<Product, "id">): Product {
    const products = ensureProducts();
    const product: Product = { ...payload, id: nextId("product") };
    products.push(product);
    writeJson(PRODUCTS_KEY, products);
    return product;
  },

  updateProduct(id: number, patch: Partial<Product>): Product {
    const products = ensureProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Not found");
    products[idx] = { ...products[idx], ...patch, id };
    writeJson(PRODUCTS_KEY, products);
    return products[idx];
  },

  deleteProduct(id: number): void {
    writeJson(
      PRODUCTS_KEY,
      ensureProducts().filter((p) => p.id !== id),
    );
  },

  getPublicSettings(): PublicSettings {
    const s = ensureSettings();
    return {
      store_name: s.store_name,
      wechat_qr_image: s.wechat_qr_image,
      etransfer_email: s.etransfer_email,
      etransfer_note: s.etransfer_note,
    };
  },

  getAdminSettings(): AdminSettings {
    return ensureSettings();
  },

  updateSettings(patch: Partial<PublicSettings>): AdminSettings {
    const current = ensureSettings();
    const next: AdminSettings = {
      ...current,
      ...patch,
      id: 1,
      updated_at: nowIso(),
    };
    writeJson(SETTINGS_KEY, next);
    return next;
  },

  createOrder(input: {
    customer_name: string;
    phone: string;
    address: string;
    note: string;
    locale: string;
    items: { product_id: number; qty: number }[];
  }): Order {
    const catalog = ensureProducts();
    const lines: OrderItem[] = [];
    let total = 0;
    let currency = "CAD";
    for (const line of input.items) {
      const product = catalog.find((p) => p.id === line.product_id && p.is_active);
      if (!product) throw new Error(`Product ${line.product_id} unavailable`);
      total += product.price_cents * line.qty;
      currency = product.currency;
      lines.push({
        product_id: product.id,
        name_zh: product.name_zh,
        name_en: product.name_en,
        qty: line.qty,
        price_cents: product.price_cents,
        currency: product.currency,
      });
    }
    const stamp = nowIso();
    const order: Order = {
      id: nextId("order"),
      customer_name: input.customer_name.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      note: input.note.trim(),
      items: lines,
      status: "pending",
      locale: input.locale,
      total_cents: total,
      currency,
      created_at: stamp,
      updated_at: stamp,
    };
    const orders = readJson<Order[]>(ORDERS_KEY, []);
    orders.unshift(order);
    writeJson(ORDERS_KEY, orders);
    return order;
  },

  listOrders(): Order[] {
    return readJson<Order[]>(ORDERS_KEY, []);
  },

  updateOrderStatus(id: number, status: string): Order {
    const orders = readJson<Order[]>(ORDERS_KEY, []);
    const idx = orders.findIndex((o) => o.id === id);
    if (idx < 0) throw new Error("Not found");
    orders[idx] = { ...orders[idx], status, updated_at: nowIso() };
    writeJson(ORDERS_KEY, orders);
    return orders[idx];
  },

  login(password: string): string {
    const expected =
      (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined)?.trim() || "admin123";
    if (password !== expected) throw new Error("Invalid password");
    return `local.${btoa(String(Date.now()))}`;
  },
};

export function isLocalMode(): boolean {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  return !base;
}
