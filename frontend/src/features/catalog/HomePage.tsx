// Home page: restrained hero and product grid.
import { useEffect, useState } from "react";
import { apiGet } from "../../shared/api/client";
import type { Product, PublicSettings } from "../../shared/api/types";
import { useShop } from "../../shared/shop/ShopContext";
import { SiteFooter } from "../../shared/ui/SiteFooter";
import { SiteHeader } from "../../shared/ui/SiteHeader";
import { ProductCard } from "./ProductCard";
import "./HomePage.css";

export function HomePage() {
  const { t } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catalog, publicSettings] = await Promise.all([
          apiGet<Product[]>("/api/products"),
          apiGet<PublicSettings>("/api/settings/public"),
        ]);
        if (!cancelled) {
          setProducts(catalog);
          setSettings(publicSettings);
        }
      } catch {
        if (!cancelled) setError(t.error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t.error]);

  return (
    <div className="page">
      <SiteHeader storeName={settings?.store_name ?? ""} />
      <div className="page__main">
        <section className="hero">
          <div className="hero__content">
            {settings?.store_name?.trim() ? (
              <p className="hero__brand">{settings.store_name}</p>
            ) : null}
            <h1>{t.heroHeadline}</h1>
            <p className="hero__sub">{t.heroSub}</p>
            <a className="hero__cta" href="#catalog">
              {t.shopNow}
            </a>
          </div>
        </section>

        <main id="catalog" className="catalog">
          <div className="catalog__inner">
            <div className="catalog__head">
              <h2>{t.allProducts}</h2>
              {!loading && !error ? (
                <span className="catalog__count">{products.length}</span>
              ) : null}
            </div>

            {loading ? <p className="catalog__status muted">{t.loading}</p> : null}
            {error ? <p className="catalog__status error">{error}</p> : null}
            {!loading && !error && products.length === 0 ? (
              <p className="catalog__status muted">{t.emptyCatalog}</p>
            ) : null}

            <div className="catalog__grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
