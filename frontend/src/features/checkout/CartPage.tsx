// Cart review before checkout.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../shared/api/client";
import type { PublicSettings } from "../../shared/api/types";
import { formatMoney, productName } from "../../shared/i18n";
import { useShop } from "../../shared/shop/ShopContext";
import { SiteHeader } from "../../shared/ui/SiteHeader";
import "./checkout.css";

export function CartPage() {
  const { t, locale, cart, updateQty, removeFromCart, cartTotalCents } = useShop();
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    apiGet<PublicSettings>("/api/settings/public")
      .then((s) => setStoreName(s.store_name))
      .catch(() => undefined);
  }, []);

  const currency = cart[0]?.product.currency ?? "CAD";

  return (
    <div className="page">
      <SiteHeader storeName={storeName} />
      <main className="cart-page">
        <h1>{t.cart}</h1>
        {cart.length === 0 ? (
          <div className="cart-page__empty">
            <p>{t.emptyCart}</p>
            <Link to="/">{t.continueShopping}</Link>
          </div>
        ) : (
          <>
            <ul className="cart-page__list">
              {cart.map((item) => (
                <li key={item.product.id}>
                  <div className="cart-page__thumb">
                    {item.product.image_data ? (
                      <img
                        src={item.product.image_data}
                        alt={productName(item.product, locale)}
                      />
                    ) : (
                      <div className="cart-page__ph" />
                    )}
                  </div>
                  <div className="cart-page__meta">
                    <h2>{productName(item.product, locale)}</h2>
                    <p>
                      {formatMoney(item.product.price_cents, item.product.currency, locale)}
                    </p>
                    <label>
                      {t.qty}
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={item.qty}
                        onChange={(e) =>
                          updateQty(item.product.id, Number(e.target.value) || 1)
                        }
                      />
                    </label>
                    <button type="button" onClick={() => removeFromCart(item.product.id)}>
                      {t.remove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-page__summary">
              <p>
                {t.subtotal}: {formatMoney(cartTotalCents, currency, locale)}
              </p>
              <Link className="cart-page__cta" to="/checkout">
                {t.proceedCheckout}
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
