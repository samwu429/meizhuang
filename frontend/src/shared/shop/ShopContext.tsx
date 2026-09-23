// Locale and shopping-cart context for storefront routes.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Locale, Product } from "../api/types";
import { getMessages } from "../i18n";
import type { ShopMessages } from "../i18n/zh";

interface ShopContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ShopMessages;
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  updateQty: (productId: number, qty: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotalCents: number;
}

const ShopContext = createContext<ShopContextValue | null>(null);

const LOCALE_KEY = "meizhuang_locale";

function readLocale(): Locale {
  const saved = localStorage.getItem(LOCALE_KEY);
  return saved === "en" ? "en" : "zh";
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale);
  const [cart, setCart] = useState<CartItem[]>([]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_KEY, next);
  }, []);

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: Math.min(99, item.qty + qty) }
            : item,
        );
      }
      return [...prev, { product, qty }];
    });
  }, []);

  const updateQty = useCallback((productId: number, qty: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.product.id === productId ? { ...item, qty } : item))
        .filter((item) => item.qty > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo<ShopContextValue>(() => {
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartTotalCents = cart.reduce(
      (sum, item) => sum + item.product.price_cents * item.qty,
      0,
    );
    return {
      locale,
      setLocale,
      t: getMessages(locale),
      cart,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotalCents,
    };
  }, [locale, setLocale, cart, addToCart, updateQty, removeFromCart, clearCart]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
