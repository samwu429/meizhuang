// Product detail: large image, description, quantity, and cart actions.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProduct, apiGet } from "../../shared/api/client";
import type { Product, PublicSettings } from "../../shared/api/types";
import { formatMoney, productDescription, productName } from "../../shared/i18n";
import { useShop } from "../../shared/shop/ShopContext";
import { SiteFooter } from "../../shared/ui/SiteFooter";
import { SiteHeader } from "../../shared/ui/SiteHeader";
import "./ProductDetailPage.css";

export function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { t, locale, addToCart } = useShop();
  const [product, setProduct] = useState<Product | null>(null);
  const [storeName, setStoreName] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    apiGet<PublicSettings>("/api/settings/public")
      .then((s) => setStoreName(s.store_name))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setMissing(false);
      try {
        const id = Number(productId);
        if (!Number.isFinite(id)) {
          if (!cancelled) setMissing(true);
          return;
        }
        const found = await fetchProduct(id);
        if (!cancelled) {
          if (!found || !found.is_active) setMissing(true);
          else setProduct(found);
        }
      } catch {
        if (!cancelled) setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  function onAdd() {
    if (!product) return;
    addToCart(product, qty);
  }

  function onBuyNow() {
    if (!product) return;
    addToCart(product, qty);
    navigate("/checkout");
  }

  return (
    <div className="page">
      <SiteHeader storeName={storeName} />
      <main className="page__main detail">
        <div className="detail__inner">
          <Link className="detail__back" to="/">
            {t.backToShop}
          </Link>

          {loading ? <p className="muted">{t.loading}</p> : null}
          {missing ? <p className="error">{t.productNotFound}</p> : null}

          {product ? (
            <div className="detail__layout">
              <div className="detail__media">
                {product.image_data ? (
                  <img src={product.image_data} alt={productName(product, locale)} />
                ) : (
                  <div className="detail__placeholder" aria-hidden />
                )}
              </div>
              <div className="detail__info">
                <h1>{productName(product, locale)}</h1>
                <p className="detail__price">
                  {formatMoney(product.price_cents, product.currency, locale)}
                </p>
                <p className="detail__desc">{productDescription(product, locale)}</p>

                <label className="detail__qty">
                  {t.qty}
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                  />
                </label>

                <div className="detail__actions">
                  <button type="button" className="btn btn--wide" onClick={onBuyNow}>
                    {t.buyNow}
                  </button>
                  <button type="button" className="btn btn--ghost btn--wide" onClick={onAdd}>
                    {t.addToCart}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
