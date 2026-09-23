// Locale helpers for messages and bilingual product fields.
import en from "./en";
import zh, { type ShopMessages } from "./zh";
import type { Category, Locale, Product } from "../api/types";

const dictionaries: Record<Locale, ShopMessages> = { zh, en };

export function getMessages(locale: Locale): ShopMessages {
  return dictionaries[locale];
}

export function productName(product: Product, locale: Locale): string {
  if (locale === "en" && product.name_en.trim()) return product.name_en;
  return product.name_zh;
}

export function productDescription(product: Product, locale: Locale): string {
  if (locale === "en" && product.description_en.trim()) return product.description_en;
  return product.description_zh;
}

export function categoryName(category: Pick<Category, "name_zh" | "name_en">, locale: Locale): string {
  if (locale === "en" && category.name_en.trim()) return category.name_en;
  return category.name_zh;
}

export function formatMoney(cents: number, currency: string, locale: Locale): string {
  const value = cents / 100;
  try {
    return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-CA", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}
