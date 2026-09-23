// Checkout form capturing shipping details and submitting the order.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import { apiGet, apiPost } from "../../shared/api/client";
import type { CartItem, Order, PublicSettings } from "../../shared/api/types";
import { formatMoney } from "../../shared/i18n";
import { useShop } from "../../shared/shop/ShopContext";
import { SiteFooter } from "../../shared/ui/SiteFooter";
import { SiteHeader } from "../../shared/ui/SiteHeader";
import "./checkout.css";

interface CheckoutLocationState {
  seedCart?: CartItem[];
}

export function CheckoutPage() {
  const { t, locale, cart, cartTotalCents, clearCart, replaceCart } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const seedCart = (location.state as CheckoutLocationState | null)?.seedCart;
  const leavingRef = useRef(false);
  const seededRef = useRef(false);
  const [storeName, setStoreName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<PublicSettings>("/api/settings/public")
      .then((s) => setStoreName(s.store_name))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (seededRef.current) return;
    if (seedCart && seedCart.length > 0) {
      seededRef.current = true;
      replaceCart(seedCart);
      navigate(".", { replace: true, state: null });
    }
  }, [seedCart, replaceCart, navigate]);

  const activeCart = cart.length > 0 ? cart : seedCart ?? [];

  if (activeCart.length === 0 && !leavingRef.current) {
    return <Navigate to="/cart" replace />;
  }

  const currency = activeCart[0]?.product.currency ?? "CAD";
  const totalCents =
    cart.length > 0
      ? cartTotalCents
      : activeCart.reduce((sum, item) => sum + item.product.price_cents * item.qty, 0);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (activeCart.length === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const order = await apiPost<Order>("/api/orders", {
        customer_name: name,
        phone,
        address,
        note,
        locale,
        items: activeCart.map((item) => ({
          product_id: item.product.id,
          qty: item.qty,
        })),
      });
      sessionStorage.setItem(`order:${order.id}`, JSON.stringify(order));
      // Prevent empty-cart redirect from winning the race against payment navigation.
      // 避免清空购物车后的重定向抢在收款页跳转之前执行。
      leavingRef.current = true;
      flushSync(() => {
        clearCart();
      });
      navigate(`/order/${order.id}`, { state: { order }, replace: true });
    } catch {
      leavingRef.current = false;
      setError(t.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <SiteHeader storeName={storeName} />
      <main className="page__main checkout-page">
        <h1>{t.checkout}</h1>
        <p className="muted">
          {t.subtotal}: {formatMoney(totalCents, currency, locale)}
        </p>
        <form onSubmit={onSubmit}>
          <label>
            {t.name}
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            {t.phone}
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label>
            {t.address}
            <textarea required value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label>
            {t.note}
            <textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" disabled={submitting}>
            {submitting ? t.submitting : t.placeOrder}
          </button>
        </form>
        <p style={{ marginTop: "1rem" }}>
          <Link to="/cart">{t.cart}</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
