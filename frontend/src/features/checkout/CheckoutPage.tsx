// Checkout form capturing shipping details and submitting the order.
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../shared/api/client";
import type { Order, PublicSettings } from "../../shared/api/types";
import { formatMoney } from "../../shared/i18n";
import { useShop } from "../../shared/shop/ShopContext";
import { SiteHeader } from "../../shared/ui/SiteHeader";
import "./checkout.css";

export function CheckoutPage() {
  const { t, locale, cart, cartTotalCents, clearCart } = useShop();
  const navigate = useNavigate();
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

  if (cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const currency = cart[0].product.currency;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const order = await apiPost<Order>("/api/orders", {
        customer_name: name,
        phone,
        address,
        note,
        locale,
        items: cart.map((item) => ({
          product_id: item.product.id,
          qty: item.qty,
        })),
      });
      clearCart();
      sessionStorage.setItem(`order:${order.id}`, JSON.stringify(order));
      navigate(`/order/${order.id}`, { state: { order } });
    } catch {
      setError(t.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <SiteHeader storeName={storeName} />
      <main className="checkout-page">
        <h1>{t.checkout}</h1>
        <p className="muted">
          {t.subtotal}: {formatMoney(cartTotalCents, currency, locale)}
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
    </div>
  );
}
