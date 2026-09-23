// Shared TypeScript types mirroring backend API contracts.
export type Locale = "zh" | "en";

export interface Product {
  id: number;
  name_zh: string;
  name_en: string;
  description_zh: string;
  description_en: string;
  price_cents: number;
  currency: string;
  image_data: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface PublicSettings {
  store_name: string;
  wechat_qr_image: string | null;
  etransfer_email: string;
  etransfer_note: string;
}

export interface OrderItem {
  product_id: number;
  name_zh: string;
  name_en: string;
  qty: number;
  price_cents: number;
  currency: string;
}

export interface Order {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  note: string;
  items: OrderItem[];
  status: string;
  archived: boolean;
  locale: string;
  total_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSettings extends PublicSettings {
  id: number;
  updated_at: string;
}
